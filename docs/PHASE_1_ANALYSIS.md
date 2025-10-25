## Project Summary

- Name: Pavement Performance Suite (Estimator + AI Assistant)
- Stack: Vite, React, TypeScript, Tailwind, shadcn-ui, React Router, TanStack Query
- AI: Google Gemini 1.5 (chat, image, embeddings) via `src/lib/gemini.ts` or Supabase Edge Function proxy
- Domain: Asphalt maintenance estimating, crack fill, sealcoating, line-striping (optimized for church parking lots)
- State: Mature estimator UI with map-assisted measurement, internal cost model, invoice view, AI Q&A + image analysis, local IndexedDB storage, theming and custom wallpapers. Lint, type-check, and unit tests currently pass.

### Key Capabilities
- Area measurement (map drawing/manual shapes), travel calculations, sealcoating options, crack repair, striping breakdown, premium add-ons, custom services
- Cost model in `src/lib/calculations.ts` with labor, materials, travel, overhead, and profit
- Theme toggle, multi-theme presets, hue override, radius control, custom wallpaper upload with opacity/blur
- AI assistant (text/image) with optional proxy function `supabase/functions/gemini-proxy`
- Uploads panel and internal docs via IndexedDB; basic RAG scaffolding and OpenAPI placeholder

### Current Risks / Gaps
- AI key exposure risk if proxy not used everywhere; ensure `VITE_GEMINI_PROXY_URL` is preferred and documented
- RLS policies and role mappings should be validated with automated tests for multi-tenant scenarios
- CI/CD can further harden with Docker build/push and optional migrations gates
- Observability: client beacon exists; server-side logs/metrics not yet wired
- Docker Compose passes VITE_ env at runtime (static site); document build-arg alternative when needed

## Improvement & Completion Plan (Prioritized)

1) Security + DevEx
- Enforce type-check in pre-commit; keep keys behind proxy; extend env template for flags/observability

2) Containerization & Orchestration
- Multi-stage Dockerfile (present); Compose with Postgres/pgvector (present) — document env/build-args

3) RAG and AI
- Improve ingestion and retrieval; prefer proxy for all AI calls; enable embeddings caching

4) Supabase schema & migrations
- Validate roles/RLS via tests; seed admin role assignment

5) Testing & a11y
- Expand unit/integration; E2E retained; add a11y checks where practical

6) Security hardening
- npm audit high, Snyk test/monitor; secrets manager placeholders

7) CI/CD & Observability
- Build/push Docker images on main; optional migrations; CodeQL and audits; lightweight log beacons

### Feature Maximization Ideas
- Estimator: scenario comparisons, versioned estimates, supplier catalogs, weather windows, auto stall layout optimization
- Mapping: snap-to-curb detection, polygon library, GeoJSON/KML import, crack-network measurement
- AI: RAG with standards/manuals, multi-region image analysis, substrate/traffic-driven spec suggestions, auto proposal generator
- Invoicing: branding themes, taxes/discounts, partial billing and change orders
- Team ops: roles, checklists, photo logs, daily reports, timesheets
- Offline-first: robust sync

### Refactors / Optimizations
- Typed design tokens usable in TS and CSS
- Stronger types for cost breakdowns and services
- Centralized structured logging with beacon fallback

## Phased Implementation Roadmap

| Priority | Task Description | Task Type | Files to Modify/Create |
|---|---|---|---|
| P0 | Refresh Phase 1 analysis (this doc) to current state | Refactor | docs/PHASE_1_ANALYSIS.md |
| P0 | Add `typecheck` script and run in Husky pre-commit | Refactor | package.json, .husky/pre-commit |
| P0 | Prefer Gemini proxy everywhere; document env | Max-Feature | src/lib/gemini.ts, supabase/functions/gemini-proxy, README.md |
| P1 | CI/CD: build & push Docker, optional migrations, CodeQL, audits | New-Feature | .github/workflows/main.yml |
| P1 | RLS roles/tests and admin seed verification | New-Feature | supabase/migrations/*, tests/db/*, scripts/seed.ts |
| P2 | Observability: client beacon guidance, server logs/metrics stubs | New-Feature | src/lib/logging.ts, README.md |
| P2 | RAG: ingestion/retrieval improvements and docs | Max-Feature | scripts/ingest/ingest.ts, src/lib/rag.ts, public/rag/index.json |
| P2 | Docs & templates polish | Refactor | README.md, .github/* |

### Immediate Fixes Already Applied
- Lint, type-check, and unit tests passing; React hooks dependency updates; ESLint config tightened; `.prettierrc.json` added.

