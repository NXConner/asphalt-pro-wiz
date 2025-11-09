## Future Iteration Roadmap

### 1. Backend Realization & OpenAPI Parity

- Stand up a lightweight Node/Express (or Supabase Edge Function) router under `supabase/functions/api`.
- Port the existing `docs/swagger.json` definitions into route handlers using JSDoc/OpenAPI decorators.
- Add `npm run openapi:generate` integration tests to assert schema parity between code annotations and generated spec.
- Provide Supabase RLS-aware SQL views for API consumption (jobs, missions, telemetry) to maintain least privilege.

### 2. Advanced Observability & Crew Analytics

- Expand `observability_sessions` and `telemetry_metrics` tables with derived materialized views (crew utilization, blackout clashes).
- Ship a React dashboards module (`src/modules/analytics`) using Recharts to surface KPIs: average mission duration, overtime alerts, utilization heatmaps.
- Integrate alerts (Supabase Functions + email/webhook) for exceeding thresholds established in load tests.

### 3. Mobile & Offline Enhancements

- Implement background sync conflict resolution: add `sync_state` columns in mission tables and a reconciliation queue in IndexedDB.
- Extend Capacitor shell with camera capture workflow storing media via Supabase Storage and linking to `compliance_artifacts`.
- Add push notification scaffolding (Capacitor Push + Supabase Edge) for mission reassignment and weather alerts.

### 4. Compliance Automation Toolkit

- Build serverless generator (`supabase/functions/compliance-packet`) that assembles ADA/VDOT checklists, maps, and receipts into PDF bundles.
- Map `compliance_artifacts` metadata to templated report sections; expose UI trigger in `CanvasPanel`.
- Document retention/archival workflows in `docs/COMPLIANCE_AUTOMATION.md` and schedule data purge scripts.

### 5. Feature Flag Governance Console

- Back feature flag state with Supabase tables (`feature_flags`, `org_feature_flags`, `user_feature_flags`) including audit logs.
- Create admin UI (`src/modules/flags/FeatureFlagConsole.tsx`) for search, rollout strategies, and per-environment defaults.
- Automate stale-flag detection via scripts comparing active code references against Supabase entries.

### Execution Guidance

- Prioritize backend realization first to unlock analytics/API workflows.
- Treat each stream as its own milestone with integration tests, Supabase migrations, and documentation updates.
- Maintain observability (structured logging, OTEL traces) as new features roll out; update load tests accordingly.
