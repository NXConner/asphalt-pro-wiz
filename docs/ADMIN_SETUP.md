# Admin User Setup (Supabase)

1. In the Supabase dashboard, create an authenticated user with the email `n8ter8@gmail.com` (or set `ADMIN_EMAIL` in your environment to another email).
2. Ensure your `DATABASE_URL` points to the Supabase project's Postgres instance.
3. Run migrations:

```bash
npm run migrate:up
```

4. Run the seed script to grant the `super_admin` role:

```bash
ADMIN_EMAIL=n8ter8@gmail.com npm run seed
```

Notes:

- Migrations enable Row Level Security (RLS) on all tables. Add specific policies in your Supabase environment as needed.

Seed behavior (idempotent):

- `scripts/seed.ts` ensures default organization and assigns the admin user (`ADMIN_EMAIL`) a high-privilege role/membership if the user exists in `auth.users`.
- Re-running the seed will not duplicate roles or orgs.
- For local development via Docker Compose, the default `DATABASE_URL` is provided in `.env.example`.
