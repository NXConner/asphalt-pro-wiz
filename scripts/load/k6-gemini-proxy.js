import http from 'k6/http';
import { Trend, Rate } from 'k6/metrics';
import { check, fail, sleep } from 'k6';

const GEMINI_PROXY_URL =
  __ENV.GEMINI_PROXY_URL || 'http://localhost:54321/functions/v1/gemini-proxy';
const GEMINI_PROXY_TOKEN = __ENV.GEMINI_PROXY_TOKEN || '';
const PROMPT =
  __ENV.GEMINI_PROMPT ||
  'Summarize the critical sealcoating scope for a 25,000 sq ft church parking lot in 3 bullet points.';

if (!GEMINI_PROXY_TOKEN) {
  fail('GEMINI_PROXY_TOKEN environment variable must be provided for authenticated load.');
}

export const options = {
  scenarios: {
    chat_burst: {
      executor: 'ramping-arrival-rate',
      startRate: 2,
      timeUnit: '1s',
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: [
        { duration: '30s', target: 5 },
        { duration: '60s', target: 15 },
        { duration: '30s', target: 3 },
        { duration: '15s', target: 0 },
      ],
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<1200'],
    gemini_chat_success: ['rate>0.95'],
  },
};

const responseDuration = new Trend('gemini_chat_duration', true);
const chatSuccess = new Rate('gemini_chat_success');

export default function () {
  const payload = JSON.stringify({
    action: 'chat',
    contents: [
      {
        parts: [
          {
            text: PROMPT,
          },
        ],
      },
    ],
  });

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${GEMINI_PROXY_TOKEN}`,
  };

  const res = http.post(GEMINI_PROXY_URL, payload, { headers });
  responseDuration.add(res.timings.duration);

  const passed = check(res, {
    'status 200': (r) => r.status === 200,
    'json text present': (r) => {
      try {
        const parsed = r.json();
        return typeof parsed?.text === 'string' && parsed.text.length > 0;
      } catch (error) {
        return false;
      }
    },
  });

  chatSuccess.add(passed);
  sleep(1);
}
