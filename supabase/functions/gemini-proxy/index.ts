// Supabase Edge Function: Gemini Proxy with Authentication & Validation
// Deploy with `supabase functions deploy gemini-proxy` and set secret GEMINI_API_KEY

/**
 * @openapi
 * /gemini-proxy:
 *   post:
 *     tags:
 *       - AI
 *     summary: Proxy Gemini API calls
 *     description: >
 *       Routes chat, image, and embedding requests to Google Gemini models while keeping API keys
 *       on the server. Requires a Supabase JWT (anon or service) supplied as `Authorization: Bearer <token>`.
 *     operationId: GeminiProxy
 *     security:
 *       - supabaseAnonKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         'application/json':
 *           schema:
 *             $ref: '#/components/schemas/GeminiProxyRequest'
 *           examples:
 *             chat:
 *               summary: Chat prompt
 *               value:
 *                 action: chat
 *                 contents:
 *                   - parts:
 *                       - text: Summarize sealcoating steps for a 25,000 sq ft church campus.
 *             embed:
 *               summary: Embedding request
 *               value:
 *                 action: embed
 *                 text: Church lot resurfacing quote
 *     responses:
 *       '200':
 *         description: Gemini response payload
 *         content:
 *           'application/json':
 *             schema:
 *               $ref: '#/components/schemas/GeminiProxyResponse'
 *       '400':
 *         description: Unsupported action or malformed body
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '401':
 *         description: Missing Authorization header
 *       '405':
 *         description: Method not allowed
 *       '500':
 *         description: Upstream error or missing API key
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

// Validation schemas
const chatSchema = z.object({
  action: z.literal("chat"),
  contents: z.array(z.object({
    parts: z.array(z.object({
      text: z.string().max(10000, "Text must be less than 10,000 characters")
    })).max(20, "Maximum 20 parts per message")
  })).max(10, "Maximum 10 messages in conversation"),
});

const imageSchema = z.object({
  action: z.literal("image"),
  contents: z.array(z.object({
    parts: z.array(z.union([
      z.object({ text: z.string().max(5000) }),
      z.object({ inlineData: z.object({ mimeType: z.string(), data: z.string() }) })
    ])).max(10)
  })).max(5),
});

const embedSchema = z.object({
  action: z.literal("embed"),
  text: z.string().min(1).max(5000, "Text must be between 1 and 5,000 characters"),
});

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

/**
 * @openapi
 * /gemini-proxy:
 *   post:
 *     tags:
 *       - AI
 *     summary: Proxy Gemini API requests
 *     description: |
 *       Routes chat, image, and embedding requests to Google Gemini models while keeping API keys server-side.
 *       Requires a Supabase JWT (anon key or service role) present in the `Authorization` header.
 *     operationId: postGeminiProxy
 *     security:
 *       - supabaseBearer: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GeminiProxyRequest'
 *           examples:
 *             chat:
 *               summary: Chat prompt
 *               value:
 *                 action: chat
 *                 contents:
 *                   - parts:
 *                       - text: "Summarize sealcoating steps for a church parking lot"
 *             embed:
 *               summary: Generate text embeddings
 *               value:
 *                 action: embed
 *                 text: "Crack sealing crew checklist"
 *     responses:
 *       '200':
 *         description: Gemini response payload
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GeminiProxyResponse'
 *       '400':
 *         description: Validation failed or unsupported action
 *       '401':
 *         description: Missing or invalid Supabase JWT
 *       '405':
 *         description: Method not allowed
 *       '500':
 *         description: Upstream Gemini error or missing API key
 */
serve(async (req) => {
  if (req.method !== "POST") return new Response("Method Not Allowed", { status: 405 });
  
  const apiKey = Deno.env.get("GEMINI_API_KEY");
  if (!apiKey) return new Response("Missing GEMINI_API_KEY", { status: 500 });
  
  // Extract user from JWT (automatically verified by Supabase when verify_jwt = true)
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response("Unauthorized", { status: 401 });
  }
  
  try {
    const body = await req.json();
    const action = String(body?.action || "").toLowerCase();
    
    // Validate input based on action
    if (action === "chat") {
      const validated = chatSchema.parse(body);
      return await handleChat(validated.contents, apiKey);
    }
    
    if (action === "image") {
      const validated = imageSchema.parse(body);
      return await handleImage(validated.contents, apiKey);
    }
    
    if (action === "embed") {
      const validated = embedSchema.parse(body);
      return await handleEmbed(validated.text, apiKey);
    }
    
    return new Response("Invalid action. Must be 'chat', 'image', or 'embed'", { status: 400 });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: "Validation failed", details: e.errors }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(String((e as Error)?.message || e), { status: 500 });
  }
});
