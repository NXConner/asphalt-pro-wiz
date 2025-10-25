## Project Summary

- Name: Pavement Performance Suite (Estimator + AI Assistant)
- Stack: Vite, React, TypeScript, Tailwind, shadcn-ui, React Router, TanStack Query
- AI: Google Gemini 1.5 (chat and image analysis) via `src/lib/gemini.ts`
- Domain: Asphalt maintenance estimating, crack fill, sealcoating, line-striping, with church parking lot focus
- State: Solid estimator UI with map-assisted measurement, internal cost model, invoice view, AI Q&A + image analysis, local file/docs storage via IndexedDB

### Key Capabilities Found

- Area measurement (map drawing and manual shapes), travel calculations, sealcoating options, crack repair, striping breakdown, premium add-ons, custom services
- Cost model in `src/lib/calculations.ts` with labor, materials, travel, overhead, and profit
- Theme toggling and basic hue customizer
- AI assistant with text Q&A and image analysis (Gemini), but no retrieval (RAG) or domain corpus yet
- Uploads panel for job files and internal docs (IndexedDB)

### Gaps / Risks

- Backend API/proxy missing; Gemini API key currently used in browser. Need a thin server (or Supabase Edge Function) to proxy AI calls and protect secrets.
- Supabase present with unified migrations, but RLS policies and role mappings need environment-specific hardening and tests.
- CI/CD pipeline missing (no GitHub Actions workflow). No automated lint, test, build, docker, scans, or migrations in CI.
- Secrets management is documented but not integrated (no Doppler/Vault/AWS SM wiring). `.env.example` lacks some observability keys (e.g., `VITE_LOG_BEACON_URL`).
- OpenAPI/docs: generator script placeholder exists but there is no backend to document yet.
- Observability limited to client logs; no metrics/tracing and no server-side logs.
- Design system is defined in CSS variables and `ThemeCustomizer`, but tokens are not typed and not centrally exported for TS consumption.
- Android (Capacitor) present; no release pipeline hardening, signing guidance, or runtime permission audits.

## Improvement & Completion Plan (Prioritized)

1. Security and DevEx foundations

- Add env template, Prettier, Husky pre-commit, eslint a11y, and basic security scripts
- Move toward backend mediation for AI keys (scaffold)

2. Containerization & Local Orchestration

- Multi-stage Dockerfile, docker-compose with app + Postgres (pgvector) for future RAG and analytics

3. RAG “training” pipeline and UI integration

- Ingestion scripts (local files and optional GitHub repos), build embeddings (Gemini embeddings), store index
- Frontend retrieval module to augment Gemini prompts with top-k context

4. Supabase schema & migrations

- node-pg-migrate setup; initial schema for users, roles, jobs, estimates, documents; RLS policies baseline
- Seed script and role assignment; instructions for admin user

5. Security hardening

- Secrets manager placeholders; npm audit/Snyk scripts; dependency pinning guidelines

6. Testing (unit, integration, E2E) and a11y checks

- Jest/Vitest + Testing Library; Playwright for core flows; add a11y checks

7. Performance & load testing

- k6/Artillery scripts for key UI/API paths (when backend exists)

8. API documentation

- When backend routes exist, add OpenAPI annotations and generator script

9. Documentation suite

- README overhaul, CONTRIBUTING, CODEOWNERS, CHANGELOG, LICENSE

10. Deployment & observability pipeline

- GitHub Actions for lint/test/build/docker, CodeQL, dependency scans, migrations, and basic log/metric hooks

### Feature Maximization Ideas

- Estimator: scenario comparisons, versioned estimates, configurable labor/material catalogs per supplier, auto-optimizing striping layouts for maximum stalls (church layouts), weather windows and scheduling constraints
- Mapping: snap-to-curb detection, polygon library, import GeoJSON/KML, measure crack networks separately
- AI: RAG with standards and manuals, image multi-region measurements, material spec suggestions by substrate/traffic, automatic proposal generation
- Invoicing: branding themes, taxes/discounts, multi-currency, partial billing and change orders
- Team ops: multi-user roles, job checklists, photo logs, daily reports, timesheets
- Offline-first: persist drafts and sync when online

### Refactors / Optimizations

- Extract design tokens to a typed design system module
- Stronger types for cost breakdown and services
- Feature flags for major modules
- Centralized logging utility (structured logs)

## Phased Implementation Roadmap

| Priority | Task Description                                                                                          | Task Type   | Files to Modify/Create                                                                      |
| -------- | --------------------------------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------------------------- |
| P0       | Refresh Phase 1 analysis (this doc) to current state                                                      | Refactor    | docs/PHASE_1_ANALYSIS.md                                                                    |
| P0       | DevEx polish: add .prettierrc, extend .env.example (beacon keys), ensure Husky pre-commit runs lint/tests | Refactor    | package.json, .prettierrc, .env.example, .husky/pre-commit                                  |
| P0       | RAG ingestion & retrieval hardening (chunking, rate limits, docs)                                         | Max-Feature | scripts/ingest/ingest.ts, src/lib/rag.ts, public/rag/index.json                             |
| P0       | Security: move Gemini calls behind server/edge proxy; add feature-flag override via env                   | Max-Feature | scripts/server/_ or supabase/functions/_, src/lib/gemini.ts, src/lib/flags.ts, .env.example |
| P1       | Supabase: finalize RLS/roles and add tests; seed admin membership                                         | New-Feature | supabase/migrations/_, scripts/seed.ts, tests/db/_                                          |
| P1       | CI/CD: add GitHub Actions (lint, unit, e2e, build, docker, audit, CodeQL)                                 | New-Feature | .github/workflows/main.yml                                                                  |
| P1       | Secrets & scanning: wire npm audit/Snyk, document Doppler/Vault/AWS SM usage                              | Refactor    | docs/SECRETS_AND_CONFIG.md, package.json                                                    |
| P1       | Testing expansion (unit + integration + E2E with a11y checks)                                             | New-Feature | tests/\*_/_, vitest.config, e2e/\*                                                          |
| P2       | Observability: client beacon config, server logs, basic metrics                                           | New-Feature | src/lib/logging.ts, server functions, README.md                                             |
| P2       | Docs & templates: README, CONTRIBUTING, issue/PR templates                                                | New-Feature | .github/\*, README.md, CONTRIBUTING.md                                                      |
| P2       | Mobile build and release notes: signing, permissions, testing checklist                                   | New-Feature | docs/ANDROID_RELEASE.md, android/\*                                                         |

### Additional Findings and Immediate Fixes

- Add `VITE_LOG_BEACON_URL` to `.env.example` to enable client log beacons in production.
- Ensure `scripts/ingest/ingest.ts` respects API rate limits and fails fast when `GEMINI_API_KEY` is missing.
- Keep Gemini API keys off the client by introducing a minimal proxy (Node or Supabase Edge Functions) and switching `src/lib/gemini.ts` to call it.
- Add `.prettierrc` to align formatting across contributors.
