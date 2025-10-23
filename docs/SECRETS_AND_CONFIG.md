# Secrets and Configuration

Use environment variables for all secrets. In production, use a secrets manager:

- Doppler: `doppler run -- npm start`
- HashiCorp Vault: inject `.env` at runtime or use a sidecar
- AWS Secrets Manager: fetch and export env vars on boot

Local development:
- Copy `.env.example` to `.env` and fill values (never commit `.env`).

Supabase Edge Function (Gemini Proxy):
- Create `supabase/functions/gemini-proxy` and deploy with `supabase functions deploy gemini-proxy`.
- Set secret `GEMINI_API_KEY` in Supabase (Dashboard -> Project Settings -> Functions).
- Expose the function URL and set `VITE_GEMINI_PROXY_URL` in `.env` to route all Gemini calls via the proxy.

Notes:
- When `VITE_GEMINI_PROXY_URL` is set, the app will not use `VITE_GEMINI_API_KEY` in the browser.

CI/CD:
- Store secrets as GitHub Action secrets, pass to jobs as env.

Audits:
- `npm run audit` to check npm vulnerabilities
- `npm run snyk:test` and `npm run snyk:monitor` (requires `SNYK_TOKEN`)
