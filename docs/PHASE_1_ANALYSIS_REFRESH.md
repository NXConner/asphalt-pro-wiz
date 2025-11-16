# Phase 1 – Analysis & Strategic Roadmap (2025-11-16)

_Author: GPT-5.1 Codex — Execution Phase 1 refresh aligned with the “Comprehensive Project Completion Strategy”._

---

## Executive Summary
- **Product Identity**: Pavement Performance Suite (PPS) is an AI-assisted mission console for small, church-focused asphalt crews in VA/NC. It unifies estimator intelligence, mission scheduling, observability, compliance, and immersive HUD visuals across web, PWA, and Capacitor Android distributions.
- **Core Stack**: React 18 + Vite + TypeScript + Tailwind/shadcn for UI; TanStack Query, feature-flag contexts, IndexedDB caching, Leaflet/Google Maps GIS overlays; Supabase (Postgres + Auth + Edge Functions) for persistence, telemetry, RLS; scripts in TS (node-pg-migrate, Vitest, Playwright, k6/Artillery) with Husky, lint-staged, Commitlint, and secrets adapters (env/Doppler/Vault/AWS).
- **Operational Readiness**: Tooling, docs, migrations, and tests exist but need tightening for the small-team context (2 FTE + 1 PTE). Automation, structured logging, and feature flags are present yet can be expanded for reliability, multi-env parity, and Lovable preview stability (current connection refused report).
- **Primary Risks**: Lovable preview hosts intermittently refuse connections (proxy to port 8080) indicating build container crash or health probe mismatch; theme system + HUD complexity risks regression in accessibility; Supabase schema is large and requires strict rollback instructions and telemetry-driven validation; offline/PWA flows must remain deterministic for crews with intermittent coverage.

---

## System Overview

### Domain Goals & Users
- Serve pastors/facilities leads with campus-aware estimations, layout reconfiguration, and compliance-ready proposals.
- Support field crews with mission HUD, tactical maps, offline caching, wallpaper customization, and mobile readiness.
- Provide business owners with observability, revenue telemetry, supplier intelligence, and compliance automation (Virginia contractor Class C / PSI context).

### Architecture Snapshot
- **UI Composition**: `src/modules/*` encapsulate estimator, scheduler, mission-control, insights, engagement, analytics, layout. `src/components/hud`, `ThemeCommandCenter`, and `ResponsiveCanvas` produce HDR-like experiences with wallpaper galleries and multi-monitor heuristics.
- **State & Data**: `contexts/*` (Auth, FeatureFlag, Theme, Keyboard, Performance) wrap `App.tsx`; `lib/monitoring`, `lib/logging`, `lib/routing/basePath.ts` orchestrate telemetry + Lovable routing detection; `scripts/seed.ts` hydrates Supabase with realistic church data.
- **Supabase**: Node PG migrate assets under `supabase/migrations/*` (JS + SQL). Seeds create organizations, telemetry, wallpapers, and enforce RLS-ready relationships (roles/user_roles). Secrets automation in `config/secrets`.
- **Testing & Tooling**: Vitest suites, Playwright E2E, load scripts, linting hooks, `package.json` commands, `.husky` available. Documentation is rich (`docs/*`).

### Connection Refusal (Lovable Preview) Diagnosis
- **Symptom**: `id-preview--1282c161-32ae-4cc0-9d0c-60535b8cd60d.lovable.app` refuses TCP connections.
- **Likely Causes**:
  1. **Container crash / port misbinding** (strict `port: 8080` + `strictPort: true` in `vite.config.ts`). If Vite preview fails to bind (port busy), Lovable health probes fail, producing refusal.
  2. **TLS/HMR mismatch** (`hmr.clientPort = 443`, but preview uses custom forwarders). Failures before `health` route respond lead to connection resets.
  3. **DNS/backplane expiry** (Lovable preview garbage-collected). Host stays in DNS but target removed, giving connection refused.
- **Mitigations (Compare Approaches)**:
  - _Approach A: Harden Preview Boot Sequence_ — Add startup script verifying `PORT` env override, fall back to ephemeral port, and report readiness via `/health`. Pros: automatic resilience; Cons: deviates from Lovable expectation of 8080 (needs coordination).
  - _Approach B: Lovable-Aware Proxy Watchdog_ — Extend `installLovableAssetMonitoring` to ping `health` endpoint + log warnings to `log-beacon`. Pros: zero infra change; Cons: does not fix root container crash.
  - _Approach C: Build Artifact Hosting_ — Serve static `vite build` output via Lovable CDN (no dev server). Pros: eliminates runtime refusal; Cons: preview loses dynamic dev features (HMR, watchers).  
**Chosen Plan**: Combine A + B — keep strict port but add `PORT` env support with graceful fallback/logging and embed connectivity diagnostics (feature-flagged) to surface root cause quickly before considering static hosting.

