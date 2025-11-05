# Contributing

We welcome contributions that move Pavement Performance Suite toward production-grade excellence. Please follow the guidelines below to keep reviews fast and predictable.

## 1. Before You Start

- Create a feature branch from `main` using the pattern `feature/<scope>` (or `hotfix/<scope>` for urgent fixes).
- Sync environment variables (`cp .env.example .env`) and populate real secrets locally.
- Install dependencies via `scripts/install_dependencies.sh` (PowerShell variant available).

## 2. Development Workflow

1. Keep commits small, focused, and formatted with [Conventional Commits](https://www.conventionalcommits.org/).
2. Update or create tests alongside code changes:
   - Unit / integration: `npm run test:unit -- --run`
   - E2E: `npm run test:e2e`
   - Load (when relevant to performance-sensitive surfaces):
     ```bash
     BASE_URL=http://localhost:5173 npx k6 run scripts/load/k6-estimate.js
     npx artillery run scripts/load/artillery.yml
     ```
3. Regenerate the OpenAPI spec if Supabase Edge contracts change:
   ```bash
   npm run openapi:generate
   ```
4. Lint and format before pushing:
   ```bash
   npm run format
   npm run lint
   ```

## 3. Pre-Commit Hooks

Husky enforces:

- `lint-staged` (scoped formatting)
- `npm run lint`
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
- ✅ Documentation updated (`README.md`, `docs/`, `CHANGELOG.md`)

## 5. Code Review Expectations

- Two approvals required unless CODEOWNERS specifies otherwise.
- Reviewers focus on correctness, security, accessibility, and performance regressions.
- Address feedback with follow-up commits; avoid force-push except to rebase before merge.

## 6. Release Notes

When merging user-facing features, append an entry to `CHANGELOG.md` (see existing format). Mention load/performance validation if it was run.

Thank you for helping keep Pavement Performance Suite robust, observable, and production-ready!
