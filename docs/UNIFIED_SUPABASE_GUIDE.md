## Unified Supabase: Single Project for All Apps

This guide explains how to use one Supabase project across all current and future repositories (asphalt-pro-wiz, explore-sensei, hero-ops-suite, Asphalt-OS_Overwatch-Systems, and future apps), including setup, migrations, environment variables, security, and compatibility with legacy schemas.

### 1) Overview
- One Supabase project per environment: development, staging, production.
- Canonical schema includes: organizations/tenancy, users and memberships, clients, jobs, employees, time tracking, inventory, invoicing, safety/compliance, mapping/measurements, analysis/scans/defects/reports, AI detections, and gamification.
- Strict org-based Row Level Security (RLS) across all tables.
- Compatibility views expose legacy shapes like `public.users`, `public.roles`, `public.user_roles`, `public.customers`, `public."Mapmeasurements"`, and `public.clients_compat` for existing apps.

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
Option A: Local Postgres (development)
- Set `DATABASE_URL` to your local Postgres
- Run:
```
npm run migrate:up
```

Option B: Supabase project
- Open Supabase SQL editor and run the migration SQL files in `supabase/migrations` in ascending order:
  - `1700000001000_unified_tenancy.js`
  - `1700000001100_unified_core.js`
  - `1700000001200_unified_analysis.js`
  - `1700000001300_unified_ai_gamification.js`
  - `1700000001400_unified_rls.js`
  - `1700000001500_unified_compatibility.js`
- Alternatively, connect `node-pg-migrate` to your Supabase DB using a direct connection string in `DATABASE_URL` and run `npm run migrate:up`.

Notes:
- Migrations are idempotent; running them multiple times is safe.

### 5) Seeding
- Ensure the `ADMIN_EMAIL` exists in Supabase Auth (create the user in the Supabase Dashboard).
- Run:
```
npm run seed
```
- This will:
  - Ensure default organization exists
  - Assign `Super Administrator` membership in default org to the `ADMIN_EMAIL`

### 6) Connecting Apps (Current and Future Repos)
All apps should use the same environment variable names:
- Frontend clients (Vite/React):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- Server-side utilities/scripts:
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DATABASE_URL` (if using direct Postgres access)

Minimal steps per repo:
1. Add a `.env` with the above variables pointing to the unified Supabase.
2. Use a client helper. In this repo you can import `getBrowserClient` from `src/lib/supabase`.
3. Legacy table names are supported via compatibility views:
   - asphalt-pro-wiz: `public.users`, `public.roles`, `public.user_roles`
   - hero-ops-suite: `public.customers` maps to unified `clients` shape; `public.clients_compat` exposes `client_id` and `org` fields; analysis tables are present as in canonical schema.
   - explore-sensei: `public."Mapmeasurements"` view exists mapping to `map_measurements`; roles map via memberships.
4. No code changes are needed unless a repo writes to a table not covered by views or uses restricted operations disallowed by RLS. In that case, update queries to target canonical tables or add an additional compatibility view.

### 7) Row Level Security (RLS)
- Every table enforces org-based isolation with these principles:
  - Read: any member of the row’s `org_id` can read
  - Write (insert/update/delete): roles `Manager` and above in the same org
- Helper functions:
  - `public.is_admin(user_id)`
  - `public.has_role(user_id, app_role)`
  - Membership: `public.user_org_memberships(user_id, org_id, role)`
- New users automatically get a `Viewer` membership in the default org via trigger `on_auth_user_created`.

### 8) Storage Buckets
Create these buckets in Supabase Storage (public or protected per your needs):
- `meshes/`, `raw_images/`, `snapshots/`, `tiles/`, `reports/`, `photos/`

### 9) Edge Functions
If needed, deploy shared Edge Functions (from repos like explore-sensei) into this unified project.
- Examples: `ai-chat`, `analyze-asphalt`, `get-mapbox-token`, `game-*`
- Names and auth should remain consistent across apps.

### 10) Adding New Repositories
- Point env variables to the same Supabase project.
- Use canonical tables; if you need a legacy shape, add a view to `1700000001500_unified_compatibility.js`.
- Keep migrations idempotent and RLS-consistent.

### 11) Troubleshooting
- Missing permissions: check RLS policies and the user’s membership/role in `user_org_memberships`.
- Table not found: confirm migrations ran and the exact table/view name.
- Admin not assigned: confirm `ADMIN_EMAIL` exists in `auth.users` and re-run `npm run seed`.

### 12) Security Notes
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Keep RLS strict; only relax via specific policies.
- Use audit logs and triggers if you need higher accountability.

### 13) Migration/ETL from Legacy Projects
- Export data from old Supabase projects and map to canonical tables, adding `org_id`.
- Import respecting FKs (clients -> jobs -> invoices, etc.).

### 14) Contacts & Ownership
- Codeowners and maintainers should ensure all new projects follow this guide and re-use the same Supabase.