---

## Feature Maximization Blueprint
Each section lists current observations (from codebase review) and the “maximum potential” state to target during later phases.

### 1. Command Center HUD & Responsive Canvas
- _Current_: `HudWrapper`, `ResponsiveCanvas`, `CommandRibbon`, and `OperationsHeader` deliver immersive overlays with wallpaper cycling, watchers, mission summarization, and keyboard shortcuts.
- _Maximum Potential_:
  - Add multi-monitor scene presets synchronized via Supabase (persisted `hud_settings`).
  - Introduce adaptive mission modes (Recon, Deployment, After Action) altering typography, animation, and instrumentation automatically.
  - Layer per-panel observability (telemetry badges, drift indicators, downtime banners) with feature-flag telemetry logging.
  - Integrate VR-style depth and parallax using motion sensors (Capacitor plugin) for mobile tablets.

### 2. Theme Command Center & Wallpaper Library
- _Current_: Wallpaper gallery with custom uploads, image optimization, accent tone capture, radial buttons; `scripts/seed.ts` provisions wallpapers + themes.
- _Maximum Potential_:
  - Expand theme packs for liturgical seasons (Advent, Lent), auto-scheduling transitions tied to `liturgical_calendar` table.
  - Provide org-level galleries with approvals workflow (church admin reviews before deployment).
  - Support AI-assisted wallpaper synthesis (Edge Function) to convert layout images into HUD backgrounds, respecting privacy configs.

### 3. Estimator Studio
- _Current_: Hooks `useEstimatorState`, `useEstimatorScenarios`, compliance helpers, supplier intelligence stub, PDF export via `pdf.ts`.
- _Maximum Potential_:
  - Dual-pane scenario comparison with AI-suggested adjustments (material swaps, crew phasing) and profitability guardrails.
  - VDOT/ADA compliance validator that flags layout vs regulation mismatches in real time.
  - Offline-first pipeline storing drafts in IndexedDB + conflict resolution when reconnecting.
  - Auto-generated proposal bundles (PDF + ICS + mission checklist) gated by role-based approvals.

### 4. Mission Scheduler & Crew Timeline
- _Current_: Scheduler module with base panels, watchers, mission statuses.
- _Maximum Potential_:
  - Drag-and-drop Gantt timeline with worship blackout windows, ICS imports, and autop-run conflict detection.
  - Resource heatmaps showing crew utilization, equipment readiness, and weather risks.
  - Field-crew mobile sync with offline push, background sync, and hazard acknowledgement logs.

### 5. Layout & Mapping Suite
- _Current_: Leaflet-based measurement tools, hazard overlays, `CanvasPanel` hooks.
- _Maximum Potential_:
  - Multi-layer GIS overlay pipeline (drone ortho, thermal scans, google basemaps) with toggles.
  - Layout reconfiguration assistant allowing lane reflow suggestions, ADA path previews, and parking count optimizer with print-ready exports.
  - AI-driven area extraction from uploaded blueprints or aerial photos leveraging Supabase storage + background workers.

### 6. Observability & Logging
- _Current_: `initializeMonitoring`, `logEvent`, `installLovableAssetMonitoring`, `log-beacon` function references; log streaming to Sonner + Toaster; `LOG_BEACON` load scripts.
- _Maximum Potential_:
  - End-to-end tracing (frontend → Supabase Edge) via OpenTelemetry exporter.
  - Mission-critical KPIs dashboards inside app (error budget, schedule predictability, supplier lead times).
  - Auto ticket generation for repeated Lovable preview outages, integrated with Slack/Teams.

### 7. Supplier Intelligence & Engagement
- _Current_: Modules for engagement hub, supplier telemetry seeds, but limited UI surfacing.
- _Maximum Potential_:
  - Supplier scorecards with live price charts, AI summarization of risks, and recommended order windows.
  - Customer outreach automations (SMS/email) templated around church-specific cadence and compliance updates.
  - Feedback loop capturing pastor satisfaction + storing transcripts for regulatory records.

### 8. Client Portal & Admin
- _Current_: `Portal`, `AdminPanel`, RLS roles, but limited customizing.
- _Maximum Potential_:
  - Branded portal per church, timeline sharing, approval flows, redline markup on layout maps.
  - Admin-level audit dashboards showing every data touch (GDPR-style) and auto-generated compliance packets.

### 9. Mobile/Offline (Capacitor + PWA)
- _Current_: Capacitor commands, `MobileOptimizations`, offline indicators, PWA manifest.
- _Maximum Potential_:
  - Device-native features (camera scanning for cracks, push to talk for crew updates, haptics).
  - Offline-first mission packages with delta sync, queue inspection UI, and admin override for critical pushes.
  - Field-ready voice commands tied to keyboard shortcuts + theme states.

