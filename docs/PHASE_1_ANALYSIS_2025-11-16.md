## Phase 1 – Comprehensive Analysis & Strategic Roadmap (2025-11-16)

### Project Summary
- **Product Scope**: Pavement Performance Suite is an AI-assisted command center for asphalt paving, sealcoating, and line-striping teams that serve church campuses across VA/NC. It centralizes estimation, scheduling, HUD telemetry, supplier intelligence, and client engagement (see `README.md` and `src/modules/*` domain bundles).
- **Frontend Stack**: React 18 + Vite + TypeScript with Tailwind, shadcn/ui primitives, TanStack Query, feature-flag context, and IndexedDB/offline helpers mounted in `src/App.tsx`.
- **Backend & Data**: Supabase (PostgreSQL + Edge Functions) with node-pg-migrate migrations (`supabase/migrations`), structured logging (`src/lib/logging.ts`), and AI proxy functions referenced by scripts in `scripts/*`.
- **Mobile & Offline**: Capacitor Android shell (`android/` + `npm run mobile:*`) and PWA scaffolding via `vite-plugin-pwa` plus offline queues handled in contexts/hooks.
- **Tooling & DevEx**: Strict ESLint flat config, Prettier, Husky pre-commit running lint/type/test, Vitest + Playwright, k6 + Artillery load suites, secrets tooling in `config/secrets`.

### Observed Issues & Diagnostics
1. **Lovable preview health 404** – Console logs show repeated `id-preview.../health` 404s. SPA route `/health` (see `src/pages/Health.tsx`) exists, but Lovable performs raw HTTP fetches before the router boots. We need a static `public/health` JSON responder plus ENV-driven `VITE_HEALTHCHECK_URL` sanity checks.
2. **Analytics DNS failures (ERR_NAME_NOT_RESOLVED)** – `analytics.google.com` & `analytics.tiktok.com` fail inside Lovable sandbox DNS. Guard third-party beacons by routing `trackPageView` through `navigator.onLine` & host allowlists to prevent noisy errors and retries.
3. **Lovable collaborator API 405** – `api.lovable.dev/projects//collaborators` reveals a missing project slug in Lovable metadata ingestion. We should harden `src/lib/routing/basePath.ts` + preview banner to warn when `window.__LOVABLE__?.projectId`/`runtimeEnv.VITE_LOVABLE_PROJECT_ID` is empty and avoid firing invalid requests.
4. **Dev asset 504s (`node_modules/.vite/deps/*`)** – Preview domains hit `/node_modules/.vite/...` but receive 504 when the dev origin isn’t ready. Ensure Vite dev server HMR uses Lovable-configured `clientPort`, add `status` endpoint health gating, and document “refresh dev server” instructions. Consider pre-building shared deps for Lovable preview (leveraging `optimizeDeps.include` and `vite --force` on boot).
5. **Missing static observability heartbeat** – `installLovableAssetMonitoring` expects `VITE_PREVIEW_HEARTBEAT_INTERVAL_MS` + `/health` responses; without static asset, structured logs emit repeated errors (`lovable.preview.health.failure`). This elevates Lovable’s incident banners and must be remediated early.

