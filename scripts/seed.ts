#!/usr/bin/env tsx
import "dotenv/config";
import { Pool } from "pg";

type QueryOptions = Parameters<Pool["query"]>[1];

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  const adminEmail = process.env.ADMIN_EMAIL || "n8ter8@gmail.com";

  const pool = new Pool({ connectionString: databaseUrl });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const { rows: userRows } = await client.query<{ id: string }>(
      "SELECT id FROM auth.users WHERE email = $1",
      [adminEmail] satisfies QueryOptions,
    );

    if (userRows.length === 0) {
      // eslint-disable-next-line no-console
      console.warn(
        `Admin user ${adminEmail} not found in auth.users. Create the user with Supabase Auth and re-run seeds.`,
      );
      await client.query("ROLLBACK");
      return;
    }

    const adminUserId = userRows[0].id;

    const { rows: orgRows } = await client.query<{ id: string }>(
      `INSERT INTO public.organizations (slug, name, created_by)
       VALUES ('conner-asphalt', 'CONNER Asphalt LLC', $1)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
       RETURNING id;`,
      [adminUserId] satisfies QueryOptions,
    );
    const orgId = orgRows[0].id;

    await client.query(
      `INSERT INTO public.user_org_memberships (user_id, org_id, role)
       VALUES ($1, $2, 'super_admin')
       ON CONFLICT (user_id, org_id) DO UPDATE SET role = EXCLUDED.role;`,
      [adminUserId, orgId] satisfies QueryOptions,
    );

    await client.query(
      `INSERT INTO public.user_roles (user_id, role_name)
       VALUES ($1, 'super_admin')
       ON CONFLICT (user_id, role_name) DO NOTHING;`,
      [adminUserId] satisfies QueryOptions,
    );

    const { rows: jobRows } = await client.query<{ id: string }>(
      `INSERT INTO public.jobs (org_id, name, customer_name, customer_address, status, total_area_sqft, created_by)
       VALUES ($1, 'St. Mark Sanctuary Reseal', 'St. Mark Church', '123 Sanctuary Ln, Roanoke, VA', 'need_estimate', 45210, $2)
       ON CONFLICT DO NOTHING
       RETURNING id;`,
      [orgId, adminUserId] satisfies QueryOptions,
    );

    const jobId =
      jobRows[0]?.id ||
      (
        await client.query<{ id: string }>(
          "SELECT id FROM public.jobs WHERE org_id = $1 ORDER BY created_at ASC LIMIT 1",
          [orgId] satisfies QueryOptions,
        )
      ).rows[0]?.id;

    if (jobId) {
      const estimateInputs = {
        totalArea: 45210,
        numCoats: 2,
        polymerAdded: true,
        premiumPowerWashing: true,
      };
      const estimateCosts = { material: 9200, labor: 5650, premium: 1000 };

      const { rows: estimateRows } = await client.query<{ id: string }>(
        `INSERT INTO public.estimates (job_id, prepared_by, inputs, costs, subtotal, overhead, profit, total)
         VALUES ($1, $2, $3::jsonb, $4::jsonb, 14850, 3712.5, 3712.5, 22275)
         ON CONFLICT DO NOTHING
         RETURNING id;`,
        [jobId, adminUserId, JSON.stringify(estimateInputs), JSON.stringify(estimateCosts)] satisfies QueryOptions,
      );

      const estimateId = estimateRows[0]?.id;
      if (estimateId) {
        await client.query(
          `INSERT INTO public.estimate_line_items (estimate_id, kind, label, amount, metadata)
           VALUES
             ($1, 'material', 'Sealcoat Blend', 9200, $2::jsonb),
             ($1, 'labor', 'Crew Labor', 5650, $3::jsonb),
             ($1, 'premium', 'Power Washing Upgrade', 1000, $4::jsonb)
           ON CONFLICT DO NOTHING;`,
          [
            estimateId,
            JSON.stringify({ unit: "gallons", coats: 2 }),
            JSON.stringify({ crewSize: 3, hours: 64 }),
            JSON.stringify({ catalogId: "power-washing" }),
          ] satisfies QueryOptions,
        );
      }

      await client.query(
        `INSERT INTO public.job_premium_services (job_id, service_id, enabled)
         VALUES
           ($1, 'power-washing', true),
           ($1, 'crack-cleaning', true)
         ON CONFLICT (job_id, service_id) DO UPDATE SET enabled = EXCLUDED.enabled;`,
        [jobId] satisfies QueryOptions,
      );

      await client.query(
        `INSERT INTO public.crew_blackouts (org_id, starts_at, ends_at, reason, created_by)
         VALUES ($1, now() + interval '2 day', now() + interval '2 day' + interval '6 hour', 'Sunday services – no work', $2)
         ON CONFLICT DO NOTHING;`,
        [orgId, adminUserId] satisfies QueryOptions,
      );
    }

    await client.query("COMMIT");
    // eslint-disable-next-line no-console
    console.log("Seed completed.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  // eslint-disable-next-line no-console
  console.error(error);
  process.exit(1);
});
