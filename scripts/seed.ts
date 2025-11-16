#!/usr/bin/env tsx
import "dotenv/config";
import { createHash } from "crypto";
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

interface WallpaperSeedDefinition {
  key: string;
  name: string;
  description: string;
  gradient: string;
  tone: "dusk" | "aurora" | "ember" | "lagoon" | "stealth" | "command";
  scope?: "global" | "org";
  source?: "system" | "custom" | "synthesized";
}

type WorkflowStageId =
  | "measure"
  | "condition"
  | "scope"
  | "estimate"
  | "outreach"
  | "contract"
  | "schedule"
  | "closeout";

interface WorkflowMeasurementSegmentSeed {
  label: string;
  squareFeet: number;
  geojson?: Record<string, unknown>;
}

interface WorkflowMeasurementSeed {
  strategy: "image" | "map" | "drone";
  status?: string;
  squareFeet: number;
  crackLinearFeet: number;
  confidence: number;
  segments: WorkflowMeasurementSegmentSeed[];
  notes?: string;
  droneIntel?: Record<string, unknown>;
}

interface WorkflowStageEventSeed {
  stageId: WorkflowStageId;
  status: string;
  notes?: string;
  payload?: Record<string, unknown>;
}

interface WorkflowOutreachSeed {
  channel: string;
  status: string;
  contact: Record<string, unknown>;
  subject: string;
  body: string;
  direction?: "outbound" | "inbound";
  scheduledAtOffsetHours?: number;
}

interface WorkflowContractSeed {
  version?: number;
  status: string;
  total: number;
  currency?: string;
  docUrl?: string;
  metadata?: Record<string, unknown>;
}

interface WorkflowSeedDefinition {
  jobKey: string;
  measurement?: WorkflowMeasurementSeed;
  stageEvents?: WorkflowStageEventSeed[];
  outreach?: WorkflowOutreachSeed[];
  contract?: WorkflowContractSeed;
interface BlackoutFeedSeed {
  name: string;
  description?: string;
  sourceUrl: string;
  timezone?: string;
  events: Array<{
    summary: string;
    startsAt: string;
    endsAt: string;
    details?: string;
  }>;
}

interface LiturgicalEventSeed {
  season: "advent" | "christmas" | "lent" | "holy_week" | "easter" | "pentecost" | "ordinary_time";
  title: string;
  description?: string;
  startsOn: string;
  endsOn: string;
  isGlobal?: boolean;
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

async function ensureWallpaper(
  client: PoolClient,
  adminUserId: string,
  orgId: string | null,
  seed: WallpaperSeedDefinition,
): Promise<string> {
  const wallpaperHash = hashToken(`${seed.name}:${seed.gradient}`);
  const scope = seed.scope ?? "global";

  const insertParams: QueryOptions = [
    scope === "org" ? orgId : null,
    adminUserId,
    seed.name,
    seed.description,
    seed.gradient,
    seed.tone,
    seed.source ?? "system",
    wallpaperHash,
    scope !== "org",
  ];

  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.theme_wallpapers (org_id, created_by, name, description, data_url, tone, source, wallpaper_hash, is_global)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (wallpaper_hash)
     DO UPDATE
       SET name = EXCLUDED.name,
           description = EXCLUDED.description,
           data_url = EXCLUDED.data_url,
           tone = EXCLUDED.tone,
           source = EXCLUDED.source,
           is_global = EXCLUDED.is_global,
           updated_at = now()
     RETURNING id;`,
    insertParams,
  );

  if (rows[0]?.id) {
    return rows[0].id;
  }

  const fallback = await client.query<{ id: string }>(
    `SELECT id FROM public.theme_wallpapers WHERE wallpaper_hash = $1 LIMIT 1;`,
    [wallpaperHash] satisfies QueryOptions,
  );

  if (!fallback.rows[0]) {
    throw new Error(`Unable to upsert wallpaper ${seed.name}`);
  }

  return fallback.rows[0].id;
}

async function ensureThemePreference(
  client: PoolClient,
  userId: string,
  orgId: string,
  wallpaperId: string | null,
): Promise<void> {
  await client.query(
    `INSERT INTO public.theme_preferences (user_id, org_id, theme_id, wallpaper_id, palette, wallpaper_settings, hud_settings)
     VALUES ($1, $2, 'theme-division-agent', $3, $4::jsonb, $5::jsonb, $6::jsonb)
     ON CONFLICT (user_id)
     DO UPDATE
       SET org_id = COALESCE(EXCLUDED.org_id, theme_preferences.org_id),
           theme_id = EXCLUDED.theme_id,
           wallpaper_id = COALESCE(EXCLUDED.wallpaper_id, theme_preferences.wallpaper_id),
           palette = theme_preferences.palette || EXCLUDED.palette,
           wallpaper_settings = theme_preferences.wallpaper_settings || EXCLUDED.wallpaper_settings,
           hud_settings = theme_preferences.hud_settings || EXCLUDED.hud_settings,
           updated_at = now();`,
    [
      userId,
      orgId,
      wallpaperId,
      JSON.stringify({ primary: "25 100% 55%", accent: "197 88% 56%" }),
      JSON.stringify({ opacity: 0.82, blur: 12 }),
      JSON.stringify({ hudOpacity: 0.85, hudBlur: 10, hudPreset: "command" }),
    ] satisfies QueryOptions,
  );
}

async function upsertMeasurementRun(
  client: PoolClient,
  orgId: string,
  jobId: string,
  adminUserId: string,
  seed: WorkflowMeasurementSeed,
): Promise<void> {
  const payload = JSON.stringify({ seedSource: "seed-script", strategy: seed.strategy });
  const resultPayload = JSON.stringify({
    segments: seed.segments,
    crackLinearFeet: seed.crackLinearFeet,
    squareFeet: seed.squareFeet,
  });
  const droneIntel = JSON.stringify(seed.droneIntel ?? { seedSource: "seed-script" });

  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.workflow_measurement_runs (org_id, job_id, requested_by, strategy, status, square_feet, crack_linear_feet, confidence, payload, result, drone_intel, notes)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb, $11::jsonb, $12)
     ON CONFLICT (job_id, strategy)
     DO UPDATE
       SET status = EXCLUDED.status,
           square_feet = EXCLUDED.square_feet,
           crack_linear_feet = EXCLUDED.crack_linear_feet,
           confidence = EXCLUDED.confidence,
           payload = workflow_measurement_runs.payload || EXCLUDED.payload,
           result = EXCLUDED.result,
           drone_intel = COALESCE(EXCLUDED.drone_intel, workflow_measurement_runs.drone_intel),
           notes = EXCLUDED.notes,
           updated_at = now()
     RETURNING id;`,
    [
      orgId,
      jobId,
      adminUserId,
      seed.strategy,
      seed.status ?? "completed",
      seed.squareFeet,
      seed.crackLinearFeet,
      seed.confidence,
      payload,
      resultPayload,
      droneIntel,
      seed.notes ?? null,
    ] satisfies QueryOptions,
  );

