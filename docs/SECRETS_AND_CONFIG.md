# Secrets & Config
## Production-grade secrets management (placeholder wiring)

- Recommended managers: Doppler, HashiCorp Vault, AWS Secrets Manager.
- CI examples:

```yaml
# .github/workflows/main.yml (snippet)
env:
  VITE_GEMINI_PROXY_URL: ${{ secrets.VITE_GEMINI_PROXY_URL }}
  VITE_LOG_BEACON_URL: ${{ secrets.VITE_LOG_BEACON_URL }}
```

- Local development uses `.env` loaded by Vite. Never commit real secrets.
- VITE_GEMINI_PROXY_URL: URL of Supabase Edge Function `gemini-proxy` to avoid exposing Gemini keys in browser.
- VITE_LOG_BEACON_URL: Optional endpoint to receive client-side structured logs via `navigator.sendBeacon`.
- DATABASE_URL: For local Postgres when running migrations and seed scripts.

Use a secrets manager (Doppler, Vault, AWS Secrets Manager) in production. Do not commit secrets.
