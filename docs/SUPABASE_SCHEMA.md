## Supabase Schema & Migrations (Phase 5)

This project uses [`node-pg-migrate`](https://salsita.github.io/node-pg-migrate/) to manage the Postgres schema inside Supabase. All migrations live under `supabase/migrations` and are executed with the npm scripts defined in `package.json`.

### Commands

```bash
# create a new timestamped migration
npm run migrate:create <name>

# apply all pending migrations (DATABASE_URL must be set)
npm run migrate:up

# rollback the most recent migration
npm run migrate:down

# hydrate demo data (requires ADMIN_EMAIL to point to a Supabase Auth user)
ADMIN_EMAIL=n8ter8@gmail.com npm run seed
```

### Core Tables & Policies

| Table | Purpose | RLS Summary |
| --- | --- | --- |
| `public.roles`, `public.user_roles` | Platform roles (`viewer`, `operator`, `manager`, `super_admin`). | RLS enabled; only service key + security helpers manage assignments. |
| `public.organizations`, `public.user_org_memberships` | Multitenant org boundary + membership roles. | Policies ensure users only see orgs they belong to; insert/update guarded by `super_admin`. |
| `public.jobs` + `job_telemetry` | Primary mission records (area, status, telemetry events). | Policies enforce org membership and CRUD via Supabase helpers. |
| `public.estimates` + `estimate_line_items` | Estimator Studio outputs. | Only creators (org members) can read/write. |
| `public.mission_tasks`, `mission_milestones`, `mission_crew_members` | Scheduler + mission control datasets. | All rows scoped to organization ID; write access limited to operators/managers. |
| `public.compliance_artifacts`, `compliance_reviews` | ADA/VDOT compliance evidence. | RLS restricts to job’s org; reviewers must hold `manager` or above. |
| `public.customer_portal_sessions`, `customer_portal_events` | Shareable portal with hashed tokens. | Portal tokens allow read-only access to a single job; application roles retain full access via membership filters. |
| `public.knowledge_documents`, `knowledge_chunks` | AI/knowledge base content for compliance and ops SOPs. | Organization-scoped RLS, optional feature-flag gating. |
| `public.observability_sessions`, `weather_snapshots` | Client telemetry + weather overlays. | Only org members and service roles can read; insertion handled by backend functions. |
| `public.scheduler_blackout_feeds`, `scheduler_blackout_entries` | ICS-driven worship blackout feeds + expanded entries for the mission scheduler. | Org-scoped read access; insert/update limited to operators/managers who own the feed. |
| `public.liturgical_calendar_events` | Global + org-specific liturgical calendar (Advent, Lent, Easter, Pentecost). | Everyone can read global rows; only managers/super_admin update scoped events. |
| `public.theme_gallery_profiles` | Curated theme + wallpaper pairings powering the Theme Gallery. | Readable globally; only managers/super_admin (or the creator) can write. |

### Workflow Orchestration Entities

| Table | Purpose | RLS Summary |
| --- | --- | --- |
| `public.workflow_measurement_runs` | Stores AI/manual measurement requests, results, and drone intel tied to a job. | Policies reuse `user_is_member_of_org`/`user_has_org_role`; `operator`+ may insert/update, `manager`+ may delete. |
| `public.workflow_measurement_segments` | Child records for each measured segment (square feet + optional geojson). | RLS piggybacks on the parent measurement row via subqueries so segment access mirrors the run’s org. |
| `public.workflow_stage_events` | Timeline of workflow status transitions (measure → closeout). | Org-scoped; events are immutable per stage/status combination to keep the rail deterministic. |
| `public.workflow_outreach_touchpoints` | Email/SMS/phone outreach log with contact JSON, scheduling, and metadata. | Org members can read; `operator`+ can insert; `manager`+ can edit/delete; triggers keep `org_id`/`created_by` hydrated. |
| `public.workflow_contracts` | Contract/proposal metadata tied to a job/estimate, including e-sign references. | Same RLS pattern; `version` is unique per job, allowing idempotent upserts from seed/data pipelines. |

Every table created in the migration set enables Row Level Security immediately and pairs with helper SQL functions for checking roles (`public.is_org_member`, etc.). When adding new tables, follow the existing pattern:

1. Create the table and indexes.
2. `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`.
3. Create policies for each action (select/insert/update/delete) referencing helper functions.
4. Add ownership grants for the Supabase service role and `authenticated` role when necessary.

### Seed Data

- Script: `scripts/seed.ts`
- Idempotent (re-runnable) and safe for prod/staging.
- Populates:
  - Default organization (`conner-asphalt`) and job telemetry samples.
  - Mission milestones, crews, crew blackouts, scheduler tasks.
  - Compliance artifacts + reviews, customer portal session/events.
  - Knowledge base docs/chunks, observability sessions.
  - Worship blackout feeds + liturgical calendar events aligned with new Phase 5 tables.
- Requires an existing Supabase Auth user; see `docs/ADMIN_SETUP.md` for creating `n8ter8@gmail.com`.

### Admin User Workflow

1. Create `n8ter8@gmail.com` in Supabase Auth (dashboard, CLI, or SQL).  
2. Ensure `.env` contains `DATABASE_URL` and optional `ADMIN_EMAIL`.  
3. Run `npm run migrate:up`.  
4. Run `ADMIN_EMAIL=n8ter8@gmail.com npm run seed`.  
5. The seed script assigns `super_admin`, org memberships, and demo data to that user.

### File References

- `supabase/migrations/1700000015000_platform_foundation.js` – roles + shared triggers.
- `supabase/migrations/1700000016000_pavement_core.js` – organizations, jobs, estimates, RLS policies.
- `supabase/migrations/20251106095000_mission_operational_expansion.js` – mission tasks, telemetry, customer portal.
- `supabase/migrations/20251109121500_supplier_intelligence.js` – observability + supplier intel tables.
- `supabase/migrations/20251116133000_workflow_orchestration.js` – workflow measurement, outreach, stage, and contract entities.
- `supabase/migrations/20251116131500_theme_gallery_blackouts.js` – scheduler blackout feeds, liturgical calendar events, theme gallery profiles.

Always add new schema changes through migrations—never edit tables directly in Supabase Studio—so environments stay in sync and CI can validate the structure.
