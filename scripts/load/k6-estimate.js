import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 10 },
    { duration: '20s', target: 25 },
    { duration: '10s', target: 0 },
  ],
};

export default function () {
  const base = __ENV.BASE_URL || 'http://localhost:8080';
  const res = http.get(base);
  check(res, {
    'status is 200': (r) => r.status === 200,
    'loads main app': (r) => r.body.includes('CONNER Asphalt Estimator'),
  });
  sleep(1);
}
