// Supabase Edge Function: Log Beacon with Authentication & Validation
// Deploy: supabase functions deploy log-beacon
// Accepts POST JSON payloads with authentication and validation

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Validation schema for log entries
const logSchema = z.object({
  level: z.enum(["debug", "info", "warn", "error"]).optional(),
  message: z.string().max(1000, "Message must be less than 1000 characters"),
  metadata: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

const logBatchSchema = z.array(logSchema).max(50, "Maximum 50 log entries per request");

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  
  // Verify authentication (JWT automatically verified by Supabase when verify_jwt = true)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  try {
    const body = await req.json();
    
    // Validate input
    const logs = Array.isArray(body) ? body : [body];
    const validated = logBatchSchema.parse(logs);
    
    // eslint-disable-next-line no-console
    console.log("[PPS BEACON]", {
      logs: validated,
      ua: req.headers.get("user-agent"),
      timestamp: new Date().toISOString(),
    });
    return new Response("OK", { status: 200 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation failed", details: e.errors }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(String((e as Error)?.message || e), { status: 400 });
  }
});
