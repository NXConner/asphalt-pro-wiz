#!/usr/bin/env tsx
import "dotenv/config";
import { Pool } from "pg";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const adminEmail = process.env.ADMIN_EMAIL || "n8ter8@gmail.com";

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Ensure unified roles_compat for legacy mapping
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.roles_compat (
        id serial PRIMARY KEY,
        name text NOT NULL UNIQUE
      );
      INSERT INTO public.roles_compat(name) VALUES
        ('viewer'), ('operator'), ('manager'), ('super_admin')
      ON CONFLICT (name) DO NOTHING;
    `);

    // Ensure admin auth user exists must be done via Supabase Dashboard
    // Here we only ensure membership and role if user is present

    const { rows: userRows } = await client.query<{ id: string }>(
      "SELECT id FROM auth.users WHERE email = $1",
      [adminEmail],
    );
    if (userRows.length) {
      const userId = userRows[0].id;
      // Ensure default organization exists
      await client.query(
        `INSERT INTO public.organizations(name, slug)
         SELECT 'Default Organization', 'default'
         WHERE NOT EXISTS (SELECT 1 FROM public.organizations);`,
      );
      const { rows: orgRows } = await client.query<{ id: string }>(
        "SELECT id FROM public.organizations ORDER BY created_at ASC LIMIT 1",
      );
      const orgId = orgRows[0]?.id;
      if (orgId) {
        await client.query(
          `INSERT INTO public.user_org_memberships(user_id, org_id, role)
           VALUES ($1, $2, 'Super Administrator')
           ON CONFLICT (user_id, org_id) DO UPDATE SET role = EXCLUDED.role;`,
          [userId, orgId],
        );
      }
    }

    await client.query("COMMIT");
    // eslint-disable-next-line no-console
    console.log("Seed completed.");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
