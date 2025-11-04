## Unified Supabase: Single Project for All Apps

This guide documents the streamlined Supabase schema that powers the Pavement Performance Suite and any future companion apps. It covers setup, migrations, environment variables, security, and how to seed realistic demo data.

### 1) Overview

- One Supabase project per environment (development, staging, production).
- Canonical schema focuses on: organizations, user memberships, jobs, premium services, estimates, documents/uploads, receipts, crew scheduling, and telemetry events.
- Strict organization-based Row Level Security (RLS) is enforced across all tables.
- Database migrations and seed data are idempotent, making it safe to re-run them during CI or local development.

### 2) Prerequisites

- Supabase project created and credentials available (URL, anon key, service role key).
- Local Postgres or Supabase SQL access to run migrations.
- Node 18+ and npm.

### 3) Environment Variables

Create a `.env` from `.env.example` at the repo root and set:

- `VITE_SUPABASE_URL`: your Supabase URL
- `VITE_SUPABASE_ANON_KEY`: your Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY`: service role key (server-side only)
- `SUPABASE_PROJECT_REF`: optional project ref
- `DATABASE_URL`: Postgres connection string (for local migration/seed tooling) or a Supabase direct connection string
- `ADMIN_EMAIL`: auth user to promote to Super Administrator (default `n8ter8@gmail.com`)

### 4) Applying Migrations

The project uses `node-pg-migrate`. Run migrations against either a local Postgres instance or your Supabase database.

```
npm run migrate:up
```

This executes every migration inside `supabase/migrations/`, including `1700000016000_pavement_core.js`, which provisions the full Pavement Performance Suite schema:

- `organizations` and `user_org_memberships`
- `jobs`, `job_events`, `job_documents`, `job_uploads`
- `estimates` and `estimate_line_items`
- `job_receipts`, `job_premium_services`
- `crew_blackouts`, `crew_assignments`
- `premium_services_catalog`

All tables are created with RLS enabled. Re-running the migration is safe.

### 5) Seeding

1. Create the admin user in Supabase Auth using the `ADMIN_EMAIL` from `.env` (defaults to `n8ter8@gmail.com`).
2. Run the seed script:

   ```
   npm run seed
   ```

The seed script:

- Ensures an organization with slug `conner-asphalt` exists.
- Grants the admin user `super_admin` membership in that org.
- Creates a sample job (`St. Mark Sanctuary Reseal`) with demo estimates, line items, premium services, and a crew blackout entry to exercise the UI.
- Can be re-run safely; it upserts records.</n+

### 6) Connecting Apps

Use the same environment variables across CLI scripts, backend services, and frontend clients:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL` (for migrations and seeds)

Frontends in this repo import the helper from `src/lib/supabase`. Additional apps can reuse the same variables to share the tenancy model.

### 7) Row Level Security (RLS)

- `organizations`/`user_org_memberships`: only super administrators can mutate membership; all authenticated members can read their organization.
- `jobs` and job-scoped tables (`estimates`, `job_documents`, `job_uploads`, `job_receipts`, `job_premium_services`, `crew_assignments`, `job_events`):
  - Read: any member of the organization
  - Insert: `operator`, `manager`, or `super_admin`
  - Update/Delete: `manager` or `super_admin`
- `crew_blackouts`: organization-level scheduling resource with similar policies as jobs.
- RLS leverages `auth.uid()`; no table is readable by anonymous users.

### 8) Troubleshooting

- **Missing permissions**: confirm the user has a membership in `user_org_memberships` with the correct role.
- **Table not found**: ensure `npm run migrate:up` completed successfully.
- **Seed script fails**: verify the admin email exists in `auth.users` and that `DATABASE_URL` grants suitable privileges.

### 9) Security Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to clients.
- Audit membership changes with Supabase logs; only super admins can modify memberships.
- All write operations are scoped to the actor’s organization through RLS policies.