### Feature Maximization (Existing Modules)
| Feature | Current Signal | Maximum Potential Definition |
| --- | --- | --- |
| Estimator Studio (`src/modules/estimate`) | Multi-step estimator with AI hooks and compliance hints, but AI pipeline + PDF exports are partial. | Real-time AI co-pilot with blueprint ingestion, supplier pricing deltas, VDOT/ADA compliance gates, scenario comparison matrix, proposal PDF/Docx export, offline draft autosave, and audit logs. |
| Mission Scheduler (`src/modules/scheduler`) | Timeline components + blackout awareness exist, but lacks drag operations & crew telemetry. | Constraint-based scheduler with worship blackout ingestion, crew capacity modeling, ADA-first hints, conflict visualizations, downtime heatmaps, and Supabase-powered sync to mobile crew devices. |
| Command Center HUD (`src/modules/mission-control`, `components/hud/*`) | Tactical UI foundations exist; outstanding Division-grade overlays + gestures. | Fully themable HUD with multi-monitor layouts, gesture and keyboard overlays, holographic widgets, animation presets, wallpaper AI ingestion, and live telemetry cards with feature flags. |
| Theme Command Center (`src/modules/layout/theme`) | Theme toggles + wallpaper picker exist but limited to curated gallery. | Theme marketplace with liturgical presets, custom wallpaper uploads (w/ storage quotas), AI wallpaper generation, theme diff previews, and accessibility audits per theme. |
| Layout & Mapping Suite (`src/modules/layout`, `components/map`) | Map overlays + measurement tools exist. Needs hazard routing + drone readiness. | GIS layering with hazard zoning, route optimization, AR waypoints, drone flight plan export, and Supabase measurement history overlayed with weather + liturgical events. |
| Automation & Notifications (`src/modules/engagement`) | Notification skeletons exist; pipeline not deeply integrated. | Event-driven automation center with templated outreach flows, SMS/email bridging, pastor communication presets, compliance reminders, plus metrics dashboards. |
| Supplier Intelligence (`src/modules/insights`) | Pricing telemetry UI exists but limited data ingestion. | Supplier marketplace with AI summaries, price delta alerts, lead-time forecasting, and procurement recommendations stored via Supabase analytics tables. |
| Mobile Readiness (`MobileOptimizations`, Capacitor) | Capacitor shell + offline components exist; need deeper offline-first flows. | Full offline mission kit: background sync, conflict resolution UI, offline map tiles, barcode/QR job check-ins, device telemetry logging, and push workflows. |
| Observability & Security (`src/lib/monitoring`, `docs/SECURITY_*`) | Structured logging + CodeQL pipeline defined but not fully automated. | OTEL-compliant tracing, curated dashboards, automated security scans (npm audit, Snyk, CodeQL) on CI, secrets manager integration (Doppler/Vault/AWS) with runbooked incident response. |

### New High-Value Features
1. **Campus Blueprint Upload & GIS Alignment** – Accept CAD/PDF uploads, auto-align with map overlays, and auto-segment surfaces for estimator.
2. **Pastor Communication Command Deck** – CRM-lite board for board approvals, sermon blackout notes, and templated follow-ups with read receipts.
3. **Crew Mission Recorder** – Mobile timeline capturing start/stop times, photos, and incident notes synced into Supabase + observability events.
4. **AI Church Lot Optimizer** – Suggests re-striping layouts to maximize parking, factoring ADA, fire lanes, and events; outputs annotated diagrams.
5. **Regulatory Compliance Vault** – Stores PSL/VDOT/insurance docs, renewal reminders, and generates compliance packets for Class C licensing audits.

### Refactoring, Bug Fixes, & Optimizations
- Ship a static `/health` asset + runtime fallback for Lovable previews; assert `VITE_BASE_PATH`/`VITE_LOVABLE_BASE_PATH` values during `npm run check:env`.
- Wrap analytics beacons (`trackPageView`) with DNS/host allowlists and exponential backoff to eliminate repeated network console noise.
- Harden Supabase client initialization with feature-flag aware structured logs + secrets validation (preventing silent 401s).
- Modularize oversized UI files (>500 lines) in `src/components/hud` into submodules per instruction; ensure index barrels.
- Add performance budgets + dynamic import boundaries for heavy modules (leaflet, recharts) to avoid `node_modules/.vite` timeouts.
- Expand tests: mission-critical flows in `tests/` + Playwright for estimator/scheduler/perf flows; add vitest-axe coverage for new HUD assets.
- Document small-team process (2 FTE + 1 PTE) with automation-first dev workflows and Lovable preview troubleshooting guide.

