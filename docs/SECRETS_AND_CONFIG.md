# Secrets & Config

- VITE_GEMINI_PROXY_URL: URL of Supabase Edge Function `gemini-proxy` to avoid exposing Gemini keys in browser.
- VITE_LOG_BEACON_URL: Optional endpoint to receive client-side structured logs via `navigator.sendBeacon`.
- DATABASE_URL: For local Postgres when running migrations and seed scripts.

Use a secrets manager (Doppler, Vault, AWS Secrets Manager) in production. Do not commit secrets.
