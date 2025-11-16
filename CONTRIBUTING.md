# Contributing

We welcome contributions that move Pavement Performance Suite toward production-grade excellence. Please follow the guidelines below to keep reviews fast, predictable, and compliant.

> 📘 **New here?** Start with the [Contributor Onboarding Guide](./docs/CONTRIBUTOR_GUIDE.md) for environment prerequisites, first-run scripts, and a sample PR checklist.

## 1. Before You Start

- Create a feature branch from `main` using the pattern `feature/<scope>` (or `hotfix/<scope>` for urgent fixes).
- Sync environment variables (`cp .env.example .env`) and populate real secrets locally.
- Install dependencies via `scripts/install_dependencies.sh` (PowerShell variant available).
- Run `npm run check:env -- --strict` to verify required secrets/config entries before you begin coding.

## 1.1 Branching Strategy

- `main` is the deployable trunk; every commit must be production-ready behind feature flags when necessary.
- Feature work: `feature/<initiative>/<scope>` (e.g. `feature/premium-marketplace/minimize-toggle`). Keep branches short-lived and rebase on `main` before opening a PR.
- Hotfixes: `hotfix/<scope>` cut from `main`, merged back into `main` after verification.
- Release tags are cut from `main` post-merge; avoid long-lived release branches. If staging stabilization is required, use `release/<version>` with a clear exit plan.
- Always gate unfinished functionality with feature flags to keep `main` releasable.

## 2. Development Workflow

1. Keep commits small, focused, and formatted with [Conventional Commits](https://www.conventionalcommits.org/).
2. Update or create tests alongside code changes:
   - Unit / integration: `npm run test:unit -- --run`
   - E2E: `npm run test:e2e`
    - Load (when relevant to performance-sensitive surfaces):
      ```bash
      BASE_URL=http://localhost:5173 npx k6 run scripts/load/k6-estimate.js --summary-export ./artifacts/k6-estimate.json
      npx artillery run scripts/load/artillery.yml --output ./artifacts/artillery-smoke.json
      ```
3. Regenerate the OpenAPI spec if Supabase Edge contracts change:
   ```bash
   npm run openapi:generate
   ```
4. Lint and format before pushing:
   ```bash
   npm run format
   npm run lint
   npm run typecheck
   ```

### 2.1 Documentation & Artifact Updates

- **API contracts**: Update the corresponding `@openapi` doc blocks under `supabase/functions/**` and re-run `npm run openapi:generate`. Commit the resulting `docs/swagger.json`.
- **Reference docs**: Reflect behavioural or operational changes in `README.md`, `docs/API_REFERENCE.md`, `docs/SECRETS_AND_CONFIG.md`, `docs/SECURITY_*`, and `docs/PRODUCTION_READINESS.md` as appropriate.
- **Load & security outputs**: If you run k6/Artillery or `npm run security:ci`, capture summaries (`--summary-export`, `--output`, CI artifacts) and reference them in your PR.
- **Changelog**: Add an entry to `CHANGELOG.md` for any user-facing feature, fix, or breaking change.

## 3. Pre-Commit Hooks

Husky enforces:

- `lint-staged` (scoped formatting)
- `npm run lint`
- `npm run typecheck`
- `npm run test:unit -- --run`

Run `SKIP_HUSKY=1 git commit ...` only in exceptional situations (e.g. CI).

## 4. Pull Request Checklist

Include in every PR description:

- Problem statement and solution summary
- Test plan (unit, e2e, load as applicable) with command outputs
- Risk/rollback strategy
- Screenshots or GIFs for UI changes

Ensure the following before requesting review:

- ✅ `npm run lint`
- ✅ `npm run test:unit -- --run`
- ✅ `npm run test:e2e` _(acknowledge Playwright dependency warning if applicable)_
- ✅ `npm run openapi:generate` _(when API contract changed)_
- ✅ Documentation updated (`README.md`, `docs/`, `CHANGELOG.md`, `docs/API_REFERENCE.md`)

## 5. Code Review Expectations

- Two approvals required unless CODEOWNERS specifies otherwise.
- Reviewers focus on correctness, security, accessibility, and performance regressions.
- Address feedback with follow-up commits; avoid force-push except to rebase before merge.

## 6. Release Notes

- Append an entry to `CHANGELOG.md` for every user-facing feature or fix and mention which verification steps (tests, load/perf, security scans) were executed.
- Ensure the relevant `docs/` pages (`README.md`, `docs/API_REFERENCE.md`, `docs/PRODUCTION_READINESS.md`, etc.) reflect any new behaviour, flags, or operational changes.

## 7. Security & Secrets

- **Secrets**: Never commit credentials. Use `.env` plus the supported secret managers documented in `docs/SECRETS_AND_CONFIG.md`, and run `npm run check:env -- --strict` before opening a PR.
- **Security validation**: When touching dependencies or auth/PII flows, run `npm run security:ci` (or capture the CI artifact) and reference the results in your PR.
- **Threat modelling**: If a change affects authentication, authorisation, or data retention, include a short summary of the impact and mitigations in the PR description.
- **Incidents**: Follow `docs/SECURITY_REMEDIATION_GUIDE.md` for responsible disclosure and response checklists.

Thank you for helping keep Pavement Performance Suite robust, observable, and production-ready!
