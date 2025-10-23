import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  const res = http.get(__ENV.BASE_URL || 'http://localhost:8080');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'loads main app': (r) => r.body.includes('CONNER Asphalt Estimator'),
  });
  sleep(1);
}
