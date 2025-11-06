#!/usr/bin/env tsx
import "dotenv/config";
import { Pool } from "pg";
import type { PoolClient } from "pg";

type QueryOptions = Parameters<Pool["query"]>[1];
type JobStatus = "draft" | "need_estimate" | "estimated" | "scheduled" | "completed" | "lost";
type TelemetryStatus = "pending" | "scheduled" | "in_progress" | "completed" | "cancelled" | "on_hold";

interface TelemetrySeedEvent {
  eventType: "created" | "status_changed" | "assigned" | "started" | "paused" | "completed" | "cancelled" | "estimate_generated";
  status?: TelemetryStatus;
  quoteValue?: number;
  areaSqft?: number;
  locationLat?: number;
  locationLng?: number;
  customerAddress?: string;
  metadata?: Record<string, unknown>;
}

interface JobSeedDefinition {
  key: string;
  name: string;
  customerName: string;
  customerAddress: string;
  location: { lat: number; lng: number };
  jobStatus: JobStatus;
  totalAreaSqft: number;
  telemetryEvents: TelemetrySeedEvent[];
  premiumServices?: string[];
}

async function ensureJob(
  client: PoolClient,
  orgId: string,
  adminUserId: string,
  definition: JobSeedDefinition,
): Promise<string> {
  const insertParams: QueryOptions = [
    orgId,
    definition.name,
    definition.customerName,
    definition.customerAddress,
    definition.location.lat,
    definition.location.lng,
    definition.jobStatus,
    definition.totalAreaSqft,
    adminUserId,
  ];

  const { rows: insertedRows } = await client.query<{ id: string }>(
    `WITH existing AS (
       SELECT id FROM public.jobs WHERE org_id = $1 AND name = $2 LIMIT 1
     )
     INSERT INTO public.jobs (org_id, name, customer_name, customer_address, customer_latitude, customer_longitude, status, total_area_sqft, created_by)
     SELECT $1, $2, $3, $4, $5, $6, $7::job_status, $8, $9
     WHERE NOT EXISTS (SELECT 1 FROM existing)
     RETURNING id;`,
    insertParams,
  );

  let jobId = insertedRows[0]?.id;

  if (!jobId) {
    const { rows: existingRows } = await client.query<{ id: string }>(
      `SELECT id FROM public.jobs WHERE org_id = $1 AND name = $2 LIMIT 1;`,
      [orgId, definition.name] satisfies QueryOptions,
    );
    jobId = existingRows[0]?.id;
  }

  if (!jobId) {
    throw new Error(`Unable to create or locate job record for ${definition.name}`);
  }

  await client.query(
    `UPDATE public.jobs
       SET customer_name = $1,
           customer_address = $2,
           customer_latitude = $3,
           customer_longitude = $4,
           status = $5::job_status,
           total_area_sqft = $6,
           updated_at = now()
     WHERE id = $7;`,
    [
      definition.customerName,
      definition.customerAddress,
      definition.location.lat,
      definition.location.lng,
      definition.jobStatus,
      definition.totalAreaSqft,
      jobId,
    ] satisfies QueryOptions,
  );

  return jobId;
}