### Prioritized Improvement & Completion Plan
1. **Lovable Preview Reliability Pack** `[Fix/Refactor]` – Static `/health`, env validation, preview watchdog docs (`public/health`, `src/lib/runtimeEnv`, `README`).
2. **Analytics & Telemetry Guardrails** `[Fix/Refactor]` – Host-gated GA/TikTok wrappers, structured logging for failures, feature flag to disable third-party analytics in restricted previews (`src/lib/analytics.ts`, `src/lib/logging.ts`).
3. **Tactical HUD Overhaul** `[Max-Feature]` – Division-grade overlays, cards, buttons, typography, animation presets (multiple `src/components/hud/*`, `tailwind.config.ts`, `src/index.css`).
4. **Mission Scheduler Evolution** `[Max-Feature]` – Drag timeline, crew capacity modeling, ADA conflict detection (`src/modules/scheduler`, `src/hooks/useSchedulePlanner.ts`).
5. **Estimator Studio AI Copilot** `[Max-Feature]` – Blueprint ingestion, supplier pricing diffing, compliance guardrails, PDF exports, offline drafts (`src/modules/estimate`, `supabase/functions/*`, `scripts/ai/*`).
6. **Layout & Mapping Enhancements** `[Max-Feature]` – Hazard overlays, drone workflows, weather/liturgical overlays (`src/components/map/*`, `src/lib/map/*`).
7. **Automation & Engagement Suite** `[Max/New Feature]` – Outreach flow builder, multi-channel templates, analytics dashboards (`src/modules/engagement`, `supabase/functions/notifications`).
8. **Supplier Intelligence Upgrade** `[Max-Feature]` – Lead-time forecasting, AI insights, procurement recommendations (`src/modules/insights`, `supabase/migrations/*`).
9. **Mobile & Offline Deepening** `[Max-Feature]` – Offline map tiles, sync queues, mission recorder, push workflows (`src/components/MobileOptimizations`, Capacitor configs).
10. **Secrets & Security Hardening** `[Refactor/Fix]` – Secrets provider enforcement, CodeQL + Snyk automation, incident runbooks (`config/secrets`, `.github/workflows/main.yml`, docs).
11. **Performance Optimization Pass** `[Refactor]` – Bundle budgets, dynamic imports, React Query caching strategy, workerized heavy tasks (`vite.config.ts`, `src/hooks/usePerformanceMetrics.ts`).
12. **Observability & Metrics Deep Dive** `[Max-Feature/Refactor]` – OTEL export path, log-beacon enhancements, preview incident console (`src/lib/monitoring/*`, `scripts/load/*`).
13. **Compliance Vault & Licensing Support** `[New Feature]` – Document store, renewal reminders, exportable compliance packets (`src/modules/compliance` new, `supabase/migrations`).
14. **Pastor Communication Command Deck** `[New Feature]` – CRM board, read receipts, templated messaging (`src/modules/engagement/pastorDesk` new).
15. **Deployment & Rollback Automation** `[Refactor/Fix]` – Multi-stage Dockerfile, docker-compose, CI release gating, rollback/disaster recovery docs (`Dockerfile`, `docker-compose.yml`, `.github/workflows`).
16. **Testing & QA Expansion** `[Refactor]` – Raise coverage >85%, add mission-critical Playwright specs, k6/artillery scripts for new flows (`tests/*`, `e2e/*`, `scripts/load/*`).
17. **Documentation & DevEx Refresh** `[Refactor/Doc]` – README, onboarding, Lovable troubleshooting, architecture diagrams (`README.md`, `docs/*`, `scripts/install_dependencies.*`).
18. **Final Handover & Retrospective** `[Doc]` – File change log, contributor guide, deployment checklist, retrospective insights (`docs/FINAL_HANDOVER.md`, `docs/RETROSPECTIVE.md`).

