import http from 'k6/http';
import { check, sleep } from 'k6';
import { Counter, Trend } from 'k6/metrics';

const BEACON_URL =
  __ENV.LOG_BEACON_URL ??
  'http://localhost:54321/functions/v1/log-beacon';

const AUTH_TOKEN =
  __ENV.LOG_BEACON_TOKEN ??
  __ENV.SUPABASE_ANON_KEY ??
  '';

const STAGE_MULTIPLIER = Number(__ENV.STAGE_MULTIPLIER ?? 1);

export const options = {
  thresholds: {
    http_req_failed: ['rate<0.02'],
    http_req_duration: ['p(95)<500', 'p(99)<900'],
    'log_beacon.ingest_duration': ['p(95)<250'],
    'log_beacon.validation_errors': ['count==0'],
  },
  stages: [
    { duration: `${10 * STAGE_MULTIPLIER}s`, target: 10 * STAGE_MULTIPLIER },
    { duration: `${30 * STAGE_MULTIPLIER}s`, target: 25 * STAGE_MULTIPLIER },
    { duration: `${10 * STAGE_MULTIPLIER}s`, target: 0 },
  ],
};

const ingestDuration = new Trend('log_beacon.ingest_duration');
const validationErrors = new Counter('log_beacon.validation_errors');

function makePayload() {
  const now = Date.now();
  const sessionId = `k6-session-${now}-${__ITER}`;
  const deviceId = `k6-device-${Math.random().toString(16).slice(2, 10)}`;

  return [
    {
      event: 'lovable.asset_load_error',
      level: 'error',
      assetUrl: `https://assets.example.com/app-${__VU}.js`,
      assetTag: 'script',
      pageUrl: 'https://preview.lovable.dev/command-center',
      reason: 'k6 synthetic load',
      timestamp: now,
      sessionId,
      deviceId,
      environment: 'loadtest',
      metadata: {
        synthetic: true,
        worker: __VU,
        iteration: __ITER,
      },
    },
    {
      event: 'lovable.asset_promise_rejection',
      level: 'warn',
      reason: 'synthetic promise rejection',
      timestamp: now,
      sessionId,
      deviceId,
      environment: 'loadtest',
    },
  ];
}

export default function run() {
  const payload = makePayload();
  const headers = {
    'Content-Type': 'application/json',
    Authorization: AUTH_TOKEN ? `Bearer ${AUTH_TOKEN}` : '',
  };

  const res = http.post(BEACON_URL, JSON.stringify(payload), { headers });
  ingestDuration.add(res.timings.duration);

  const ok = check(res, {
    'status 200': (r) => r.status === 200,
    'ingested count': (r) => Number(r.json('ingested') ?? 0) === payload.length,
  });

  if (!ok) {
    validationErrors.add(1);
  }

  sleep(1);
}
