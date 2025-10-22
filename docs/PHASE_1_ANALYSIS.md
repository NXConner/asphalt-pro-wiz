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
- No backend; Gemini API key exposed in client
- No database/migrations; Supabase integration not set up
- No test coverage; no CI/CD; no containerization
- No structured secrets handling; no vulnerability scanning
- No OpenAPI because no backend routes yet
- Accessibility linting not configured; limited design system modularity
- No feature flags or observability hooks

## Improvement & Completion Plan (Prioritized)

1) Security and DevEx foundations
- Add env template, Prettier, Husky pre-commit, eslint a11y, and basic security scripts
- Move toward backend mediation for AI keys (scaffold)

2) Containerization & Local Orchestration
- Multi-stage Dockerfile, docker-compose with app + Postgres (pgvector) for future RAG and analytics

3) RAG “training” pipeline and UI integration
- Ingestion scripts (local files and optional GitHub repos), build embeddings (Gemini embeddings), store index
- Frontend retrieval module to augment Gemini prompts with top-k context

4) Supabase schema & migrations
- node-pg-migrate setup; initial schema for users, roles, jobs, estimates, documents; RLS policies baseline
- Seed script and role assignment; instructions for admin user

5) Security hardening
- Secrets manager placeholders; npm audit/Snyk scripts; dependency pinning guidelines

6) Testing (unit, integration, E2E) and a11y checks
- Jest/Vitest + Testing Library; Playwright for core flows; add a11y checks

7) Performance & load testing
- k6/Artillery scripts for key UI/API paths (when backend exists)

8) API documentation
- When backend routes exist, add OpenAPI annotations and generator script

9) Documentation suite
- README overhaul, CONTRIBUTING, CODEOWNERS, CHANGELOG, LICENSE

10) Deployment & observability pipeline
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

| Priority | Task Description | Task Type | Files to Modify/Create |
|---|---|---|---|
| P0 | Add DevEx foundations: Prettier, Husky, env template, a11y ESLint | Refactor | package.json, eslint.config.js, .prettierrc.json, .husky/pre-commit, .env.example |
| P0 | Dockerize app and compose Postgres (pgvector) | New-Feature | Dockerfile, docker-compose.yml, .dockerignore |
| P0 | RAG ingestion pipeline (local + GitHub) and UI retrieval | Max-Feature | scripts/ingest/ingest.ts, src/lib/rag.ts, src/lib/gemini.ts, public/rag/index.json (generated) |
| P0 | Fix duplicate ReceiptsPanel and add feature flag 'receipts' | Fix | src/components/ReceiptsPanel.tsx, src/pages/Index.tsx, src/lib/flags.ts, .env.example, tests/lib/flags.test.ts |
| P1 | Supabase migrations with RLS, roles/user_roles, seed script | New-Feature | supabase/migrations/*, scripts/seed.ts, scripts/db/*, package.json |
| P1 | Secrets & security scanning | Refactor | docs/secrets.md, package.json |
| P1 | Testing setup (unit/integration/E2E) and a11y checks | New-Feature | vitest/playwright config, tests/* |
| P2 | Performance/load testing | New-Feature | scripts/load/*, README.md |
| P2 | API docs (when backend present) | New-Feature | scripts/openapi/*, docs/api.md |
| P2 | Documentation suite | New-Feature | README.md, CONTRIBUTING.md, CODEOWNERS, CHANGELOG.md, LICENSE |
| P2 | Observability and CI/CD | New-Feature | .github/workflows/main.yml, src/lib/logging.ts |

### Additional Findings and Immediate Fixes

- Resolve two conflicting implementations in `src/components/ReceiptsPanel.tsx` by consolidating into a single, comprehensive component. This eliminates duplicate exports/imports and runtime ambiguity.
- Introduce a `receipts` feature flag in `src/lib/flags.ts` with a corresponding `VITE_FLAG_RECEIPTS` `.env` entry to control visibility in `src/pages/Index.tsx`.
- Add a small unit test to assert default flag behavior.
