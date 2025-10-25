// Supabase Edge Function: Gemini Proxy
// Deploy with `supabase functions deploy gemini-proxy` and set secret GEMINI_API_KEY

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

async function handleChat(contents: unknown, apiKey: string): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleImage(contents: unknown, apiKey: string): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents }),
  });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return new Response(JSON.stringify({ text }), {
    headers: { "Content-Type": "application/json" },
  });
}

async function handleEmbed(text: string, apiKey: string): Promise<Response> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content: { parts: [{ text }] } }),
  });
  if (!res.ok) return new Response(await res.text(), { status: res.status });
  const data = await res.json();
  return new Response(JSON.stringify({ embedding: { values: data?.embedding?.values ?? [] } }), {
    headers: { "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return new Response("Missing GEMINI_API_KEY", { status: 500 });
  try {
    const body = await req.json();
    const action = String(body?.action || "").toLowerCase();
    if (action === "chat") return await handleChat(body?.contents, apiKey);
    if (action === "image") return await handleImage(body?.contents, apiKey);
    if (action === "embed") return await handleEmbed(String(body?.text || ""), apiKey);
    return new Response("Bad Request", { status: 400 });
  } catch (e) {
    return new Response(String(e?.message || e), { status: 500 });
  }
});
