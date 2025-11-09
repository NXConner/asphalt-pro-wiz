# Load Testing Playbooks

The project ships with k6 and Artillery scenarios that exercise the public entry points and mission-control surfaces of Pavement Performance Suite.

## k6 – observability beacon ingestion

```bash
# Default targets local Supabase edge function (http://localhost:54321)
LOG_BEACON_URL=https://YOUR_SUPABASE_URL/functions/v1/log-beacon \
LOG_BEACON_TOKEN=YOUR_JWT_OR_ANON_KEY \
npx k6 run scripts/load/k6-observability.js
```

This profile exercises the `log-beacon` Supabase Function with synthetic `lovable.asset_*` events:

- Ramps to ~25 virtual users (configurable via `STAGE_MULTIPLIER`)
- Tracks ingestion latency (`log_beacon.ingest_duration`) and validation failures
- Generates unique sessions/device IDs to mimic browser telemetry flood conditions

Environment knobs:

- `LOG_BEACON_URL` – fully qualified edge function endpoint.
- `LOG_BEACON_TOKEN` – JWT/anon key used for authorization.
- `STAGE_MULTIPLIER` – scale virtual user counts & stage durations.

> Tip: Combine with Supabase Edge Function logs to confirm the incidents table and telemetry roll-ups remain healthy under pressure.

## k6 – Gemini Proxy Chat Assist

```bash
GEMINI_PROXY_URL=https://YOUR_SUPABASE_URL/functions/v1/gemini-proxy \
GEMINI_PROXY_TOKEN=SUPABASE_SERVICE_OR_ANON_JWT \
GEMINI_PROMPT="Summarize church sealcoating scope best practices." \
npx k6 run scripts/load/k6-gemini-proxy.js
```

This scenario mirrors real AI scope assist bursts:

- Exercises the authenticated `gemini-proxy` Supabase Edge Function.
- Sends repeat chat prompts with configurable prose (`GEMINI_PROMPT`).
- Tracks `gemini_chat_duration` trend and success rate (`gemini_chat_success`) with a p95 < 1.2 s threshold.

> Tip: Start with low ramp values, then scale `maxVUs` or adjust the staged target to validate rate limiting and external API quotas.

## k6 – mission scheduler smoke + ramp

```bash
# Install k6 if it is not already available locally
brew install k6 # macOS (or see https://k6.io/docs/get-started/installation/)

# Run against a local dev server (default is http://localhost:5173)
BASE_URL=http://localhost:5173 npx k6 run scripts/load/k6-estimate.js

# Example: hit a deployed preview
BASE_URL=https://pavement-preview.example.com npx k6 run scripts/load/k6-estimate.js
```

The scenario ramps traffic up to ~20 requests/sec, and records:

- `successful_requests` rate (should remain >97%)
- `http_req_duration` p95 / p99 thresholds (keep <800ms / <1200ms)
- `content_validation_failures` counter (should stay at 0)

Targets covered:

1. `/auth` – verifies that the authentication surface renders successfully.
2. `/` – confirms the app shell or redirect logic responds within budget.
3. `/command-center` – warms mission dashboards to capture cold-start behaviour.
4. `/robots.txt` – ensures static assets flow while the system is under load.

Tune the arrival profile with environment variables:

- `BASE_URL` – origin to exercise (default `http://localhost:5173`).
- `STAGE_MULTIPLIER` – optionally override intensity (e.g. `STAGE_MULTIPLIER=3`).

> Tip: k6 emits a `content_validation_failures` counter when HTML checks fail. Use the `--summary-export` flag to capture JSON output for CI artefacts.

## Artillery – quick pulse for CI

```bash
npx artillery run scripts/load/artillery.yml
```

The Artillery scenario performs the same sequence (`/auth`, `/`, `/command-center`, `/robots.txt`) with a lighter 2-minute pulse suitable for smoke checks or container health probes.

## Operational Guidance

- Run the k6 plans during performance tuning or before major releases.
- Export k6 summaries (`--summary-export`) and attach to CI artefacts for trend analysis.
- Surface results in CI (GitHub Actions, etc.) using `--summary-export` and upload the artefacts.
- For authenticated flows, supply a session cookie via `BASE_HEADERS` (see k6 docs) once Supabase auth automation is available.
- Combine with the Playwright scheduler e2e (`npm run test:e2e -- scheduler`) to validate end-to-end readiness post load.
