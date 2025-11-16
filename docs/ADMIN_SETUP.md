# Admin User Setup (Supabase)

1. In the Supabase dashboard, open **Auth → Users** and create a new user with the email `n8ter8@gmail.com` (or set `ADMIN_EMAIL` to the address you prefer). When prompted, require the user to update their password on first login.  
   • CLI alternative (no UI required):

   ```bash
   supabase auth signups create \
     --email n8ter8@gmail.com \
     --password 'Tempor@ryStrongPassw0rd!'
   ```

   • SQL alternative (when using the `supabase` CLI shell):

   ```sql
   insert into auth.users (email, encrypted_password)
   values ('n8ter8@gmail.com', crypt('Tempor@ryStrongPassw0rd!', gen_salt('bf')))
   on conflict (email) do nothing;
   ```

   Replace the temporary password immediately after the first login.

2. Ensure your `DATABASE_URL` points to the Supabase project's Postgres instance (or to your local stack when developing offline).
3. Run migrations:

```bash
npm run migrate:up
```

4. Run the seed script to assign the `super_admin` role, provision the default organization, and hydrate demo data:

```bash
ADMIN_EMAIL=n8ter8@gmail.com npm run seed
```

This pass now also provisions the Theme Command Center inventory:

- Global wallpapers are inserted into `theme_wallpapers` with `is_global=true` so every tenant shares a curated Division palette.
- Organization-scoped wallpapers inherit your org_id so crews can upload private assets later without sharing them globally.
- The admin user receives a baseline record in `theme_preferences`, wiring the default wallpaper, palette, and HUD tuning without touching the UI.

Notes

- Migrations enable Row Level Security (RLS) on every table. All access is mediated by the helper functions defined in `supabase/migrations`, so always add new policies through migrations rather than manual dashboard edits.
- The seed script is idempotent: re-running it updates existing demo records, inserts missing ones, and never duplicates organizations, portal sessions, or knowledge-base content.
- Additional demo data now includes customer portal sessions, compliance artifacts, mission milestones, knowledge base entries, observability session records, and the new `theme_wallpapers` + `theme_preferences` tables used by the Theme Command Center—review them inside Supabase Studio to understand expected shapes.
- For local development via Docker Compose, the default `DATABASE_URL` is provided in `.env.example`. Update it if you connect to a remote Supabase project.
