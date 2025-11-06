# Pavement Performance Suite

AI-assisted operations command center purpose-built for asphalt paving, sealcoating, and line-striping crews supporting Virginia and North Carolina church campuses. The suite covers estimation, mission scheduling, compliance automation, and observability from a single Division-inspired HUD.

---

## Table of Contents

1. [Feature Highlights](#feature-highlights)
2. [Architecture](#architecture)
3. [Quickstart](#quickstart)
4. [Environment & Secrets](#environment--secrets)
5. [Core Workflows](#core-workflows)
6. [Quality Gates](#quality-gates)
7. [API & Edge Functions](#api--edge-functions)
8. [Load & Performance Testing](#load--performance-testing)
9. [Deployment Targets](#deployment-targets)
10. [Contribution Checklist](#contribution-checklist)
11. [Reference Docs](#reference-docs)
12. [License](#license)

---

## Feature Highlights

- **Estimator Studio** – multi-step cost modelling with AI-assisted scenarios, compliance guardrails, and offline resilience.
- **Mission Scheduler** – crew-aware timeline with blackout windows for worship services, ADA alerts, and staffing analytics.
- **Command Center** – live mission telemetry, revenue dashboards, and Supabase-backed data views.
- **Observability & AI** – Gemini proxy via Supabase Edge Functions, log beacons, and structured monitoring hooks.
- **Mobile Readiness** – Capacitor Android shell plus responsive HUD designed for field teams.

---

## Architecture

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, `react-grid-layout`.
- **State/Data**: React Query, IndexedDB caching, feature flags, Supabase client.
- **Edge Functions**: `gemini-proxy` (AI gateway) and `log-beacon` (telemetry ingress) documented in `docs/swagger.json`.
- **Tooling**: ESLint, Prettier, Husky + lint-staged, Vitest, Playwright, k6, Artillery.
- **Mobile**: Capacitor shell for Android packaging.

---

## Quickstart

```bash
# 1. Clone
git clone https://github.com/continue-repo/pavement-performance-suite.git
cd pavement-performance-suite

# 2. Configure environment
cp .env.example .env   # edit with real secrets (no placeholders)

# 3. Install tooling (PowerShell users run the .ps1 equivalent)
scripts/install_dependencies.sh
#  --skip-playwright   # avoid browser downloads in CI containers
#  --skip-husky        # disable git hooks for read-only runners

# 4. Run dev server (refresh existing preview)
npm run dev

# 5. Prime Supabase (optional)
npm run migrate:up
npm run seed
```

> **Windows**: Follow `docs/WINDOWS_SETUP.md` for shell-specific flags, PostgreSQL provisioning, and Playwright dependencies.

---

## Environment & Secrets

- `.env` keys (see template):
  - Deployment metadata: `APP_ENV`, `VITE_ENVIRONMENT`, `VITE_APP_VERSION`, `VITE_BASE_PATH`, `VITE_BASE_URL`
  - Supabase: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PROJECT_REF`, `DATABASE_URL`
  - AI proxy: `VITE_GEMINI_PROXY_URL`, `VITE_GEMINI_API_KEY`, `GEMINI_API_KEY`, `LOVABLE_API_KEY`
  - Observability: `VITE_LOG_BEACON_URL`, `VITE_OBSERVABILITY_EXPORTER_URL`, `OBSERVABILITY_API_KEY`, `VITE_SENTRY_DSN`, `VITE_OBSERVABILITY_SAMPLE_RATE`, `VITE_ENABLE_WEB_VITALS`, `VITE_ENABLE_FEATURE_TELEMETRY`
  - Mapping & weather: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_OPENWEATHER_API_KEY`, `VITE_MAPBOX_TOKEN`, `VITE_AIR_QUALITY_API_KEY`
  - Optional ingest: `GITHUB_TOKEN`
  - Feature flags: `VITE_FLAG_*` overrides (`AIASSISTANT`, `SCHEDULER`, etc.)
- Feature flags (1/0): `VITE_FLAG_COMMANDCENTER`, `VITE_FLAG_SCHEDULER`, `VITE_FLAG_OBSERVABILITY`, etc.
- Supabase bootstrapping, RLS, and seed workflows: `docs/UNIFIED_SUPABASE_GUIDE.md`.
- Never commit `.env`; rely on `.env.example` for onboarding.
- Secrets automation templates live in `config/secrets/` (`doppler.yaml.example`, `vault.env.template`, `aws-secrets-manager.json.example`) to streamline Doppler, Vault, or AWS Secrets Manager integration.

---

## Core Workflows

### Mission Scheduler

1. Enable the scheduler flag via Settings → Feature Flags or set `VITE_FLAG_SCHEDULER=1`.
2. Open Engagement Hub → Crew Scheduler.
3. Intake form queues missions with crew requirements, ADA impacts, and blackout-aware scheduling.
4. Drag cards on the timeline to reschedule; conflicts and ADA warnings surface in real time.
5. Structured logs emit via the log-beacon function when observability is enabled.

### AI Proxy & Log Beacon (Supabase Edge)

```bash
supabase functions deploy gemini-proxy --no-verify-jwt
supabase functions deploy log-beacon --no-verify-jwt
supabase secrets set GEMINI_API_KEY=$GEMINI_API_KEY
```

Set `VITE_GEMINI_PROXY_URL=https://<project-ref>.functions.supabase.co/gemini-proxy` and `VITE_LOG_BEACON_URL` accordingly.

---

## Quality Gates

```bash
npm run format             # Prettier + Tailwind plugin
npm run lint               # ESLint (React, a11y, security)
npm run typecheck          # TypeScript structural checks
npm run test:unit -- --run # Vitest
npm run test:e2e           # Playwright (requires browsers)
npm run security:scan      # npm audit + Snyk
npm run security:report    # JSON audit report saved to security-report.json

# Load packs (detailed below)
BASE_URL=http://localhost:5173 npx k6 run scripts/load/k6-estimate.js
npx artillery run scripts/load/artillery.yml
```

> **Playwright system deps**: Linux hosts must install GTK/libvpx/GStreamer/etc. listed after `npx playwright install`.

---

## API & Edge Functions

- OpenAPI spec lives at `docs/swagger.json` (generate with `npm run openapi:generate`).
- Endpoint usage examples live in [docs/API_REFERENCE.md](./docs/API_REFERENCE.md).
- Key endpoints:
  - `POST /gemini-proxy` – proxy Gemini chat/image/embed requests.
  - `POST /log-beacon` – ingest structured telemetry.

Example request:

```bash
curl -X POST "$SUPABASE_URL/functions/v1/gemini-proxy" \
  -H "Content-Type: application/json" -H "apikey: $SUPABASE_ANON_KEY" \
  -d '{ "action": "chat", "contents": [{ "role": "user", "parts": [{ "text": "Summarize sealcoating prep" }] }] }'
```

---

## Load & Performance Testing

### k6 Mission Sweep

```bash
# Default BASE_URL is http://localhost:5173
npx k6 run scripts/load/k6-estimate.js

# Scale intensity for staging validation
STAGE_MULTIPLIER=3 BASE_URL=https://preview.example npx k6 run scripts/load/k6-estimate.js
```

Metrics emitted: `successful_requests`, `request_duration` (Trend), `content_validation_failures`. Thresholds enforce p95 < 800 ms and success rate > 97%.

### Artillery Smoke Pulse

```bash
npx artillery run scripts/load/artillery.yml
```

Ideal for CI or quick pre-deploy pulses. Full instructions live in `scripts/load/README.md`.

---

## Deployment Targets

### Containers

```bash
docker compose --env-file .env up --build
# Reset state
docker compose down -v
```

> **Quality gate:** The Docker image build stage runs `npm run lint`, `npm run typecheck`, and `npm run test:unit -- --run` before bundling. Container builds will fail fast if these checks do not pass.

### Android

```bash
npm run mobile:prep
npm run android:gradle:debug
```

### Release Checklist

1. `npm run security:scan`
2. `npm run openapi:generate`
3. `npm run test:e2e`
4. Run load smoke (`k6` or `artillery`)
5. Update `CHANGELOG.md`

---

## Contribution Checklist

- Branch naming: `feature/<scope>` or `hotfix/<scope>`.
- Conventional Commits; Husky pre-commit runs lint-staged, lint, and unit suites.
- Update/add tests (Vitest, Playwright); call out load or performance validation when relevant.
- Regenerate OpenAPI (`npm run openapi:generate`) when Edge Function contracts change.
- Document user-facing or Ops changes in `docs/` and `CHANGELOG.md`.
- Use `.github` issue/PR templates and provide risk/rollback & verification notes.

Detailed guidelines: [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Reference Docs

- Supabase & security: `docs/UNIFIED_SUPABASE_GUIDE.md`, `docs/SECURITY.md`
- Mission scheduler & UX: `docs/DIVISION_UI_TRANSFORMATION.md`, `docs/MOBILE_GUIDE.md`
- Testing: `docs/TESTING_GUIDE.md`, `scripts/load/README.md`
- API interactions: `docs/API_REFERENCE.md`

---

## License

MIT © Pavement Performance Suite contributors – see [LICENSE](./LICENSE).
