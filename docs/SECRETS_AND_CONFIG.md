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
- VITE_GEMINI_PROXY_URL: URL of Supabase Edge Function `gemini-proxy` to avoid exposing Gemini keys in browser. In non-development environments, the app requires a proxy; direct API keys in the browser are blocked.
- VITE_LOG_BEACON_URL: Optional endpoint to receive client-side structured logs via `navigator.sendBeacon`.
- DATABASE_URL: For local Postgres when running migrations and seed scripts.

## HUD configuration & sync variables

- `VITE_FLAG_HUD_MULTI_MONITOR`, `VITE_HUD_MULTI_MONITOR_STRATEGY`: Enable and tune the adaptive HUD positioning logic per display topology (`auto`, `single`, `persist-latest`). Recommended to keep the flag off in environments that do not expose Screen Enumeration APIs.
- `VITE_FLAG_HUD_GESTURES`, `VITE_HUD_GESTURE_SENSITIVITY`: Toggle gesture controls and calibrate thresholds (`conservative`, `standard`, `aggressive`) for touch/pen inputs.
- `VITE_FLAG_HUD_ANIMATIONS`, `VITE_HUD_DEFAULT_ANIMATION_PRESET`, `VITE_HUD_ANIMATION_PRESETS_PATH`: Surface curated animation pipelines; presets referenced in JSON hosted alongside the web bundle or Supabase storage.
- `VITE_FLAG_HUD_CONFIG_SYNC`, `VITE_HUD_CONFIG_EXPORT_FORMAT`, `VITE_HUD_CONFIG_EXPORT_ENDPOINT`: Allow operators to export/import HUD profiles. The endpoint can target Supabase Edge Functions or another signed API.
- `HUD_CONFIG_EXPORT_SIGNING_KEY`, `HUD_CONFIG_EXPORT_ENCRYPTION_KEY`, `HUD_CONFIG_EXPORT_BUCKET`: **Secrets** that must be injected from your secrets manager. Signing key hashes exported payloads, encryption key (32 bytes AES-256) protects archives at rest, and bucket/collection routes uploads.

Use a secrets manager (Doppler, Vault, AWS Secrets Manager) in production. Templates and integration snippets live in `config/secrets/`:

- `README.md` – usage instructions for Doppler, Vault, and AWS Secrets Manager
- `doppler.yaml.example` – sample Doppler CLI configuration

After secrets are mounted, run the consolidated security scan:

```
npm run security:scan
```

The script wraps `npm audit --audit-level=high` and `snyk test` so CI/CD pipelines can fail fast on dependency vulnerabilities.