async function ensureTelemetry(
  client: PoolClient,
  adminUserId: string,
  jobId: string,
  events: TelemetrySeedEvent[],
): Promise<void> {
  for (const event of events) {
    const { rows: existing } = await client.query<{ id: string }>(
      `SELECT id FROM public.job_telemetry
         WHERE job_id = $1
           AND event_type = $2
           AND (status IS NOT DISTINCT FROM $3)
         LIMIT 1;`,
      [jobId, event.eventType, event.status ?? null] satisfies QueryOptions,
    );

    const metadataPayload = { seedSource: "seed-script", ...event.metadata };
    const metadataJson = JSON.stringify(metadataPayload);

    if (existing[0]) {
      await client.query(
        `UPDATE public.job_telemetry
           SET quote_value = $1,
               area_sqft = $2,
               location_lat = $3,
               location_lng = $4,
               customer_address = $5,
               metadata = COALESCE(metadata, '{}'::jsonb) || $6::jsonb,
               updated_at = now()
         WHERE id = $7;`,
        [
          event.quoteValue ?? null,
          event.areaSqft ?? null,
          event.locationLat ?? null,
          event.locationLng ?? null,
          event.customerAddress ?? null,
          metadataJson,
          existing[0].id,
        ] satisfies QueryOptions,
      );
    } else {
      await client.query(
        `INSERT INTO public.job_telemetry (job_id, user_id, event_type, status, quote_value, area_sqft, location_lat, location_lng, customer_address, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb);`,
        [
          jobId,
          adminUserId,
          event.eventType,
          event.status ?? null,
          event.quoteValue ?? null,
          event.areaSqft ?? null,
          event.locationLat ?? null,
          event.locationLng ?? null,
          event.customerAddress ?? null,
          metadataJson,
        ] satisfies QueryOptions,
      );
    }
  }
}

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

    const jobSeeds: JobSeedDefinition[] = [
      {
        key: "st-mark-sanctuary-reseal",
        name: "St. Mark Sanctuary Reseal",
        customerName: "St. Mark Church",
        customerAddress: "123 Sanctuary Ln, Roanoke, VA",
        location: { lat: 37.27097, lng: -79.941429 },
        jobStatus: "need_estimate",
        totalAreaSqft: 45210,
        telemetryEvents: [
          {
            eventType: "estimate_generated",
            status: "scheduled",
            quoteValue: 22275,
            areaSqft: 45210,
            locationLat: 37.27097,
            locationLng: -79.941429,
            customerAddress: "123 Sanctuary Ln, Roanoke, VA",
            metadata: { scenario: "primary" },
          },
        ],
        premiumServices: ["power-washing", "crack-cleaning"],
      },
      {
        key: "grace-fellowship-lot-renewal",
        name: "Grace Fellowship Lot Renewal",
        customerName: "Grace Fellowship Church",
        customerAddress: "3750 Peters Creek Rd NW, Roanoke, VA 24017",
        location: { lat: 37.3044, lng: -79.983 },
        jobStatus: "scheduled",
        totalAreaSqft: 42875,
        telemetryEvents: [
          {
            eventType: "status_changed",
            status: "scheduled",
            quoteValue: 48750.75,
            areaSqft: 42875,
            locationLat: 37.3044,
            locationLng: -79.983,
            customerAddress: "3750 Peters Creek Rd NW, Roanoke, VA 24017",
            metadata: { crewCallsign: "Bravo" },
          },
        ],
      },
      {
        key: "new-hope-outreach-reconfiguration",
        name: "New Hope Outreach Reconfiguration",
        customerName: "New Hope Outreach",
        customerAddress: "8100 Three Chopt Rd, Richmond, VA 23229",
        location: { lat: 37.5538, lng: -77.4603 },
        jobStatus: "scheduled",
        totalAreaSqft: 51540,
        telemetryEvents: [
          {
            eventType: "started",
            status: "in_progress",
            quoteValue: 68920.5,
            areaSqft: 51540,
            locationLat: 37.5538,
            locationLng: -77.4603,
            customerAddress: "8100 Three Chopt Rd, Richmond, VA 23229",
            metadata: { shift: "AM", crewCount: 4 },
          },
        ],
      },
      {
        key: "harvest-baptist-sealcoat-blitz",
        name: "Harvest Baptist Sealcoat Blitz",
        customerName: "Harvest Baptist Church",
        customerAddress: "1100 Boush St, Norfolk, VA 23510",
        location: { lat: 36.8529, lng: -76.2883 },
        jobStatus: "completed",
        totalAreaSqft: 28500,
        telemetryEvents: [
          {
            eventType: "completed",
            status: "completed",
            quoteValue: 41200,
            areaSqft: 28500,
            locationLat: 36.8529,
            locationLng: -76.2883,
            customerAddress: "1100 Boush St, Norfolk, VA 23510",
            metadata: { punchlistCleared: true },
          },
        ],
      },
      {
        key: "living-word-evening-striping",
        name: "Living Word Evening Striping",
        customerName: "Living Word Fellowship",
        customerAddress: "1400 Constitution Ave NW, Washington, DC 20560",
        location: { lat: 38.9072, lng: -77.0369 },
        jobStatus: "estimated",
        totalAreaSqft: 12400,
        telemetryEvents: [
          {
            eventType: "status_changed",
            status: "on_hold",
            quoteValue: 15880.25,
            areaSqft: 12400,
            locationLat: 38.9072,
            locationLng: -77.0369,
            customerAddress: "1400 Constitution Ave NW, Washington, DC 20560",
            metadata: { holdReason: "Awaiting board approval" },
          },
        ],
      },
      {
        key: "cornerstone-community-expansion",
        name: "Cornerstone Community Expansion",
        customerName: "Cornerstone Community Church",
        customerAddress: "1022 Forest St, Charlottesville, VA 22903",
        location: { lat: 38.0293, lng: -78.4767 },
        jobStatus: "need_estimate",
        totalAreaSqft: 21900,
        telemetryEvents: [
          {
            eventType: "created",
            status: "pending",
            quoteValue: 28950,
            areaSqft: 21900,
            locationLat: 38.0293,
            locationLng: -78.4767,
            customerAddress: "1022 Forest St, Charlottesville, VA 22903",
            metadata: { intakeChannel: "web-form" },
          },
        ],
      },
    ];

    const jobIdMap = new Map<string, string>();

    for (const seed of jobSeeds) {
      const jobId = await ensureJob(client, orgId, adminUserId, seed);
      jobIdMap.set(seed.key, jobId);

      if (seed.telemetryEvents.length > 0) {
        await ensureTelemetry(client, adminUserId, jobId, seed.telemetryEvents);
      }

      if (seed.premiumServices?.length) {
        for (const serviceId of seed.premiumServices) {
          await client.query(
            `INSERT INTO public.job_premium_services (job_id, service_id, enabled)
             VALUES ($1, $2, true)
             ON CONFLICT (job_id, service_id) DO UPDATE SET enabled = EXCLUDED.enabled;`,
            [jobId, serviceId] satisfies QueryOptions,
          );
        }
      }
    }

    const stMarkJobId = jobIdMap.get("st-mark-sanctuary-reseal");

    if (stMarkJobId) {
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
        [stMarkJobId, adminUserId, JSON.stringify(estimateInputs), JSON.stringify(estimateCosts)] satisfies QueryOptions,
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
    }

    await client.query(
      `INSERT INTO public.crew_blackouts (org_id, starts_at, ends_at, reason, created_by)
       VALUES ($1, now() + interval '2 day', now() + interval '2 day' + interval '6 hour', 'Sunday services – no work', $2)
       ON CONFLICT DO NOTHING;`,
      [orgId, adminUserId] satisfies QueryOptions,
    );

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
