# Contributor Onboarding Guide

Welcome! This guide walks new contributors through the end-to-end process of getting a local environment running, validating changes, and shipping high-quality pull requests for Pavement Performance Suite.

## 1. Prerequisites

| Requirement | Notes |
| ----------- | ----- |
| **Node.js 18.x or 20.x** | Match the version in `.nvmrc`/`package.json`. Install via `nvm`, Volta, or the official installer. |
| **pnpm or npm** | The repo uses `npm` scripts, but any Node package manager works if you know what you’re doing. |
| **Git + GitHub** | Fork the repo (`continue-repo/pavement-performance-suite`) and clone it locally. |
| **Docker Desktop / Colima** (optional) | Required for running the Supabase local stack or containerized dev environments. |
| **Supabase CLI** (optional) | Enables local Edge Function testing; see `docs/UNIFIED_SUPABASE_GUIDE.md`. |
| **Playwright browsers** | Installed automatically via `scripts/install_dependencies`. Required for `npm run test:e2e`. |

## 2. First-Time Setup Checklist

1. **Clone & branch**
   ```bash
   git clone https://github.com/<your-org>/pavement-performance-suite.git
   cd pavement-performance-suite
   git checkout -b feature/<topic>
   ```

2. **Hydrate environment variables**
   ```bash
   cp .env.example .env
   # fill in required secrets (Supabase keys, API tokens, etc.)
   ```
   > Need help? See `docs/SECRETS_AND_CONFIG.md` for provider-specific instructions, or ask for a temporary sandbox secret set.

3. **Install dependencies & verify toolchain**
   ```bash
   ./scripts/install_dependencies.sh --strict-env
   # or: pwsh ./scripts/install_dependencies.ps1 -StrictEnv
   ```
   This command installs npm packages, configures Husky, and runs `npm run check:env` to ensure you have every required variable.

4. **Run the full verification pass**
   ```bash
   npm run lint
   npm run typecheck
   npm run test:unit
   npm run test:e2e   # requires Playwright browsers
   npm run openapi:generate
   ```
   If you are touching load-sensitive code, also run the applicable k6/Artillery scripts from `scripts/load/`.

5. **Serve locally**
   ```bash
   npm run dev
   # Or boot the dockerized stack with supporting services:
   docker compose --profile dev up devserver db measurement-ai
   ```

## 3. Working Agreement

- **Small, focused commits** using [Conventional Commits](https://www.conventionalcommits.org/). Example: `feat(estimator): add guardrails for zero-area segments`.
- **Feature flags everywhere** so `main` is always releasable.
- **Update docs + tests in the same PR**—README, `docs/…`, `docs/swagger.json`, and any relevant automated tests should evolve with your code.
- **Keep artifacts**: when running load tests or generating OpenAPI docs, commit the updated `docs/swagger.json` and attach relevant outputs (e.g., `artillery` JSON via CI artifacts).
- **Respect CODEOWNERS**: `@NXConner` currently owns all critical directories. Loop them in early for architecture-impacting changes.

## 4. Submitting a Pull Request

Before opening a PR, confirm:

1. `npm run lint`, `npm run typecheck`, `npm run test:unit`, and `npm run test:e2e` all pass locally.
2. If applicable, `npm run openapi:generate` has been executed and `docs/swagger.json` is committed.
3. Load tests or k6/Artillery scripts have been run (when touching performance-sensitive code) and results are summarized in the PR description.
4. `docs/CHANGELOG.md`, `README.md`, `docs/API_REFERENCE.md`, or `docs/SECURITY_*` are updated if your change impacts end users or operators.
5. Include a “Test Plan”, “Risk & Rollback”, and relevant screenshots/gifs in the PR body. Reference any Jira/GitHub issues.

Use this template when writing your PR description:

```
## Summary
- What problem does this solve?
- How was it implemented?

## Testing
- [ ] npm run lint
- [ ] npm run typecheck
- [ ] npm run test:unit -- --run
- [ ] npm run test:e2e
- [ ] npm run openapi:generate (if API changes)
- [ ] Load/perf scripts (link results if applicable)

## Risk / Rollback
- e.g., “Feature flagged behind VITE_FLAG_…, revert by toggling flag.”

## Screenshots / Notes
```

## 5. Useful References

- **Architecture & Roadmap** – `README.md`, `docs/PHASE_*`
- **API Contracts** – `docs/swagger.json` + `docs/API_REFERENCE.md`
- **Supabase & Security** – `docs/UNIFIED_SUPABASE_GUIDE.md`, `docs/SECURITY_OPERATIONS.md`, `docs/RLS_SECURITY.md`
- **Testing** – `docs/TESTING_GUIDE.md`, `scripts/load/README.md`
- **Release & Ops** – `docs/PRODUCTION_READINESS.md`, `docs/SECURITY_REMEDIATION_GUIDE.md`

When in doubt, ask questions early—maintainers would much rather clarify direction than rework a large PR. Happy shipping!