  const measurementId = rows[0].id;
  await client.query(
    `DELETE FROM public.workflow_measurement_segments WHERE measurement_id = $1;`,
    [measurementId] satisfies QueryOptions,
  );

  for (const segment of seed.segments) {
    await client.query(
      `INSERT INTO public.workflow_measurement_segments (measurement_id, label, square_feet, geojson, metadata)
       VALUES ($1, $2, $3, $4::jsonb, $5::jsonb);`,
      [
        measurementId,
        segment.label,
        segment.squareFeet,
        JSON.stringify(segment.geojson ?? {}),
        JSON.stringify({ seedSource: "seed-script" }),
      ] satisfies QueryOptions,
    );
  }
}

async function ensureStageEvents(
  client: PoolClient,
  orgId: string,
  jobId: string,
  adminUserId: string,
  events: WorkflowStageEventSeed[],
): Promise<void> {
  for (const event of events) {
    await client.query(
      `INSERT INTO public.workflow_stage_events (org_id, job_id, stage_id, status, notes, payload, performed_by)
       SELECT $1, $2, $3, $4, $5, $6::jsonb, $7
       WHERE NOT EXISTS (
         SELECT 1 FROM public.workflow_stage_events
         WHERE job_id = $2 AND stage_id = $3 AND status = $4
       );`,
      [
        orgId,
        jobId,
        event.stageId,
        event.status,
        event.notes ?? null,
        JSON.stringify({ seedSource: "seed-script", ...(event.payload ?? {}) }),
        adminUserId,
      ] satisfies QueryOptions,
    );
  }
}

async function ensureOutreach(
  client: PoolClient,
  orgId: string,
  jobId: string,
  adminUserId: string,
  touchpoints: WorkflowOutreachSeed[],
): Promise<void> {
  const now = Date.now();
  for (const touch of touchpoints) {
    const offset = touch.scheduledAtOffsetHours ?? 0;
    const scheduledAt =
      offset === 0 ? null : new Date(now + offset * 60 * 60 * 1000).toISOString();
    const sentAt =
      touch.status === "sent"
        ? scheduledAt ?? new Date(now - 30 * 60 * 1000).toISOString()
        : null;

    await client.query(
      `INSERT INTO public.workflow_outreach_touchpoints
        (org_id, job_id, contact, channel, direction, status, subject, body, scheduled_at, sent_at, metadata, created_by)
       VALUES ($1, $2, $3::jsonb, $4, $5, $6, $7, $8, $9, $10, $11::jsonb, $12)
       ON CONFLICT (job_id, channel, subject)
       DO UPDATE SET
         status = EXCLUDED.status,
         body = EXCLUDED.body,
         scheduled_at = EXCLUDED.scheduled_at,
         sent_at = EXCLUDED.sent_at,
         metadata = workflow_outreach_touchpoints.metadata || EXCLUDED.metadata,
         updated_at = now();`,
      [
        orgId,
        jobId,
        JSON.stringify(touch.contact),
        touch.channel,
        touch.direction ?? "outbound",
        touch.status,
        touch.subject,
        touch.body,
        scheduledAt,
        sentAt,
        JSON.stringify({ seedSource: "seed-script" }),
        adminUserId,
      ] satisfies QueryOptions,
    );
  }
}

async function upsertContract(
  client: PoolClient,
  orgId: string,
  jobId: string,
  adminUserId: string,
  seed: WorkflowContractSeed,
): Promise<void> {
  const { rows } = await client.query<{ id: string }>(
    `SELECT id FROM public.estimates WHERE job_id = $1 ORDER BY created_at DESC LIMIT 1;`,
    [jobId] satisfies QueryOptions,
  );
  const estimateId = rows[0]?.id ?? null;

  await client.query(
    `INSERT INTO public.workflow_contracts (org_id, job_id, estimate_id, version, status, total, currency, doc_url, metadata, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10)
     ON CONFLICT (job_id, version)
     DO UPDATE SET
       status = EXCLUDED.status,
       total = EXCLUDED.total,
       currency = EXCLUDED.currency,
       doc_url = COALESCE(EXCLUDED.doc_url, workflow_contracts.doc_url),
       metadata = workflow_contracts.metadata || EXCLUDED.metadata,
       updated_at = now();`,
    [
      orgId,
      jobId,
      estimateId,
      seed.version ?? 1,
      seed.status,
      seed.total,
      seed.currency ?? "USD",
      seed.docUrl ?? null,
      JSON.stringify({ seedSource: "seed-script", ...(seed.metadata ?? {}) }),
      adminUserId,
async function ensureSchedulerBlackoutFeed(
  client: PoolClient,
  orgId: string,
  adminUserId: string,
  seed: BlackoutFeedSeed,
): Promise<void> {
  const { rows } = await client.query<{ id: string }>(
    `INSERT INTO public.scheduler_blackout_feeds (org_id, created_by, name, description, source_url, timezone)
     VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (org_id, name)
     DO UPDATE SET description = EXCLUDED.description,
                   source_url = EXCLUDED.source_url,
                   timezone = EXCLUDED.timezone,
                   updated_at = now()
     RETURNING id;`,
    [orgId, adminUserId, seed.name, seed.description ?? null, seed.sourceUrl, seed.timezone ?? "America/New_York"] satisfies QueryOptions,
  );

  const feedId =
    rows[0]?.id ??
    (
      await client.query<{ id: string }>(
        `SELECT id FROM public.scheduler_blackout_feeds WHERE org_id = $1 AND name = $2 LIMIT 1;`,
        [orgId, seed.name] satisfies QueryOptions,
      )
    ).rows[0]?.id;

  if (!feedId) {
    throw new Error(`Unable to upsert scheduler_blackout_feed ${seed.name}`);
  }

  await ensureBlackoutEntries(client, feedId, orgId, seed.events);
}

async function ensureBlackoutEntries(
  client: PoolClient,
  feedId: string,
  orgId: string,
  events: BlackoutFeedSeed["events"],
): Promise<void> {
  for (const event of events) {
    await client.query(
      `INSERT INTO public.scheduler_blackout_entries (feed_id, org_id, starts_at, ends_at, summary, details)
       SELECT $1, $2, $3, $4, $5, $6
       WHERE NOT EXISTS (
         SELECT 1 FROM public.scheduler_blackout_entries
         WHERE feed_id = $1
           AND starts_at = $3
           AND ends_at = $4
           AND summary = $5
       );`,
      [feedId, orgId, event.startsAt, event.endsAt, event.summary, event.details ?? null] satisfies QueryOptions,
    );
  }
}

async function ensureLiturgicalEvent(
  client: PoolClient,
  adminUserId: string,
  seed: LiturgicalEventSeed,
  orgId?: string | null,
): Promise<void> {
  await client.query(
    `INSERT INTO public.liturgical_calendar_events (org_id, created_by, season, title, description, starts_on, ends_on, is_global)
     SELECT $1, $2, $3, $4, $5, $6::date, $7::date, $8
     WHERE NOT EXISTS (
       SELECT 1 FROM public.liturgical_calendar_events
       WHERE season = $3
         AND title = $4
         AND starts_on = $6::date
         AND (org_id IS NOT DISTINCT FROM $1)
     );`,
    [
      orgId ?? null,
      adminUserId,
      seed.season,
      seed.title,
      seed.description ?? null,
      seed.startsOn,
      seed.endsOn,
      seed.isGlobal ?? !orgId,
    ] satisfies QueryOptions,
  );
}

async function seedWorkflowArtifacts(
  client: PoolClient,
  orgId: string,
  adminUserId: string,
  jobIdMap: Map<string, string>,
  seeds: WorkflowSeedDefinition[],
): Promise<void> {
  for (const seed of seeds) {
    const jobId = jobIdMap.get(seed.jobKey);
    if (!jobId) continue;

    if (seed.measurement) {
      await upsertMeasurementRun(client, orgId, jobId, adminUserId, seed.measurement);
    }
    if (seed.stageEvents?.length) {
      await ensureStageEvents(client, orgId, jobId, adminUserId, seed.stageEvents);
    }
    if (seed.outreach?.length) {
      await ensureOutreach(client, orgId, jobId, adminUserId, seed.outreach);
    }
    if (seed.contract) {
      await upsertContract(client, orgId, jobId, adminUserId, seed.contract);
    }
  }
}

function hashToken(seed: string): string {
  return createHash("sha256").update(seed).digest("hex");
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

      const workflowSeeds: WorkflowSeedDefinition[] = [
        {
          jobKey: "st-mark-sanctuary-reseal",
          measurement: {
            strategy: "image",
            status: "completed",
            squareFeet: 42875,
            crackLinearFeet: 1475,
            confidence: 0.93,
            notes: "Seeded AI measurement run from drone imagery.",
            segments: [
              { label: "Sanctuary Loop", squareFeet: 17250 },
              { label: "Admin Wing", squareFeet: 8200 },
              { label: "Student Center", squareFeet: 6100 },
              { label: "Overflow & Bus", squareFeet: 11325 },
            ],
            droneIntel: {
              hazards: [
                { id: "playground", type: "cone", description: "Playground equipment staged near drive lane" },
                { id: "hvac", type: "keepout", description: "HVAC pad – protect from overspray" },
              ],
            },
          },
          stageEvents: [
            { stageId: "measure", status: "done", notes: "Auto measurement approved" },
            { stageId: "condition", status: "active", notes: "Severity heatmap routed to crews" },
            { stageId: "scope", status: "todo", notes: "Awaiting board feedback" },
          ],
          outreach: [
            {
              channel: "email",
              status: "sent",
              contact: { name: "Trustees Board", email: "trustees@stmark.org", role: "Board" },
              subject: "Updated proposal + ADA exhibits",
              body: "Attached estimate packet and ADA exhibits. Reply to confirm board vote.",
              scheduledAtOffsetHours: -2,
            },
            {
              channel: "sms",
              status: "scheduled",
              contact: { name: "Pastor Allen", phone: "+15405551234", role: "Pastor" },
              subject: "Crew ETA",
              body: "Crew targeting Monday 0600 arrival. Reply STOP to opt out of SMS alerts.",
              scheduledAtOffsetHours: 36,
            },
          ],
          contract: {
            status: "draft",
            total: 22275,
            currency: "USD",
            docUrl: "https://example.com/contracts/st-mark-v1.pdf",
            metadata: { versionTag: "Board Review" },
          },
        },
        {
          jobKey: "grace-fellowship-lot-renewal",
          measurement: {
            strategy: "map",
            status: "completed",
            squareFeet: 42875,
            crackLinearFeet: 980,
            confidence: 0.88,
            notes: "Composite from Google Maps trace.",
            segments: [
              { label: "North Lot", squareFeet: 21000 },
              { label: "Youth Lot", squareFeet: 12000 },
              { label: "Bus Loop", squareFeet: 9875 },
            ],
          },
          stageEvents: [
            { stageId: "measure", status: "done", notes: "Manual trace confirmed." },
            { stageId: "condition", status: "done", notes: "Crack routing scheduled." },
            { stageId: "scope", status: "active", notes: "Premium striping add-ons pending approval." },
            { stageId: "estimate", status: "todo" },
          ],
          outreach: [
            {
              channel: "email",
              status: "scheduled",
              contact: { name: "Elder Maria", email: "maria@grace.org", role: "Elder Board" },
              subject: "Layout mockups ready",
              body: "See attached PDF for revised ADA stalls and bus drop sequence.",
              scheduledAtOffsetHours: 12,
            },
          ],
          contract: {
            status: "negotiation",
            total: 48750.75,
            currency: "USD",
            docUrl: "https://example.com/contracts/grace-v1.pdf",
          },
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

      await seedWorkflowArtifacts(client, orgId, adminUserId, jobIdMap, workflowSeeds);

    const wallpaperSeeds: WallpaperSeedDefinition[] = [
      {
        key: "twilight-ops",
        name: "Twilight Ops",
        description: "Warm dusk glow across a tactical grid.",
        gradient:
          "radial-gradient(circle at 20% 18%, rgba(255,128,0,0.45) 0%, rgba(9,13,25,0.95) 55%), linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.8) 100%)",
        tone: "dusk",
        scope: "global",
        source: "system",
      },
      {
        key: "sanctuary-grid",
        name: "Sanctuary Grid",
        description: "Teal aurora bands reflecting sanctuary lighting.",
        gradient:
          "radial-gradient(circle at 10% 35%, rgba(32,209,205,0.38) 0%, rgba(10,15,30,0.92) 55%), linear-gradient(135deg, rgba(14,165,233,0.25), rgba(8,47,73,0.85))",
        tone: "lagoon",
        scope: "global",
        source: "system",
      },
      {
        key: "revival-rush",
        name: "Revival Rush",
        description: "Neon teal ribbons for youth outreach schedules.",
        gradient:
          "linear-gradient(135deg, rgba(59,130,246,0.25), transparent), linear-gradient(135deg, rgba(16,185,129,0.25), rgba(4,47,46,0.9))",
        tone: "aurora",
        scope: "org",
        source: "synthesized",
      },
    ];

    const wallpaperIdMap = new Map<string, string>();
    for (const wallpaperSeed of wallpaperSeeds) {
      const wallpaperId = await ensureWallpaper(
        client,
        adminUserId,
        orgId,
        wallpaperSeed,
      );
      wallpaperIdMap.set(wallpaperSeed.key, wallpaperId);
    }

    const defaultWallpaperId = wallpaperIdMap.get("twilight-ops") ?? null;
    await ensureThemePreference(client, adminUserId, orgId, defaultWallpaperId);

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

        await client.query(
          `INSERT INTO public.mission_milestones (job_id, sequence, title, description, status, target_start, target_finish, created_by)
           VALUES
             ($1, 1, 'Site Recon', 'Capture drone imagery and confirm square footage.', 'in_progress', now() + interval '12 hour', now() + interval '2 day', $2),
             ($1, 2, 'Scope Sign-Off', 'Finalize proposal packet with trustees.', 'planned', now() + interval '3 day', now() + interval '5 day', $2)
           ON CONFLICT (job_id, sequence)
           DO UPDATE SET
             title = EXCLUDED.title,
             description = EXCLUDED.description,
             status = EXCLUDED.status,
             target_start = EXCLUDED.target_start,
             target_finish = EXCLUDED.target_finish,
             updated_at = now();`,
          [stMarkJobId, adminUserId] satisfies QueryOptions,
        );

        await client.query(
          `INSERT INTO public.mission_checklists (job_id, category, item, is_required, metadata, created_by)
           VALUES
             ($1, 'Regulatory', 'Upload ADA stall layout to compliance artifacts', true, $2::jsonb, $3),
             ($1, 'Pre-Flight', 'Confirm worship blackout windows in scheduler', true, $4::jsonb, $3)
           ON CONFLICT (job_id, item)
           DO UPDATE SET
             category = EXCLUDED.category,
             is_required = EXCLUDED.is_required,
             metadata = mission_checklists.metadata || EXCLUDED.metadata,
             updated_at = now();`,
          [
            stMarkJobId,
            JSON.stringify({ seedSource: "seed-script", docType: "ada" }),
            adminUserId,
            JSON.stringify({ seedSource: "seed-script", dependency: "crew_blackouts" }),
          ] satisfies QueryOptions,
        );

        const portalSeedToken = hashToken("st-mark-portal-session");
        const portalSession = await client.query<{ id: string }>(
          `INSERT INTO public.customer_portal_sessions (job_id, contact_email, contact_name, token_hash, status, expires_at, feature_flags, created_by)
           VALUES ($1, $2, $3, $4, 'active', now() + interval '14 day', $5::jsonb, $6)
           ON CONFLICT (job_id, contact_email)
           DO UPDATE SET status = EXCLUDED.status,
                         token_hash = EXCLUDED.token_hash,
                         expires_at = EXCLUDED.expires_at,
                         feature_flags = EXCLUDED.feature_flags,
                         updated_at = now()
           RETURNING id;`,
          [
            stMarkJobId,
            "trustees@stmark.org",
            "Trustees Board",
            portalSeedToken,
            JSON.stringify({ receipts: true, approvals: true }),
            adminUserId,
          ] satisfies QueryOptions,
        );

        const portalSessionId = portalSession.rows[0]?.id;
        if (portalSessionId) {
          await client.query(
            `INSERT INTO public.customer_portal_events (session_id, job_id, event_type, actor_ip, actor_user_agent, metadata, occurred_at, created_at)
             SELECT $1, $2, 'invited', $3::inet, $4, $5::jsonb, now(), now()
             WHERE NOT EXISTS (
               SELECT 1 FROM public.customer_portal_events
               WHERE session_id = $1 AND event_type = 'invited'
             );`,
            [
              portalSessionId,
              stMarkJobId,
              "0.0.0.0",
              "seed-script/1.0",
              JSON.stringify({ seedSource: "seed-script" }),
            ] satisfies QueryOptions,
          );
        }

        await client.query(
          `INSERT INTO public.compliance_artifacts (job_id, artifact_type, storage_path, checksum, metadata, uploaded_by, verified)
           VALUES ($1, 'ada_layout', '/compliance/st-mark/ada-layout.pdf', $2, $3::jsonb, $4, true)
           ON CONFLICT (job_id, storage_path)
           DO UPDATE SET checksum = EXCLUDED.checksum,
                         metadata = compliance_artifacts.metadata || EXCLUDED.metadata,
                         verified = EXCLUDED.verified,
                         updated_at = now();`,
          [
            stMarkJobId,
            hashToken("st-mark-ada-layout"),
            JSON.stringify({ seedSource: "seed-script", version: 1 }),
            adminUserId,
          ] satisfies QueryOptions,
        );

        const { rows: artifactRows } = await client.query<{ id: string }>(
          `SELECT id FROM public.compliance_artifacts WHERE job_id = $1 AND storage_path = $2 LIMIT 1;`,
          [stMarkJobId, "/compliance/st-mark/ada-layout.pdf"] satisfies QueryOptions,
        );

        const complianceArtifactId = artifactRows[0]?.id;
        if (complianceArtifactId) {
          await client.query(
            `INSERT INTO public.compliance_reviews (id, job_id, reviewer_id, outcome, notes, submitted_at, artifacts, metadata, created_by)
             SELECT gen_random_uuid(), $1, $2, 'approved', 'ADA stall layout verified by trustees.', now(), ARRAY[$3]::uuid[], $4::jsonb, $2
             WHERE NOT EXISTS (
               SELECT 1 FROM public.compliance_reviews
               WHERE job_id = $1 AND outcome = 'approved'
             );`,
            [
              stMarkJobId,
              adminUserId,
              complianceArtifactId,
              JSON.stringify({ seedSource: "seed-script" }),
            ] satisfies QueryOptions,
          );
        }

        await client.query(
          `INSERT INTO public.weather_snapshots (job_id, provider, recorded_at, forecast, observed, metadata)
           SELECT $1, 'openweather', now(), $2::jsonb, $3::jsonb, $4::jsonb
           WHERE NOT EXISTS (
             SELECT 1 FROM public.weather_snapshots
             WHERE job_id = $1 AND provider = 'openweather'
           );`,
          [
            stMarkJobId,
            JSON.stringify({ precipitationChance: 0.15, windMph: 6 }),
            JSON.stringify({ temperatureF: 74, humidity: 0.58 }),
            JSON.stringify({ seedSource: "seed-script" }),
          ] satisfies QueryOptions,
        );

        const crewSeeds = [
          {
            name: "Alpha Crew",
            role: "Lead Crew",
            color: "#f97316",
            maxHoursPerDay: 10,
            availability: ["mon", "tue", "wed", "thu"],
          },
          {
            name: "Bravo Crew",
            role: "Support Crew",
            color: "#38bdf8",
            maxHoursPerDay: 8,
            availability: ["thu", "fri", "sat"],
          },
        ];

        for (const crew of crewSeeds) {
          await client.query(
            `INSERT INTO public.mission_crew_members (org_id, name, role, color, max_hours_per_day, availability, metadata, created_by)
             VALUES ($1, $2, $3, $4, $5, $6::text[], $7::jsonb, $8)
             ON CONFLICT (org_id, name)
             DO UPDATE SET role = EXCLUDED.role,
                           color = EXCLUDED.color,
                           max_hours_per_day = EXCLUDED.max_hours_per_day,
                           availability = EXCLUDED.availability,
                           metadata = mission_crew_members.metadata || EXCLUDED.metadata,
                           updated_at = now();`,
            [
              orgId,
              crew.name,
              crew.role,
              crew.color,
              crew.maxHoursPerDay,
              crew.availability,
              JSON.stringify({ seedSource: "seed-script" }),
              adminUserId,
            ] satisfies QueryOptions,
          );
        }

        const { rows: crewRows } = await client.query<{ id: string; name: string }>(
          `SELECT id, name FROM public.mission_crew_members WHERE org_id = $1 AND name = ANY($2::text[])`,
          [orgId, crewSeeds.map((crew) => crew.name)],
        );
        const crewIdMap = new Map(crewRows.map((row) => [row.name, row.id]));

        const missionTasks = [
          {
            title: "Sealcoat Prep & Repairs",
            site: "Sanctuary Lot",
            start: "2025-05-12T08:00:00Z",
            end: "2025-05-12T17:00:00Z",
            crewRequired: 3,
            status: "scheduled",
            priority: "critical",
            accessibilityImpact: "parking",
            notes: "Nightly staging to keep ADA stalls clear for Wednesday activities.",
            assignedCrew: ["Alpha Crew"],
          },
          {
            title: "Striping & ADA Compliance",
            site: "Sanctuary Lot",
            start: "2025-05-14T12:00:00Z",
            end: "2025-05-14T18:00:00Z",
            crewRequired: 2,
            status: "planned",
            priority: "standard",
            accessibilityImpact: "walkway",
            notes: "Coordinate with trustees for signage placement.",
            assignedCrew: ["Alpha Crew", "Bravo Crew"],
          },
        ];

        for (const task of missionTasks) {
          const assignedIds = task.assignedCrew
            .map((name) => crewIdMap.get(name))
            .filter((value): value is string => Boolean(value));

          await client.query(
            `INSERT INTO public.mission_tasks (org_id, job_id, job_name, site, start_at, end_at, crew_required, crew_assigned_ids, status, priority, accessibility_impact, notes, metadata, created_by)
             VALUES ($1, $2, $3, $4, $5::timestamptz, $6::timestamptz, $7, $8::text[], $9::mission_task_status, $10::mission_task_priority, $11::mission_accessibility_impact, $12, $13::jsonb, $14)
             ON CONFLICT (org_id, job_name, start_at)
             DO UPDATE SET end_at = EXCLUDED.end_at,
                           crew_required = EXCLUDED.crew_required,
                           crew_assigned_ids = EXCLUDED.crew_assigned_ids,
                           status = EXCLUDED.status,
                           priority = EXCLUDED.priority,
                           accessibility_impact = EXCLUDED.accessibility_impact,
                           notes = EXCLUDED.notes,
                           metadata = mission_tasks.metadata || EXCLUDED.metadata,
                           updated_at = now();`,
            [
              orgId,
              stMarkJobId,
              task.title,
              task.site,
              task.start,
              task.end,
              task.crewRequired,
              assignedIds,
              task.status,
              task.priority,
              task.accessibilityImpact,
              task.notes,
              JSON.stringify({ seedSource: "seed-script" }),
              adminUserId,
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

      const knowledgeDoc = await client.query<{ id: string }>(
        `INSERT INTO public.knowledge_documents (org_id, title, source, document_type, tags, content, metadata, created_by)
         VALUES ($1, $2, 'seed-script', 'compliance', ARRAY['ada','striping','church']::text[], $3, $4::jsonb, $5)
         ON CONFLICT (org_id, title)
         DO UPDATE SET content = EXCLUDED.content,
                       metadata = knowledge_documents.metadata || EXCLUDED.metadata,
                       updated_at = now()
         RETURNING id;`,
        [
          orgId,
          "ADA Accessible Layout Checklist",
          "Ensure the following before sealcoat: maintain van-access aisle width, repaint international symbols, confirm accessible route slope under 1:12, add tactile signage at each entry.",
          JSON.stringify({ seedSource: "seed-script", category: "ada" }),
          adminUserId,
        ] satisfies QueryOptions,
      );

      const knowledgeDocId = knowledgeDoc.rows[0]?.id;
      if (knowledgeDocId) {
        await client.query(
          `INSERT INTO public.knowledge_chunks (org_id, document_id, chunk_index, content, token_count, metadata)
           VALUES ($1, $2, 0, $3, 96, $4::jsonb)
           ON CONFLICT (document_id, chunk_index)
           DO UPDATE SET content = EXCLUDED.content,
                         token_count = EXCLUDED.token_count,
                         metadata = knowledge_chunks.metadata || EXCLUDED.metadata;`,
          [
            orgId,
            knowledgeDocId,
            "Checklist: 1) Confirm van space 132 inches wide with 60 inch aisle. 2) Repaint crosshatch using thermoplastic or approved paint. 3) Ensure accessible route is debris free and slope compliant. 4) Capture photos for audit trail.",
            JSON.stringify({ seedSource: "seed-script" }),
          ] satisfies QueryOptions,
        );
      }

      await client.query(
        `INSERT INTO public.observability_sessions (org_id, session_key, user_id, device, network, metadata, created_by)
         VALUES ($1, 'seed-observability-session', $2, $3::jsonb, $4::jsonb, $5::jsonb, $2)
         ON CONFLICT (session_key)
         DO UPDATE SET metadata = observability_sessions.metadata || EXCLUDED.metadata,
                       ended_at = now(),
                       updated_at = now();`,
        [
          orgId,
          adminUserId,
          JSON.stringify({ platform: "seed", os: "linux", appVersion: "dev-local" }),
          JSON.stringify({ type: "wifi", quality: "excellent" }),
          JSON.stringify({ seedSource: "seed-script" }),
        ] satisfies QueryOptions,
      );

      const blackoutSeeds: BlackoutFeedSeed[] = [
        {
          name: "Sunday Services & Events",
          description: "Weekend worship gatherings pulled from the shared ICS feed.",
          sourceUrl:
            process.env.SCHEDULER_BLACKOUT_FEED_URL ||
            "https://calendar.google.com/calendar/ical/connerasphalt_chapel%40gmail.com/private-6b9c73fcb4a61/basic.ics",
          timezone: "America/New_York",
          events: [
            {
              summary: "Sunday Worship Block",
              startsAt: "2025-12-07T14:00:00.000Z",
              endsAt: "2025-12-07T18:00:00.000Z",
            },
            {
              summary: "Midweek Advent Choir",
              startsAt: "2025-12-11T23:00:00.000Z",
              endsAt: "2025-12-12T01:00:00.000Z",
              details: "Reserve sanctuary lot spots for choir arrivals.",
            },
          ],
        },
      ];

      for (const feedSeed of blackoutSeeds) {
        await ensureSchedulerBlackoutFeed(client, orgId, adminUserId, feedSeed);
      }

      const liturgicalSeeds: LiturgicalEventSeed[] = [
        {
          season: "advent",
          title: "Advent Vigil",
          description: "Candlelight services leading into Christmas Eve.",
          startsOn: "2025-11-30",
          endsOn: "2025-12-24",
        },
        {
          season: "lent",
          title: "Lent Refocus",
          description: "Wednesday prayer gatherings and fasting focus.",
          startsOn: "2026-02-18",
          endsOn: "2026-03-28",
        },
        {
          season: "easter",
          title: "Easter Weekend",
          description: "Sunrise services, egg hunts, and overflow parking prep.",
          startsOn: "2026-04-04",
          endsOn: "2026-04-05",
        },
        {
          season: "pentecost",
          title: "Pentecost Flare",
          description: "Community outreach push during Pentecost week.",
          startsOn: "2026-05-24",
          endsOn: "2026-05-31",
        },
      ];

      for (const eventSeed of liturgicalSeeds) {
        await ensureLiturgicalEvent(client, adminUserId, eventSeed, null);
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
