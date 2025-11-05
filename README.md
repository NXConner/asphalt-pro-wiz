# Pavement Performance Suite

Modern, AI-assisted operations cockpit for asphalt estimation, scheduling, and client collaboration with a focus on church facilities across Virginia.

## System Overview

- **Frontend**: React 18 + Vite + TypeScript, shadcn/ui, TailwindCSS, `react-grid-layout` for adaptive canvases.
- **State & Data**: React Query, IndexedDB caching, Supabase client, feature-flag service.
- **Tooling**: ESLint (flat config) + Prettier + Husky + lint-staged, Vitest + Playwright, k6/Artillery load kits.
- **Mobile**: Capacitor Android shell for native deployments.

## Quickstart (Dev, Test, Prod-ready)

1. Clone and enter the repo.
2. Duplicate the environment template and provide real secrets (never placeholders):
   ```sh
   cp .env.example .env
   ```
3. Install dependencies and prepare tooling (PowerShell users can run the `.ps1` variant):
   ```sh
   scripts/install_dependencies.sh
   # or
   pwsh ./scripts/install_dependencies.ps1
   ```
   - `--skip-playwright` to avoid browser downloads (CI containers)
   - `--skip-husky` on read-only CI runners
   - Windows shells **must** run the PowerShell script (`.ps1`). See `docs/WINDOWS_SETUP.md` for end-to-end Windows guidance, including environment variables and migrations.
4. Start the dev server and refresh existing preview:
   ```sh
   npm run dev
   ```
5. Run quality gates before opening a PR:
   ```sh
   npm run lint
   npm run test:unit -- --run
   npm run test:e2e   # requires dev server
   ```

## Environment Configuration

- All variables live in `.env` (template in `.env.example`). Key values:
  - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `VITE_GEMINI_PROXY_URL` (required outside local dev), `GEMINI_API_KEY` for server scripts
  - Observability exporters (`VITE_LOG_BEACON_URL`, `VITE_OBSERVABILITY_EXPORTER_URL`, `OBSERVABILITY_API_KEY`)
  - Mapping + weather integrations (`VITE_GOOGLE_MAPS_API_KEY`, `VITE_OPENWEATHER_API_KEY`, `VITE_MAPBOX_TOKEN`)
  - `VITE_APP_VERSION` surfaced in structured logs
- Feature flags (set to `1`/`0`): `VITE_FLAG_OBSERVABILITY`, `VITE_FLAG_COMMANDCENTER`, plus UI toggles for other labs features
- Config is environment-specific; never commit `.env`.
- Supabase setup, seed strategy, and shared project guidance: `docs/UNIFIED_SUPABASE_GUIDE.md`.
- Detailed Windows setup (PowerShell commands, env vars, migrations): `docs/WINDOWS_SETUP.md`.

## Branching Strategy

- `main`: production-ready, auto-deployed on passing CI.
- `develop`: integration branch for completed epics before release hardening.
- Feature branches: `feature/<scope>-<ticket>` (e.g., `feature/operations-canvas-PPS-102`).
- Hotfix branches from `main`: `hotfix/<scope>`.
- Use PR templates in `.github/` and ensure Husky hooks pass before merge.

## Developer Tooling & Standards

- **Formatting**: Prettier + `prettier-plugin-tailwindcss` (`npm run format` / `format:check`).
- **Linting**: ESLint with React, security, accessibility, import-order, and Prettier alignment (`npm run lint`).
- **Type Safety**: TypeScript strictness enforced in lib/modules.
- **Python utilities**: `pyproject.toml` configures Black/Flake8/isort for Supabase scripts or data tooling.
- **Commit Hygiene**: Husky pre-commit runs lint-staged diff formatting + full lint + unit suite. Commit messages validated against Conventional Commits via `commitlint`.

### Testing Matrix

- `npm run test:unit` – Vitest with jsdom.
- `npm run coverage` – coverage gate (85% target).
- `npm run test:e2e` – Playwright smoke covering estimator, feature flags, uploads.
- Load packs in `scripts/load/` (`k6` + `artillery`).
- Accessibility audits included via `vitest-axe` suites.

## Operational Guides

### Executive Command Center

- Navigate to `/command-center` (or use the header shortcut) once the `commandCenter` flag is enabled.
- Requires Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) to hydrate analytics.
- Surfaces live metrics for job statuses, revenue, and crew coverage; logs telemetric events for observability when loaded.

- **Containers**: Build the optimized Nginx image and launch Postgres locally:
  ```sh
  docker compose --env-file .env up --build
  ```
  - Override build-time metadata via `VITE_APP_VERSION=1.0.0 docker compose build`
  - Shut down and remove the volume when resetting state: `docker compose down -v`
- **Security Scan**: Audit dependencies before releases:
  ```sh
  npm run security:scan
  ```
- **Database**: Launch local Postgres with Docker Compose, run migrations + seeds via `npm run migrate:up` / `npm run seed` (requires `DATABASE_URL`).
- **AI Proxy**: Deploy Supabase Edge `gemini-proxy` and set `VITE_GEMINI_PROXY_URL`. Direct API key usage is blocked in production builds.
- **Android Build**: `npm run mobile:prep` prepares assets; gradle tasks under `android/` handle APK generation.
- **Observability**: Client logs beaconed when `VITE_LOG_BEACON_URL` is set; additional exporters controlled via `VITE_OBSERVABILITY_EXPORTER_URL` and sampling flags.

## Contribution Reference

- Ownership rules: `CODEOWNERS`
- Workflow expectations and review checklist: `CONTRIBUTING.md`
- Architectural notes, Supabase admin setup, and security posture: see `docs/` folder.

## License

MIT – see `LICENSE`.
