/**
 * Supabase Edge Function: Log Beacon with Structured Persistence.
 *
 * Deploy with: `supabase functions deploy log-beacon`
 *
 * Accepts POST JSON payloads (single or batch up to 50) and persists structured telemetry into:
 * - `system_telemetry` (general event log)
 * - `telemetry_events` (analytics stream)
 * - `preview_asset_incidents` (Lovable preview asset health)
 *
 * Authentication: Supabase JWT (anon/service). Returns `{ ingested: number }` on success.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.8";

const MAX_BATCH_SIZE = 50;
const DEFAULT_CONTENT_TYPE = { "Content-Type": "application/json" };

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      })
    : null;

const logEventSchema = z
  .object({
    event: z.string().min(1, "Event name is required"),
    level: z.enum(["debug", "info", "warn", "error"]).default("info"),
    message: z.string().max(2000).optional(),
    reason: z.string().max(2000).optional(),
    ts: z.string().optional(),
    timestamp: z.union([z.number(), z.string()]).optional(),
    sessionId: z.string().optional(),
    deviceId: z.string().optional(),
    environment: z.string().optional(),
    pageUrl: z.string().optional(),
    url: z.string().optional(),
    referrer: z.string().optional(),
    assetUrl: z.string().optional(),
    assetTag: z.string().optional(),
    userAgent: z.string().optional(),
    metadata: z.record(z.unknown()).optional(),
  })
  .catchall(z.unknown());

const logBatchSchema = z
  .array(logEventSchema)
  .max(MAX_BATCH_SIZE, `Maximum ${MAX_BATCH_SIZE} log entries per request`);

function parseIsoTimestamp(value: unknown, fallbackIso: string): string {
  if (typeof value === "number") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallbackIso : date.toISOString();
  }

  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? fallbackIso : date.toISOString();
  }

  return fallbackIso;
}

function mapSeverity(level: string, event: string): "info" | "warning" | "error" | "critical" {
  const normalized = level.toLowerCase();
  if (event.startsWith("lovable.asset_")) {
    return "critical";
  }
  if (normalized === "error") {
    return "error";
  }
  if (normalized === "warn") {
    return "warning";
  }
  return "info";
}

function mapTelemetryCategory(
  event: string,
  severity: "info" | "warning" | "error" | "critical",
): "system" | "user_action" | "error" | "warning" | "info" | "audit" {
  if (severity === "critical" || severity === "error") {
    return "error";
  }
  if (severity === "warning") {
    return "warning";
  }
  if (event.includes("user") || event.includes("interaction")) {
    return "user_action";
  }
  return "system";
}

function sanitizeText(value: unknown, maxLength = 2048): string | null {
  if (typeof value !== "string") return null;
  if (value.length <= maxLength) return value;
  return value.slice(0, maxLength);
}

function pruneUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(pruneUndefined);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, pruneUndefined(v)]),
    );
  }
  return value;
}

function toMetadata(entry: Record<string, unknown>) {
  const metadata = { ...entry };
  delete metadata.event;
  delete metadata.level;
  delete metadata.ts;
  delete metadata.timestamp;
  delete metadata.message;
  delete metadata.reason;
  return pruneUndefined(metadata) ?? {};
}

function isLovableAssetEvent(event: string): boolean {
  return event.startsWith("lovable.asset_");
}

function computeIncidentHash(entry: z.infer<typeof logEventSchema>): string | null {
  const parts = [
    entry.event?.toLowerCase?.() ?? "",
    entry.assetUrl?.toLowerCase?.() ?? "",
    entry.pageUrl?.toLowerCase?.() ?? entry.url?.toLowerCase?.() ?? "",
    entry.reason?.toLowerCase?.() ?? entry.message?.toLowerCase?.() ?? "",
  ]
    .map((segment) => segment.trim())
    .filter(Boolean);

  if (parts.length === 0) return null;

  const base = parts.join("|");
  let hash = 0;
  for (let i = 0; i < base.length; i += 1) {
    hash = (hash << 5) - hash + base.charCodeAt(i);
    hash |= 0;
  }
  return `pps_${Math.abs(hash).toString(16)}`;
}

serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
      status: 405,
      headers: DEFAULT_CONTENT_TYPE,
    });
  }

  if (!supabase) {
    return new Response(JSON.stringify({ error: "Supabase client not configured" }), {
      status: 500,
      headers: DEFAULT_CONTENT_TYPE,
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: DEFAULT_CONTENT_TYPE,
    });
  }

  let incoming: unknown;
  try {
    incoming = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), {
      status: 400,
      headers: DEFAULT_CONTENT_TYPE,
    });
  }

  const arrayPayload = Array.isArray(incoming) ? incoming : [incoming];
  if (arrayPayload.length === 0) {
    return new Response(JSON.stringify({ ingested: 0 }), {
      status: 200,
      headers: DEFAULT_CONTENT_TYPE,
    });
  }

  let validated: z.infer<typeof logEventSchema>[];
  try {
    validated = logBatchSchema.parse(arrayPayload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation failed", details: error.errors }), {
        status: 400,
        headers: DEFAULT_CONTENT_TYPE,
      });
    }
    return new Response(JSON.stringify({ error: "Validation failed" }), {
      status: 400,
      headers: DEFAULT_CONTENT_TYPE,
    });
  }

  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;
  let userId: string | null = null;

  if (token) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data?.user?.id) {
        userId = data.user.id;
      }
    } catch (error) {
      console.warn("[log-beacon] Unable to resolve user from token", error);
    }
  }

  const requestUserAgent = req.headers.get("user-agent") ?? undefined;
  const receivedAt = new Date().toISOString();

  const systemTelemetryRows: Array<Record<string, unknown>> = [];
  const previewIncidentRows: Array<Record<string, unknown>> = [];
  const telemetryEventRows: Array<Record<string, unknown>> = [];

  for (const entry of validated) {
    const occurredAt = parseIsoTimestamp(entry.ts ?? entry.timestamp, receivedAt);
    const severity = mapSeverity(entry.level, entry.event);
    const category = mapTelemetryCategory(entry.event, severity);
    const sanitizedMessage = sanitizeText(entry.message ?? entry.reason ?? entry.event, 1024);
    const metadata = toMetadata(entry as Record<string, unknown>);

    systemTelemetryRows.push({
      user_id: userId,
      event_type: entry.event,
      event_category: category,
      severity,
      message: sanitizedMessage,
      metadata,
      created_at: receivedAt,
    });

    telemetryEventRows.push({
      user_id: userId,
      session_id: entry.sessionId ?? null,
      source: entry.environment ?? "client",
      event_name: entry.event,
      event_version: 1,
      properties: metadata,
      context: {
        severity,
        page_url: entry.pageUrl ?? entry.url ?? null,
        device_id: entry.deviceId ?? null,
        referrer: entry.referrer ?? null,
      },
      occurred_at: occurredAt,
      received_at: receivedAt,
    });

    if (isLovableAssetEvent(entry.event)) {
      previewIncidentRows.push({
        user_id: userId,
        created_by: userId,
        session_id: entry.sessionId ?? null,
        device_id: entry.deviceId ?? null,
        event_type: entry.event,
        severity,
        asset_url: sanitizeText(entry.assetUrl ?? entry.url ?? null, 2048),
        asset_tag: sanitizeText(entry.assetTag ?? null, 255),
        page_url: sanitizeText(entry.pageUrl ?? entry.url ?? null, 2048),
        referrer: sanitizeText(entry.referrer ?? null, 2048),
        reason: sanitizeText(entry.reason ?? null, 2048),
        message: sanitizedMessage,
        environment: sanitizeText(entry.environment ?? null, 128),
        user_agent: sanitizeText(entry.userAgent ?? requestUserAgent ?? null, 512),
        incident_hash: computeIncidentHash(entry),
        occurred_at: occurredAt,
        metadata,
        created_at: receivedAt,
        updated_at: receivedAt,
      });
    }
  }

  try {
    if (systemTelemetryRows.length > 0) {
      const { error } = await supabase.from("system_telemetry").insert(systemTelemetryRows);
      if (error) throw error;
    }

    if (telemetryEventRows.length > 0) {
      const { error } = await supabase.from("telemetry_events").insert(telemetryEventRows);
      if (error) throw error;
    }

    if (previewIncidentRows.length > 0) {
      const { error } = await supabase.from("preview_asset_incidents").insert(previewIncidentRows);
      if (error) throw error;
    }
  } catch (error) {
    console.error("[log-beacon] Failed to persist telemetry", error);
    return new Response(
      JSON.stringify({ error: "Failed to persist telemetry payload", details: String(error?.message ?? error) }),
      {
        status: 500,
        headers: DEFAULT_CONTENT_TYPE,
      },
    );
  }

  return new Response(JSON.stringify({ ingested: validated.length }), {
    status: 200,
    headers: DEFAULT_CONTENT_TYPE,
  });
});
