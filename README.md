# Pavement Performance Suite

AI-assisted operations command center purpose-built for asphalt paving, sealcoating, and line-striping crews serving Virginia and North Carolina church campuses. The platform delivers estimation, scheduling, compliance automation, observability, and mobile experiences through a Division-inspired tactical HUD.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Capabilities](#core-capabilities)
3. [Architecture](#architecture)
4. [Quickstart](#quickstart)
5. [Feature Flags & Configuration](#feature-flags--configuration)
6. [Environment & Secrets](#environment--secrets)
7. [Observability & Operations](#observability--operations)
8. [Security & Compliance](#security--compliance)
9. [Testing & Quality Gates](#testing--quality-gates)
10. [Load & Performance Testing](#load--performance-testing)
11. [Deployment Targets](#deployment-targets)
12. [Mobile & Offline Field Ops](#mobile--offline-field-ops)
13. [Contribution & Developer Experience](#contribution--developer-experience)
14. [Strategic Roadmap Snapshot](#strategic-roadmap-snapshot)
15. [Reference Docs](#reference-docs)
16. [License](#license)

---

## Overview

- **Mission**: Equip small church-focused paving crews with an AI-guided command center that streamlines estimation, mission planning, crew coordination, compliance, and reporting.
- **Key Pillars**: User-centric HUD design, offline-ready workflows, Supabase-backed data integrity, structured observability, security-first automation, and extensible integrations.
- **Primary Users**: Pavement operations leads, pastors and facility directors, field crew chiefs, and back-office administrators handling compliance and finance.

---

## Core Capabilities

- **Estimator Studio** – multi-step cost modelling with AI assistance, compliance guardrails, multi-scenario simulation lab, and offline resilience.
- **Mission Scheduler** – crew-aware timeline with worship blackout windows, ADA alerts, conflict detection, and what-if optimization.
- **Command Center HUD** – live telemetry, revenue and margin dashboards, configurable widgets, multi-monitor layout memory, gesture controls, keyboard navigation, animation presets, and Supabase-backed data panels with export/import workflows.
- **Theme Command Center** – multi-theme gallery with liturgical presets, drag-and-drop wallpaper uploads, adaptive typography, and instant previews plus a live design token manifest.
- **Layout & Mapping Suite** – GIS overlays, measurement tools, tactical map waypoints, hazard zoning, and drone-ready workflows.
- **Automation & Notifications** – templated outreach flows, incident management, and workflow hooks for estimator → mission transitions.
- **Supplier Intelligence** – Supabase-backed pricing telemetry, AI summaries, and lead-time signals for regional material partners.
- **Mobile Readiness** – Capacitor Android shell, responsive design, offline queues, and background sync tailored for field teams.

---

## Architecture

- **Frontend**: React 18, Vite, TypeScript, TailwindCSS, shadcn/ui, `react-grid-layout`.
- **State & Data**: TanStack Query, feature flag context, Supabase client, IndexedDB caching, optimistic mutation helpers.
- **Edge Functions**: `gemini-proxy` (AI gateway) and `log-beacon` (telemetry ingress) with OpenAPI definitions in `docs/swagger.json`.
- **Tooling**: ESLint flat config, Prettier + Tailwind plugin, Husky + lint-staged, Vitest, Playwright, k6, Artillery, Commitlint.
- **Mobile**: Capacitor packaging for Android; PWA path for iOS/desktop crews.

---

## Quickstart

```bash
# 1. Clone
git clone https://github.com/continue-repo/pavement-performance-suite.git
cd pavement-performance-suite

# 2. Configure environment (populate with *real* secrets)
cp .env.example .env
#    Edit `.env` or `.env.local` with production-ready secrets from your manager
npm run check:env

# 3. Install dependencies + validate env (PowerShell equivalent available)
scripts/install_dependencies.sh --strict-env
# Flags:
#   --skip-playwright   # avoid browser downloads in CI containers
#   --skip-husky        # disable git hooks for read-only runners
#   --skip-env-check    # bypass env validation (not recommended)
# PowerShell: pwsh -File scripts/install_dependencies.ps1 -StrictEnv

# 4. Start dev server (refresh running preview if already launched)
npm run dev
# Or run the Dockerized dev stack with Supabase + measurement mocks:
# docker compose --profile dev up devserver db measurement-ai

# 5. Prime Supabase (optional for local data)
npm run migrate:up
npm run seed
```

Lovable previews poll `VITE_HEALTHCHECK_URL` (`/health` by default) **before** the SPA mounts. The repository now ships a static responder at `public/health` so previews stay green while Vite compiles; once React hydrates, the `/health` route in `src/pages/Health.tsx` adds live metadata. If you change ports or hosts, update `PORT`, `VITE_DEV_SERVER_PORT`, and `VITE_HEALTHCHECK_URL`, then refresh the already-running dev server.

> **Supabase admin user**: before running `npm run seed`, create the `ADMIN_EMAIL` user (defaults to `n8ter8@gmail.com`) in Supabase Auth so the script can attach the `super_admin` role. Follow `docs/ADMIN_SETUP.md` for dashboard, CLI, or SQL instructions.

> **Windows**: Follow `docs/WINDOWS_SETUP.md` for shell-specific flags, PostgreSQL provisioning, and Playwright dependencies.

---

## Feature Flags & Configuration

- Global flags live under `src/lib/featureFlags` and are surfaced via the in-app Settings → Feature Flags panel.
- Common overrides (set in `.env` or Supabase config):
  - `VITE_FLAG_COMMANDCENTER`, `VITE_FLAG_SCHEDULER`, `VITE_FLAG_OBSERVABILITY`, `VITE_FLAG_TACTICALMAPV2`
  - Experimental toggles: `VITE_FLAG_AIASSISTANT`, `VITE_FLAG_IMAGEAREAANALYZER`, `VITE_FLAG_PWA`, `VITE_FLAG_I18N`
  - HUD suite toggles: `VITE_FLAG_HUD_MULTI_MONITOR`, `VITE_FLAG_HUD_GESTURES`, `VITE_FLAG_HUD_KEYBOARD_NAV`, `VITE_FLAG_HUD_ANIMATIONS`, `VITE_FLAG_HUD_CONFIG_SYNC`
- Flags support environment scoping (dev/test/prod) and integrate with feature telemetry when `VITE_ENABLE_FEATURE_TELEMETRY=true`.

---

## Environment & Secrets

- `.env` keys (see `.env.example`):
  - **Deployment metadata**: `APP_ENV`, `VITE_ENVIRONMENT`, `VITE_APP_VERSION`, `VITE_BASE_PATH`, `VITE_BASE_NAME`, `VITE_BASE_URL`.
  - **Preview reliability & health**: `PORT`, `VITE_DEV_SERVER_PORT`, `VITE_PREVIEW_HEARTBEAT_INTERVAL_MS`, `VITE_HEALTHCHECK_URL` — keep aligned with Lovable proxy expectations to avoid connection refused errors.
  - **Supabase**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PROJECT_ID`, `SUPABASE_PROJECT_REF`, `DATABASE_URL`.
  - **Workflow telemetry**: `VITE_SAMPLE_JOB_ID` (optional) points the workflow shell at a seeded Supabase job UUID so stage/outreach history can be fetched automatically.
  - **Scheduler & liturgical sync**: `SCHEDULER_BLACKOUT_FEED_URL`, `SCHEDULER_BLACKOUT_FEED_TOKEN`, `SCHEDULER_CREW_CAPACITY`, `SCHEDULER_ICS_PUBLISH_BUCKET`, `VITE_LITURGICAL_CALENDAR_URL`.
  - **AI & wallpaper services**: `VITE_THEME_AI_ENDPOINT`, `VITE_THEME_AI_MODEL`, `THEME_WALLPAPER_AI_TOKEN`, `VITE_ESTIMATOR_AI_ENDPOINT`, `ESTIMATOR_AI_TOKEN`.
  - **Supplier & incident telemetry**: `VITE_SUPPLIER_FEED_URL`, `SUPPLIER_INTELLIGENCE_API_KEY`, `VITE_INCIDENT_WEBHOOK_URL`, `INCIDENT_BRIDGE_SIGNING_SECRET`.
  - **AI Proxy**: `VITE_GEMINI_PROXY_URL`, `GEMINI_API_KEY`, `LOVABLE_API_KEY`.
  - **Observability**: `VITE_LOG_BEACON_URL`, `VITE_OBSERVABILITY_EXPORTER_URL`, `OBSERVABILITY_API_KEY`, `VITE_SENTRY_DSN`.
  - **Mapping & Weather**: `VITE_GOOGLE_MAPS_API_KEY`, `VITE_OPENWEATHER_API_KEY`, `VITE_MAPBOX_TOKEN`, `VITE_AIR_QUALITY_API_KEY`.
  - **HUD Sync & Export**: `VITE_HUD_DEFAULT_ANIMATION_PRESET`, `VITE_HUD_ANIMATION_PRESETS_PATH`, `VITE_HUD_GESTURE_SENSITIVITY`, `VITE_HUD_MULTI_MONITOR_STRATEGY`, `VITE_HUD_CONFIG_EXPORT_FORMAT`, `VITE_HUD_CONFIG_EXPORT_ENDPOINT`, plus secrets `HUD_CONFIG_EXPORT_SIGNING_KEY`, `HUD_CONFIG_EXPORT_ENCRYPTION_KEY`, `HUD_CONFIG_EXPORT_BUCKET`.
  - **Developer tooling**: `GITHUB_TOKEN` for ingest scripts.
  - **Seed admin**: `ADMIN_EMAIL` (defaults to `n8ter8@gmail.com`) tells the seed script which Supabase Auth user should receive `super_admin`, demo org memberships, and Theme Command Center defaults.
  - `npm run check:env` (or `npm run check:env -- --strict` in CI) now blocks deployments if Lovable routing keys drift: it validates `PORT`, `VITE_DEV_SERVER_PORT`, `VITE_BASE_PATH`, `VITE_HEALTHCHECK_URL`, and both heartbeat timing variables so preview watchdogs never fail silently.
- **Secrets provider**: Set `SECRET_PROVIDER` to `env` (default), `doppler`, `vault`, or `aws-secrets-manager`. The runtime helper `src/config/secrets.ts` reads this value and fails fast if required secrets are missing or the provider is unconfigured.
- Generate sanitized runtime bundles with `npm run secrets:render -- --output .env.runtime` after hydrating secrets. Use `--strict` in CI to fail fast when a key from `.env.example` is missing.
- Secrets automation templates live in `config/secrets/` for Doppler, Vault, and AWS Secrets Manager pipelines.
- Never commit real secrets. Use Supabase Edge Secrets or your chosen secret manager for runtime credentials.
- Run `npm run check:env` locally (non-strict) and `npm run check:env -- --strict` in CI to gate deployments; failures block Lovable preview regressions (e.g., absolute `VITE_BASE_PATH`).
- Keep `VITE_BASE_PATH` set to `./` for production builds to ensure Lovable previews resolve nested asset paths. Let Lovable auto-detect `VITE_LOVABLE_BASE_PATH`.
  - Supabase bootstrapping, RLS, and seed workflows are documented in `docs/UNIFIED_SUPABASE_GUIDE.md` and the detailed migration/seed map in `docs/SUPABASE_SCHEMA.md`.

---

## Observability & Operations

- The app initializes monitoring via `initializeMonitoring()` and streams telemetry through the `log-beacon` edge function.
- Structured logging emits for:
  - Feature flag evaluations and overrides.
  - Mission scheduler events (crew conflicts, ADA alerts, ICS imports).
  - Estimator lifecycle (scenario creation, AI recommendations, proposal exports).
  - Mobile/Capacitor events (back button handling, offline sync).
  - Lovable preview asset watchers (`lovable.asset_load_error`, `lovable.asset_promise_rejection`) for visibility into missing bundles or proxy misconfigurations.
- Enable/disable web vitals and feature telemetry with `VITE_ENABLE_WEB_VITALS` and `VITE_ENABLE_FEATURE_TELEMETRY`.
- Integrate with external APMs by configuring `VITE_OBSERVABILITY_EXPORTER_URL` and `VITE_SENTRY_DSN`.
- **Lovable preview watchdog**: `installLovableAssetMonitoring()` pings `VITE_HEALTHCHECK_URL` using `VITE_PREVIEW_HEARTBEAT_INTERVAL_MS`. A static JSON responder (`public/health`) guarantees 200-level responses even before Vite finishes compiling, while the SPA `/health` route layers live diagnostics once React hydrates. If previews return “connection refused,” verify this endpoint locally (Step 3) before redeploying to Lovable; keep `PORT`/`VITE_DEV_SERVER_PORT` at 8080 unless your proxy explicitly supports overrides.
- **Third-party beacon guardrails**: Lovable previews often block Google/TikTok hosts. Set `VITE_DISABLE_THIRD_PARTY_ANALYTICS=1` to keep `gtag`/`ttq` calls from firing, or rely on the automatic Lovable host/offline detection baked into `trackEvent` to suppress them gracefully while still logging to Supabase.

---

## Security & Compliance

- Supabase schema enforces RLS across organizations, jobs, estimates, crew data, documents, and premium services.
- Roles (`viewer`, `operator`, `manager`, `super_admin`) backed by `user_roles` and `user_org_memberships`.
  - Scripts:
    - `npm run security:scan` (npm audit + Snyk)
    - `npm run security:report` (JSON audit snapshot)
    - `npm run security:baseline` (scan + report in one step for daily health checks)
    - `npm run security:ci` (aggregated audit + Snyk + JSON report for CI gates)
- Secret resolution is centralised in `src/config/secrets.ts`, which normalises environment values and surfaces actionable errors when a managed provider (`SECRET_PROVIDER=doppler|vault|aws-secrets-manager`) is enabled without configuration. See `config/secrets/README.md` for provider-specific bootstrapping.
  - Provider templates live in `config/secrets/doppler.yaml.example`, `config/secrets/vault.env.template`, and `config/secrets/aws-secrets-manager.json.example` so you can copy/paste minimal configs when wiring Doppler/Vault/AWS Secret Manager.
  - GitHub Actions pipeline (`.github/workflows/main.yml`) runs CodeQL SAST, dependency scans, and tests per push.
- Secrets management patterns documented in `docs/SECRETS_AND_CONFIG.md` with Doppler/Vault/AWS sample configs.
  - day-to-day security expectations (secret rotation, dependency scans, incident checklist) live in `docs/SECURITY_OPERATIONS.md`.
  - Set `SNYK_TOKEN` in repository/organization secrets to unlock the Snyk portion of `npm run security:ci`; without it the CI step will fall back to npm audit only.
- Virginia contractor compliance workflows, invoicing expectations, and retention policies detailed in `docs/PRODUCTION_READINESS.md` and `docs/SECURITY_REMEDIATION_GUIDE.md`.

---

## Testing & Quality Gates

| Category      | Command                                                      | Notes                                                                                                             |
| ------------- | ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- |
| Formatting    | `npm run format` / `npm run format:check`                    | Prettier + Tailwind plugin                                                                                        |
| Linting       | `npm run lint` / `npm run lint:fix`                          | ESLint with React, a11y, security plugins                                                                         |
| Type Safety   | `npm run typecheck`                                          | Strict TS config                                                                                                  |
| Unit          | `npm run test:unit -- --run`                                 | Vitest; coverage thresholds 85%/85%/70% configured                                                                |
| Integration   | `npm run test -- --run`                                      | Module-level suites under `tests/`                                                                                |
| E2E           | `npm run test:e2e`                                           | Playwright specs (`e2e/`)                                                                                         |
| Preview Smoke | `npm run test:preview`                                       | Builds production bundle and runs the Playwright harness at `preview-smoke.html` to verify Lovable base detection |
| Accessibility | `npm run test:unit -- --run`                                 | Uses `vitest-axe` assertions                                                                                      |
| Security      | `npm run security:scan`                                      | npm audit + Snyk                                                                                                  |
| Load          | see [Load & Performance Testing](#load--performance-testing) | k6 + Artillery packs                                                                                              |

Husky pre-commit hooks execute lint-staged, lint, typecheck, unit tests, and optional Playwright checks via `npm run precommit:hook`.

> Accessibility linting is enforced via `eslint-plugin-jsx-a11y`; `npm run lint` and the Docker quality gate both fail on violations so HUD widgets remain screen-reader friendly.

---

## Load & Performance Testing

### k6 Observability Beacon

```bash
LOG_BEACON_URL=https://your-project.supabase.co/functions/v1/log-beacon \
LOG_BEACON_TOKEN=SUPABASE_JWT_OR_ANON_KEY \
npx k6 run scripts/load/k6-observability.js
```

Sends synthetic `lovable.asset_*` telemetry into the Supabase Edge Function to validate ingestion latency, dedupe, and incident rollups. Tune intensity with `STAGE_MULTIPLIER` and export JSON summaries via `--summary-export`.

### k6 Lovable Preview Heartbeat

```bash
PREVIEW_HEALTH_URL=https://id-preview.lovable.app/health \
STAGE_MULTIPLIER=2 \
npx k6 run scripts/load/k6-preview-health.js
```

Validates the `/health` endpoint that Lovable proxies poll. Metrics enforce `preview_health_latency` (p95 < 500 ms) and `preview_health_failures` (should stay at zero). Override `PREVIEW_HEALTH_STATUS` (default `200`) if your Nginx health endpoint returns a different status, and scale `STAGE_MULTIPLIER` to mimic Lovable’s burstiness.

### k6 Gemini Proxy Assist

```bash
GEMINI_PROXY_URL=https://your-project.supabase.co/functions/v1/gemini-proxy \
GEMINI_PROXY_TOKEN=SUPABASE_SERVICE_OR_ANON_JWT \
GEMINI_PROMPT="Summarize church sealcoating scope best practices." \
npx k6 run scripts/load/k6-gemini-proxy.js
```

Validates the authenticated Gemini chat proxy that powers scope recommendations. Monitors `gemini_chat_duration` and enforces `gemini_chat_success` > 95%.

### k6 Mission Sweep

```bash
# Default BASE_URL is http://localhost:5173
npx k6 run scripts/load/k6-estimate.js

# Scale intensity for staging validation
STAGE_MULTIPLIER=3 BASE_URL=https://preview.example npx k6 run scripts/load/k6-estimate.js
```

Metrics emitted: `successful_requests`, `request_duration`, `content_validation_failures`. Thresholds enforce p95 < 800 ms and success rate > 97%.

### k6 Workflow Orchestration (Supabase REST)

```bash
WORKFLOW_SUPABASE_URL=https://your-project.supabase.co/rest/v1 \
WORKFLOW_SERVICE_ROLE_KEY=$(cat service_role_jwt.txt) \
WORKFLOW_JOB_ID=YOUR_JOB_UUID \
STAGE_MULTIPLIER=2 \
npx k6 run scripts/load/k6-workflow.js
```

Exercises the workflow telemetry tables by creating synthetic measurement runs, stage events, and outreach touchpoints via Supabase REST (requires a service-role or elevated key). Point `WORKFLOW_JOB_ID` at a seeded job (see `VITE_SAMPLE_JOB_ID` and `npm run seed`) to hydrate the same mission surfaced in the Workflow Shell.

### Artillery Smoke Pulse

```bash
npx artillery run scripts/load/artillery.yml
```

Ideal for CI or pre-release smoke tests. Full instructions live in `scripts/load/README.md`.

---

## Deployment Targets

### Containers

```bash
# 1. Build optimized runtime image (quality gate runs automatically)
docker build -t pps:web --build-arg VITE_APP_VERSION=$(git rev-parse --short HEAD) .

# 2. Launch the production stack (web + db + observability mocks)
docker compose --env-file .env up --build web db observability measurement-ai

# 3. Run database migrations / seed data (one-off)
docker compose run --rm migrator
docker compose --profile setup run --rm seeder

# 4. Reset everything
docker compose down -v
```

- The multi-stage `Dockerfile` bakes in a `quality` gate: the runtime image copies a sentinel file from the lint/type/test stage, so `docker build` fails immediately if checks regress.
- Hot reload uses the Vite dev server on port `8080` to stay Lovable-compatible: `docker compose --profile dev up devserver db measurement-ai`.
- Need only the API mocks? All compose services support profiles—start just what you need (e.g., `--profile setup` for seed-only).

### Android

```bash
npm run mobile:prep
npm run android:gradle:debug
```

### Release Checklist

1. `npm run security:scan`
2. `npm run openapi:generate` (parses Supabase Edge Function annotations and refreshes `docs/swagger.json`)
3. `npm run test:e2e`
4. Run load smoke (`k6-observability`, `k6-estimate`, `k6-workflow`, or `artillery`)
5. Update `CHANGELOG.md`

---

## Mobile & Offline Field Ops

- Capacitor shell delivers native Android packaging; field devices receive offline caching, background sync, and optimized touch targets.
- `MobileOptimizations` component handles PWA prompts, install banners, and viewport adjustments.
- Offline-first patterns leverage IndexedDB persistence for estimator drafts, missions, telemetry, and wallpaper assets.
- Push notification ready via Capacitor plugins (enable corresponding feature flags and provider credentials).

---

## Contribution & Developer Experience

- Branching strategy:
  - `main`: production-ready, auto-deploy after CI success.
  - `develop`: integration branch for the next release cut; merge feature branches here.
  - `feature/<scope>` or `hotfix/<scope>`: short-lived branches; rebase on `develop` before PR.
  - Use release branches (`release/vX.Y.Z`) for stabilization windows when needed.
- Conventional Commits enforced via Husky + Commitlint.
- Issue/PR templates capture Lovable preview context, feature flag strategy, observability, and risk/rollback details—fill them out fully to unblock the small crew.
- Run `scripts/install_dependencies.sh --strict-env` (or the PowerShell variant) on fresh checkouts to hydrate `.env`, install hooks, and validate secrets before writing code.
- Generator scripts (`scripts/openapi`, `scripts/ingest`, planned `scripts/generate`) keep new modules consistent.
- Provide risk/rollback notes in PR template (`.github/pull_request_template.md`) and keep docs in sync.
- Consult `CONTRIBUTING.md` for coding standards, review checklist, and DevEx expectations.

---

## Strategic Roadmap Snapshot

- **Estimator Studio Enhancements**: AI co-pilot, layout-driven quantity extraction, supplier pricing alerts, compliance guardrails, proposal PDFs.
- **Mission Scheduler Optimization**: Constraint-based timeline planning, worship blackout imports, crew mobile sync, incident rerouting.
- **Command Center & Observability**: Customizable HUD layouts, incident management, OTEL instrumentation, in-app observability console.

Full roadmap and phased analysis live in `docs/PHASE_1_ANALYSIS.md`, `docs/PHASE_COMPLETION_SUMMARY.md`, and `docs/IMPROVEMENT_PLAN.md`.

---

## Reference Docs

- Supabase & security: `docs/UNIFIED_SUPABASE_GUIDE.md`, `docs/SECURITY_REMEDIATION_GUIDE.md`, `docs/RLS_SECURITY.md`
- Supabase schema tooling: `docs/SUPABASE_SCHEMA.md`, `docs/ADMIN_SETUP.md`
- Mission scheduler & UX: `docs/DIVISION_UI_TRANSFORMATION.md`, `docs/MOBILE_GUIDE.md`
- Testing & quality: `docs/TESTING_GUIDE.md`, `scripts/load/README.md`
- API & integrations: `docs/API_REFERENCE.md`, `docs/INTEGRATIONS_GUIDE.md`
- Deployment & operations: `docs/DEPLOYMENT.md`, `docs/PRODUCTION_READINESS.md`, `docs/CONTAINERIZATION.md`
- UI foundations: `docs/DESIGN_SYSTEM.md`

---

## License

MIT © Pavement Performance Suite contributors — see [LICENSE](./LICENSE).
