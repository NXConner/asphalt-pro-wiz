// Supabase Edge Function: Log Beacon Receiver
// Deploy: supabase functions deploy log-beacon
// Accepts POST JSON payloads and prints to logs (for now). Add storage or forwarders if needed.

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  try {
    const body = await req.json();
    // eslint-disable-next-line no-console
    console.log("[PPS BEACON]", { body, ua: req.headers.get("user-agent") });
    return new Response("OK", { status: 200 });
  } catch (e) {
    return new Response(String((e as Error)?.message || e), { status: 400 });
  }
});
