## Security Operations Playbook

The Pavement Performance Suite treats secrets management and dependency hygiene as first-class responsibilities. Use this checklist whenever you bootstrap a new environment or respond to a security event.

### 1. Secrets Provider Workflow

1. **Choose a provider** – Set `SECRET_PROVIDER` to one of `env`, `doppler`, `vault`, or `aws-secrets-manager`.  
2. **Hydrate secrets** – Populate every key from `.env.example` inside the provider (Supabase URLs/keys, HUD export secrets, AI proxy credentials, etc.).  
3. **Render runtime env** – After fetching secrets, run `npm run secrets:render -- --output .env.runtime` (add `--strict` in CI).  
4. **Audit coverage** – Review `config/secrets/README.md` for provider-specific templates:
   - `config/secrets/doppler.yaml.example` for Doppler.
   - `config/secrets/vault.env.template` for Vault.
   - `config/secrets/aws-secrets-manager.json.example` for AWS.
5. **Verify at runtime** – `src/config/secrets.ts` will throw actionable errors if a required secret is missing. Keep `SECRET_PROVIDER` consistent across your runtime, seed scripts, and Supabase Edge Functions.

> **Tip:** Store the rendered `.env.runtime` in memory (CI env vars or Docker secrets)—never commit it to git.

### 2. Dependency Vulnerability Scanning

| Command | Description |
| --- | --- |
| `npm run security:scan` | Runs `npm audit --audit-level=high` and `snyk test`. |
| `npm run security:report` | Emits `security-report.json` (moderate+ severity) for archival. |
| `npm run security:baseline` | Convenience script that performs both the scan and report steps (ideal for daily health checks). |
| `npm run security:ci` | Full CI gate: audit, Snyk test, and JSON report. |

**Operational expectations**

- Run `npm run security:baseline` locally before cutting release branches.  
- The GitHub Actions workflow (`.github/workflows/main.yml`) should call `npm run security:ci` on every push; review the JSON artifact when alerts fire.  
- If a vulnerable dependency cannot be patched immediately, document the exception (package, version, CVE, mitigation) in the relevant PR and create a follow-up issue.

### 3. Incident & Rotation Checklist

1. Rotate secrets in the provider, then redeploy (no code changes required because the app reads them at runtime).  
2. Re-run `npm run security:baseline` to confirm supply chain hygiene.  
3. Update `docs/SECURITY_REMEDIATION_GUIDE.md` (or the incident ticket) with timelines, affected environments, and mitigation steps.  
4. Monitor Supabase audit logs and the `observability_sessions` table for anomalies tied to the incident.

### 4. Onboarding / Enforcement

- Point new contributors to this document plus `docs/ADMIN_SETUP.md`.  
- Enforce `SECRET_PROVIDER=env` for local workstations and require Doppler/Vault/AWS in shared environments.  
- Keep the `security-report.json` artifact for **90 days** to satisfy customer audit requests.  
- Add a recurring calendar task (weekly) to run `npm run security:baseline` and review Snyk alerts.