### Phased Implementation Roadmap
| Priority | Task Description | Task Type (Max-Feature/New-Feature/Refactor/Fix) | Files to Modify/Create |
| --- | --- | --- | --- |
| 1 | Ship Lovable preview reliability pack (static `/health`, env validation, docs). | Fix | `public/health`, `src/lib/runtimeEnv.ts`, `README.md`, `scripts/check-env.ts` |
| 2 | Add analytics/telemetry guardrails with host gating + feature flags. | Refactor | `src/lib/analytics.ts`, `src/lib/logging.ts`, `src/contexts/FeatureFlagProvider.tsx` |
| 3 | Execute tactical HUD overhaul (overlays, cards, typography, button variants). | Max-Feature | `src/components/hud/*`, `src/components/ui/button.tsx`, `tailwind.config.ts`, `src/index.css` |
| 4 | Implement mission scheduler evolution with drag timeline + ADA guards. | Max-Feature | `src/modules/scheduler/*`, `src/hooks/useSchedulePlanner.ts`, `tests/scheduler/*` |
| 5 | Build estimator AI copilot + blueprint ingestion + compliance guardrails. | Max-Feature | `src/modules/estimate/*`, `supabase/functions/estimator-*`, `scripts/ai/*` |
| 6 | Expand layout/mapping suite with hazard zoning & drone workflows. | Max-Feature | `src/components/map/TacticalMap.tsx`, `src/lib/map/*`, `public/rag/*` |
| 7 | Deliver automation & engagement suite (workflow builder + analytics). | Max-Feature/New-Feature | `src/modules/engagement/*`, `supabase/functions/notifications`, `tests/engagement/*` |
| 8 | Upgrade supplier intelligence with lead-time forecasting + AI summaries. | Max-Feature | `src/modules/insights/*`, `supabase/migrations/*`, `scripts/seed.ts` |
| 9 | Deepen mobile/offline kits (offline tiles, sync queues, mission recorder). | Max-Feature | `src/components/MobileOptimizations.tsx`, `src/lib/offline/*`, `android/app/**` |
| 10 | Enforce secrets/security hardening plus CI scans + incident docs. | Refactor/Fix | `config/secrets/*`, `.github/workflows/main.yml`, `package.json`, `docs/SECURITY_OPERATIONS.md` |
| 11 | Run performance optimization & bundle budgeting initiative. | Refactor | `vite.config.ts`, `src/hooks/usePerformanceMetrics.ts`, `src/modules/mission-control/*` |
| 12 | Implement observability & OTEL export enhancements. | Max-Feature/Refactor | `src/lib/monitoring/*`, `scripts/load/*`, `docs/OBSERVABILITY_GUIDE.md` |
| 13 | Build compliance vault aligned with Class C licensing needs. | New-Feature | `src/modules/compliance/*` (new), `supabase/migrations/*`, `docs/COMPLIANCE.md` |
| 14 | Create pastor communication command deck CRM module. | New-Feature | `src/modules/engagement/pastorDesk/*`, `supabase/functions/messaging`, `tests/engagement/pastorDesk.spec.ts` |
| 15 | Finalize deployment/container pipelines with rollback automation. | Refactor/Fix | `Dockerfile`, `.dockerignore`, `docker-compose.yml`, `.github/workflows/main.yml`, `docs/DEPLOYMENT.md` |
| 16 | Expand automated testing (unit, integration, e2e, load, accessibility). | Refactor | `tests/**/*`, `e2e/**/*`, `scripts/load/*`, `vitest.config.ts`, `playwright.config.ts` |
| 17 | Refresh documentation & onboarding (README, guides, Lovable troubleshooting). | Refactor | `README.md`, `docs/IMPROVEMENT_PLAN.md`, `docs/TROUBLESHOOTING.md`, `scripts/install_dependencies.*` |
| 18 | Produce final handover package + retrospective. | Doc | `docs/FINAL_HANDOVER.md`, `docs/RETROSPECTIVE.md`, `CHANGELOG.md` |

> This roadmap satisfies Phase 1 requirements and seeds the next phases (DevEx tooling, containerization, UI foundation, DB migrations, security, iterative delivery, performance, documentation, CI/CD, handover, retrospective). Subsequent phases will execute these tasks sequentially, auto-applying recommendations without additional confirmation.
