# Secrets Manager Templates

This folder documents how to connect the Pavement Performance Suite to a production-grade secrets manager. The application expects configuration values to be surfaced as environment variables, mirroring the keys in `.env.example`. Include the HUD sync secrets introduced in Phase 2 (`HUD_CONFIG_EXPORT_SIGNING_KEY`, `HUD_CONFIG_EXPORT_ENCRYPTION_KEY`, `HUD_CONFIG_EXPORT_BUCKET`) whenever you provision environments.

## Doppler

1. Create a Doppler project (e.g., `pavement-performance-suite`).
  2. Populate project secrets matching the keys in `.env.example` (`VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, etc.). Set `CONFIG_STRICT_MODE=true` to enforce runtime validation (see `src/lib/config.ts`).
  3. Copy `config/secrets/doppler.yaml.example` to `config/secrets/doppler.yaml` and update the project/config names. The manifest maps Doppler secrets into the runtime environment:

   ```yaml
   # config/secrets/doppler.yaml
   project: pavement-performance-suite
   config: production
   envs:
     NODE_ENV: production
   fetch:
     path: ./doppler.env
     format: dotenv
   ```

4. In CI or your container entrypoint run:

   ```bash
   doppler run --mount config/secrets/doppler.yaml -- npm run security:scan
   ```

## HashiCorp Vault

1. Enable the KV secrets engine and create a policy that grants read access to a `pavement-performance-suite` path.
2. Store secrets under `kv/data/pavement-performance-suite`, for example:

    ```json
    {
      "data": {
        "VITE_SUPABASE_URL": "https://...",
        "SUPABASE_SERVICE_ROLE_KEY": "...",
        "VITE_GEMINI_PROXY_URL": "https://...",
        "HUD_CONFIG_EXPORT_SIGNING_KEY": "...",
        "HUD_CONFIG_EXPORT_ENCRYPTION_KEY": "..."
      }
    }
    ```

  3. Copy `vault.env.template` to `vault.env`, fill in your Vault address/token, then source it to render a `.env.runtime` file via the included script. Vault integrations should export `CONFIG_STRICT_MODE=true` to enable runtime validation:

   ```bash
    vault kv get -format=json kv/pavement-performance-suite \
      | jq -r '.data.data | to_entries | map("\(.key)=\(.value)") | .[]' > .env.runtime
   ```

4. Run the application or tests with the generated `.env.runtime`.

## AWS Secrets Manager

1. Store secrets in a JSON secret, for example `pavement/performance-suite/prod` (see `aws-secrets-manager.json.example` for a full payload):

    ```json
    {
      "VITE_SUPABASE_URL": "https://...",
      "SUPABASE_SERVICE_ROLE_KEY": "...",
      "DATABASE_URL": "postgres://...",
      "HUD_CONFIG_EXPORT_BUCKET": "s3://..."
    }
    ```

2. Fetch and export the values at runtime:

   ```bash
   export $(aws secretsmanager get-secret-value \
     --secret-id pavement/performance-suite/prod \
     --query SecretString --output text | jq -r 'to_entries | .[] | "\(.key)=\(.value)"')
   ```

3. Start the application (`npm run dev`, Docker container, etc.) using the exported environment variables.

## Operational Checklist

- Never commit real secrets--only templates and command snippets live in this directory.
- Ensure CI runners call `npm run security:scan` after secrets are mounted to catch dependency vulnerabilities.
- Rotate credentials regularly and update the secret store; the app reads values at runtime, so restarts pick up new secrets automatically.
