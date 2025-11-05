import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:5173';
const STAGE_MULTIPLIER = Math.max(1, Number(__ENV.STAGE_MULTIPLIER || '1'));

function scaleTarget(value) {
  return Math.max(1, Math.round(value * STAGE_MULTIPLIER));
}

const stagedRamp = [
  { duration: '30s', target: scaleTarget(10) },
  { duration: '1m', target: scaleTarget(20) },
  { duration: '30s', target: scaleTarget(5) },
  { duration: '20s', target: 0 },
];

export const options = {
  scenarios: {
    mission_control_public: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1s',
      preAllocatedVUs: 20,
      maxVUs: 50,
      stages: stagedRamp,
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<800', 'p(99)<1200'],
    successful_requests: ['rate>0.97'],
    content_validation_failures: ['count<1'],
  },
};

const successfulRequests = new Rate('successful_requests');
const requestDuration = new Trend('request_duration', true);
const contentValidationFailures = new Counter('content_validation_failures');

function hit(path, { name, validators = {} }) {
  const response = http.get(`${BASE_URL}${path}`, {
    tags: { name, path },
  });

  requestDuration.add(response.timings.duration, { name, path });

  const checks = {
    [`${name} status ok`]: (r) => [200, 301, 302].includes(r.status),
    ...validators,
  };

  const passed = check(response, checks);
  successfulRequests.add(passed ? 1 : 0, { name, path });

  if (!passed) {
    contentValidationFailures.add(1, {
      name,
      path,
      status: response.status,
    });
  }

  return response;
}

export default function () {
  group('Public entry points', () => {
    hit('/auth', {
      name: 'auth_page',
      validators: {
        'auth markup rendered': (r) => r.body?.includes('Sign in') || r.body?.includes('Log in'),
      },
    });

    const landing = hit('/', {
      name: 'landing_page',
      validators: {
        'redirects to auth or renders shell': (r) => {
          if (r.status === 302 || r.status === 301) {
            const location = r.headers.Location || r.headers.location || '';
            return location.includes('/auth');
          }
          return (
            r.body?.includes('Pavement Performance Suite') || r.body?.includes('Mission Footprint')
          );
        },
      },
    });

    if (landing.status === 302 || landing.status === 301) {
      hit('/auth', { name: 'landing_follow_up' });
    }
  });

  group('Command Center overview', () => {
    hit('/command-center', {
      name: 'command_center_page',
      validators: {
        'html response': (r) => (r.headers['Content-Type'] || '').includes('text/html'),
      },
    });
  });

  group('Static assets', () => {
    hit('/robots.txt', {
      name: 'robots_txt',
      validators: {
        'robots served': (r) => r.status === 200,
      },
    });
  });

  sleep(1);
}
