# API Overview

This project currently runs frontend-only with optional Supabase Edge Functions.

## Gemini Proxy (Supabase Edge Function)

- Path: `supabase/functions/gemini-proxy`
- Methods: `POST`
- Body:
  - `{ action: 'chat', contents }` -> `{ text }`
  - `{ action: 'image', contents }` -> `{ text }`
  - `{ action: 'embed', text }` -> `{ embedding: { values: number[] } }`

Set `VITE_GEMINI_PROXY_URL` to route all Gemini requests via the proxy.
