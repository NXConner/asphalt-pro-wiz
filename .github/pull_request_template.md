## Summary

- Describe the new capability or fix in one or two sentences.
- Note any user-facing impact for church administrators or field crews.

## Change Type

- [ ] Feature / Enhancement
- [ ] Bug fix / Regression guard
- [ ] Refactor / Tech debt
- [ ] Release automation / Ops

## Validation

- [ ] Unit tests (`npm run test:unit -- --run`)
- [ ] Integration or contract tests (if applicable)
- [ ] E2E tests (`npm run test:e2e`)
- [ ] Lint & formatting (`npm run lint` / `npm run format:check`)
- [ ] Type safety (`npm run typecheck`)
- [ ] Accessibility checks (axe, keyboard traversal)

## Observability & Security

- [ ] Structured logging updated where new flows exist
- [ ] Lovable preview health/diagnostics updated (if touching dev server / routing)
- [ ] Feature flags toggled or documented (including Supabase flag docs)
- [ ] Secrets handled via env/secret manager (no hard-coded values)

## Preview & Deployability

- [ ] `/health` endpoint verified locally (`npm run dev` or container)
- [ ] Lovable preview connection tested (if applicable)
- [ ] Rollback / migration notes captured

## Documentation

- [ ] README / docs updated
- [ ] Changelog entry drafted (if release-worthy)
- [ ] Deployment or migration notes captured