### 10. Security, Compliance, and Data Privacy
- _Current_: RLS scaffolding, secrets providers, security docs, scripts for audits.
- _Maximum Potential_:
  - Automated Virginia contractor compliance binder (retention, invoicing, licensing evidence) generated after each mission.
  - SOC2-lite control mapping with runtime policy enforcement (CSP, Trusted Types).
  - Secrets orchestration pipeline hooking Doppler/Vault with fallback to AWS SM, fully documented.

---

## New High-Value Feature Concepts
1. **Liturgical Calendar Sync & Worship Blackout Engine**  
   - Auto-import ICS feeds (church-specific) and block scheduler slots.  
   - Compare Approaches: (a) ICS ingestion via Supabase Cron vs (b) manual admin UI. ICS ingestion wins for automation but needs secure ICS token storage.
2. **Chapel Layout Composer with Parking Maximizer**  
   - Drag nodes on GIS map, AI suggests re-striping to maximize stalls; exports DXF/PDF for approvals.
3. **Incident Command Bridge**  
   - Live incident dashboards (spill, weather, crew injury) with escalation matrix + templated communications.
4. **Supplier Lead-Time Radar**  
   - Forecasts asphalt/aggregate availability using Supabase data + manual inputs; triggers reorder tasks.
5. **Pastor Communication Studio**  
   - Template library for updates, integrates with SMS/email providers, includes compliance disclaimers + translation.
6. **Mission Replay & Learning Hub**  
   - After-action timeline with telemetry, photos, crew notes, KPI comparisons; exports training packages for new hires.

---

## Refactors, Fixes, and Optimizations
| Area | Observations | Actions |
| --- | --- | --- |
| **Lovable Preview Reliability** | Connection refused implies missing health probe + strict port. | Add adaptive port binding (`PORT` env), health endpoint verification, structured logging, fallback static preview option. |
| **Routing/Base Path** | `getRouterBaseName` handles Lovable but relies on global state. | Add SSR-safe guards, rate-limiting of updates, and tests for multi-depth base paths. |
| **Theme & HUD Components** | Complex useMemo/useEffect webs risk regressions. | Extract `hud/watchers` factory, ensure <200 line modules, add memoized selectors + virtualization for watchers list. |
| **Scheduler Data Flow** | Need conflict detection & ICS import. | Build `useSchedulePlanner` hook with TanStack Query caching, Supabase RPC integration, and tests. |
| **Supabase Schema** | Mix of JS + SQL migrations; ensure idempotent naming + rollback. | Normalize migration naming, add `down` scripts, document rollback/disaster recovery, add row-level tests. |
| **Secrets Mgmt** | `SECRET_PROVIDER` logic exists but needs enforcement. | Build `config/secrets/provider.ts` with per-provider schema validation + CLI verification. |
| **Testing Coverage** | Many modules covered but new features require tests. | Expand Vitest snapshots for HUD, Playwright flows for scheduler + wallpaper upload, k6 coverage for `log-beacon`. |
| **Performance** | Leaflet + heavy analytics panels load simultaneously. | Introduce `IntersectionObserver`-based lazy mount, chunk splitting for mission panels, React profiler budgets in CI. |
| **Accessibility & i18n** | Current overlays are visually dense. | Run axe in CI, add i18n keys for new text, create manual checklist doc + recordings. |
| **Docs & DevEx** | Many docs exist but need updated branching/install instructions referencing new scripts. | Refresh README quickstart, add DevEx section for small crew, update `docs/DEPLOYMENT.md`. |

---

## Prioritized Implementation Roadmap

