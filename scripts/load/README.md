# Load Testing Playbooks

The project ships with k6 and Artillery scenarios that exercise the public entry points and mission-control surfaces of Pavement Performance Suite.

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

- Run the k6 plan during performance tuning or before major releases.
- Surface results in CI (GitHub Actions, etc.) using `--summary-export` and upload the artefacts.
- For authenticated flows, supply a session cookie via `BASE_HEADERS` (see k6 docs) once Supabase auth automation is available.
- Combine with the Playwright scheduler e2e (`npm run test:e2e -- scheduler`) to validate end-to-end readiness post load.
