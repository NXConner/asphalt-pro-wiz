import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const PREVIEW_HEALTH_URL = __ENV.PREVIEW_HEALTH_URL || 'http://localhost:8080/health';
const PREVIEW_HEALTH_STATUS = Number(__ENV.PREVIEW_HEALTH_STATUS || '200');
const STAGE_MULTIPLIER = Math.max(1, Number(__ENV.STAGE_MULTIPLIER || '1'));

function scaleTarget(value) {
  return Math.max(1, Math.round(value * STAGE_MULTIPLIER));
}

const ramp = [
  { duration: '20s', target: scaleTarget(5) },
  { duration: '1m', target: scaleTarget(15) },
  { duration: '20s', target: scaleTarget(2) },
  { duration: '10s', target: 0 },
];

export const options = {
  scenarios: {
    preview_health: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 40,
      stages: ramp,
    },
  },
  thresholds: {
    preview_health_latency: ['p(95)<500', 'p(99)<800'],
    preview_health_failures: ['count<1'],
  },
};

const latency = new Trend('preview_health_latency', true);
const failures = new Counter('preview_health_failures');

export default function previewHealthScenario() {
  const response = http.get(PREVIEW_HEALTH_URL, { tags: { name: 'preview_health' } });
  latency.add(response.timings.duration);

  const ok = check(response, {
    'status ok': (r) => r.status === PREVIEW_HEALTH_STATUS,
    'payload healthy': (r) => {
      try {
        const payload = r.json();
        if (!payload) return true;
        if (typeof payload === 'object') {
          if (payload.status) {
            return ['ok', 'healthy', 'pass'].includes(String(payload.status).toLowerCase());
          }
          if (payload.message) {
            return !String(payload.message).toLowerCase().includes('error');
          }
        }
        return true;
      } catch {
        return true;
      }
    },
  });

  if (!ok) {
    failures.add(1, {
      status: response.status,
      duration: response.timings.duration,
    });
  }

  sleep(1);
}