| Priority | Task Description | Task Type (Max-Feature/New-Feature/Refactor/Fix) | Files to Modify/Create |
| --- | --- | --- | --- |
| 1 | Implement Lovable preview reliability kit (adaptive port binding, health probe logging, feature-flagged diagnostics UI). | Fix | `vite.config.ts`, `src/lib/monitoring/lovableAssets.ts`, `src/pages/Health.tsx`, `docs/LOVABLE_PREVIEW.md` (new) |
| 2 | Ship Command Center HUD 2.0 (mission modes, telemetry badges, multi-monitor sync, VR-ready parallax). | Max-Feature | `src/components/hud/*`, `src/modules/layout/*`, `src/contexts/ThemeContext.tsx`, `tailwind.config.ts`, `src/design/tokens.ts` |
| 3 | Expand Theme Command Center (liturgical packs, org galleries, AI wallpaper ingestion). | Max-Feature/New-Feature | `src/components/ThemeCommandCenter.tsx`, `src/modules/layout/wallpaperLibrary.ts`, `scripts/seed.ts`, `supabase/migrations/*`, `supabase/functions/theme-wallpaper-ai.ts` (new) |
| 4 | Deliver Estimator Studio AI + compliance guardrails (dual-pane compare, ADA checks, offline persistence). | Max-Feature | `src/modules/estimate/**/*`, `src/hooks/useEstimatorAI.ts` (new), `supabase/functions/estimator-ai.ts` (new), IndexedDB helpers |
| 5 | Build mission scheduler timeline with worship blackout sync + conflict engine. | Max-Feature | `src/modules/scheduler/*`, `src/hooks/useSchedulePlanner.ts` (new), `supabase/functions/schedule-blackouts.ts`, ICS ingestion scripts |
| 6 | Modernize layout/mapping suite with zone layers, ADA pathing, parking optimizer exports. | Max-Feature | `src/modules/layout/*`, `src/components/map/TacticalMap.tsx`, `src/lib/map/*`, `supabase/storage/layouts` |
| 7 | Launch Incident Command Bridge (telemetry, escalation matrix, notifications). | New-Feature | `src/modules/observability/*`, `src/modules/engagement/*`, `supabase/functions/incident-bridge.ts`, `scripts/notifications/*` |
| 8 | Enhance supplier intelligence dashboards + alerts for lead times and pricing drift. | Max-Feature | `src/modules/insights/*`, `supabase/functions/supplier-tracker.ts`, `scripts/seed.ts` |
| 9 | Harden secrets + configuration pipeline (provider schemas, Doppler/Vault templates, CLI validations). | Refactor/Fix | `config/secrets/*`, `src/config/secrets.ts`, `scripts/check-env.ts`, `.github/workflows/main.yml` |
| 10 | Observability deepening (OpenTelemetry, in-app dashboards, log-beacon tracing). | Max-Feature/Refactor | `src/lib/monitoring/*`, `supabase/functions/log-beacon.ts`, `scripts/load/*`, `docs/OBSERVABILITY.md` |
| 11 | Supabase schema completion (roles, RLS tests, rollback docs, migration normalization). | Refactor/Fix | `supabase/migrations/*`, `supabase/tests/*`, `docs/SUPABASE_SCHEMA.md`, `scripts/migrate.ts` |
| 12 | Offline/mobile excellence (mission packages, background sync, haptics, camera workflows). | Max-Feature | `src/components/MobileOptimizations.tsx`, `android/app/src/*`, `src/lib/offline.ts`, `tests/mobile/*` |
| 13 | Accessibility + i18n hardening for new tactical UI. | Refactor | `src/components/**/*`, `src/lib/i18n/**/*`, `tests/accessibility/*`, `docs/A11Y_CHECKLIST.md` |
| 14 | Test automation expansion (unit/integration/e2e/load, manual checklists). | Refactor | `tests/**/*`, `e2e/**/*`, `scripts/load/*`, `docs/TESTING_GUIDE.md` |
| 15 | DevEx & documentation refresh (README, onboarding, deployment guides, branch strategy). | Refactor/Documentation | `README.md`, `CONTRIBUTING.md`, `docs/DEPLOYMENT.md`, `.github/ISSUE_TEMPLATE/*`, `scripts/install_dependencies.*` |
| 16 | Deployment pipeline upgrades (CI/CD with CodeQL, vuln scans, migrations, rollback + disaster recovery runbooks). | Fix/Security | `.github/workflows/main.yml`, `.github/workflows/security.yml` (new), `docs/DEPLOYMENT.md`, `scripts/deploy/*` |
| 17 | Incident replay + learning hub (after-action analytics, training exports). | New-Feature | `src/modules/insights/*`, `supabase/functions/mission-replay.ts`, `docs/TRAINING.md` |
| 18 | Customer communication studio with templated multi-channel updates + translation. | New-Feature | `src/modules/engagement/*`, `supabase/functions/communications.ts`, `src/lib/i18n/*` |
| 19 | Pastor/portal upgrades (approvals, redlines, custom branding). | Max-Feature | `src/pages/Portal/*`, `src/components/Portal/*`, `supabase/functions/portal-branding.ts`, `public/branding/*` |
| 20 | Final handover & retrospective (file manifest, contributor guide, deployment checklist, lessons learned). | Documentation | `docs/FINAL_HANDOVER.md`, `docs/FIRST_TIME_CONTRIBUTOR.md`, `docs/DEPLOYMENT_CHECKLIST.md`, `docs/RETROSPECTIVE.md` |

---

## Immediate Next Actions (Phase 2 Preview)
1. Stand up `.env.example` validation (ensure Lovable + Supabase env parity) and confirm no secrets committed.
2. Regenerate dependency install scripts (shell + PowerShell) with flags for Playwright/Husky.
3. Audit Husky + lint-staged wiring; ensure `pre-commit` executes env check + targeted linters in <90s for small-team velocity.
4. Prepare `.github` issue/PR templates referencing new roadmap to align contributors.

> _Once the above documentation is accepted, Phase 2 will execute automatically per master plan, starting with DevEx tooling hardening._
