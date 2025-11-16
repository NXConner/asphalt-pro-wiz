## Containerization Guide

This project ships with a container stack that targets both production deployments and day-to-day development. Everything is driven by a multi-stage Docker build plus a single Compose file with opt-in profiles, and the build context is aggressively pruned via `.dockerignore` so `docker build` stays lean even on CI runners:

| Use Case                                        | Command                                                       | Notes                                                                                                                                      |
| ----------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Production-like stack (Nginx + Postgres + Otel) | `docker compose up --build web`                               | Builds the multi-stage image, runs migrations via the `migrator` service, then serves the static bundle behind Nginx.                      |
| Interactive dev server with hot reload          | `docker compose --profile dev up devserver db measurement-ai` | Reuses the `devserver` stage, mounts your working tree, and runs `npm run dev` on port `5173` while keeping Postgres + mock AI services.   |
| Database migrations only                        | `docker compose run --rm migrator`                            | Uses the tooling target to run `npm run migrate:up`.                                                                                       |
| Database seed data                              | `docker compose --profile setup run --rm seeder`              | Seeds realistic demo data after migrations succeed.                                                                                        |
| Measurement/segmentation mock APIs              | `docker compose up measurement-ai`                            | Boots a MockServer instance with preloaded expectations that emulate AI measurement + segmentation responses for the redesigned workflow. |

### Dockerfile Layout

The root `Dockerfile` now follows this multi-stage structure:

1. **`base`** installs required OS packages and primes npm config.
2. **`deps`** runs `npm ci` with a cache mount for deterministic installs.
3. **`workspace`** copies TypeScript sources, configs, Supabase assets, and scripts while keeping `node_modules`.
4. **`tooling`** sets safe defaults for local scripts (migrations, seeds, etc.).
5. **`quality`** executes `npm run check:env -- --strict`, ESLint, TypeScript, and Vitest to prevent shipping broken builds.
6. **`build`** produces the optimized Vite bundle and prunes dev dependencies.
7. **`devserver`** exposes `npm run dev -- --host 0.0.0.0 --port 5173` for Compose-driven hot reload.
8. **`runtime`** copies the dist output into an `nginx:1.27-alpine` image with health checks baked in.
1. **`base`** installs dependencies with `npm ci` using predictable caching.
2. **`sources`** copies the TypeScript, Vite, test, and Supabase sources.
3. **`tooling`** configures the full environment to run linting, tests, and scripts (used by `migrator`, `seeder`, and now `app-dev`).
4. **`quality`** executes `npm run check:env -- --strict`, ESLint, TypeScript, and Vitest to prevent shipping broken builds.
5. **`build`** produces the optimized Vite bundle and prunes dev dependencies.
6. **`runtime`** copies the dist output into an `nginx:1.27-alpine` image with a dedicated `/health` endpoint so Docker, Lovable, or Kubernetes probes no longer hit the SPA shell.

Every stage honours `NODE_VERSION`, `VITE_*`, and Supabase arguments so the same Dockerfile powers production releases, CI checks, dev hot reload, and auxiliary scripting containers.

### docker-compose.yml (production parity)

The single Compose file now provides:

- `web`: the runtime Nginx container built from the `runtime` target.
- `devserver` (profile `dev`): hot-reload Vite server with bind mounts and a dedicated `devserver_node_modules` volume so dependencies persist between rebuilds.
- `migrator`: runs migrations on start and exits.
- `seeder`: optional profile to load demo data via `npm run seed`.
- `db`: `pgvector/pgvector:pg16` database with a persistent `pg_data` volume.
- `observability`: an Otel Collector bootstrapped via `config/observability/otel-collector.yaml`.
- `measurement-ai`: MockServer-based measurement + segmentation APIs that unblock the redesigned workflow until the real AI inference service ships.

Each service shares the `pavement` bridge network and inherits the `x-app-env` block so secrets stay in `.env` while sane defaults unlock local testing. Enable the dev server with:

```bash
docker compose --profile dev up devserver db measurement-ai
```

The production-ish stack remains:

```bash
docker compose up --build web
```

### Useful Environment Variables

- `APP_ENV`, `VITE_ENVIRONMENT`: controls feature-flag defaults and telemetry.
- `WEB_PORT`: port exposed by the production Nginx container (defaults to 8080).
- `VITE_PORT`: port exposed by the Vite dev server (defaults to 5173).
- `PORT`, `WEB_PORT`, `VITE_DEV_SERVER_PORT`: keep Lovable previews, Compose, and Vite dev server aligned; `/health` uses these values automatically.
- `VITE_PREVIEW_HEARTBEAT_INTERVAL_MS`, `VITE_PREVIEW_HEALTH_TIMEOUT_MS`, `VITE_HEALTHCHECK_URL`: control the preview watchdog heartbeat in `installLovableAssetMonitoring`.
- `SCHEDULER_*`, `VITE_LITURGICAL_CALENDAR_URL`, `VITE_SUPPLIER_FEED_URL`: feed the mission scheduler, blackout imports, and supplier telemetry inside containers so production and local demos match.
- `VITE_THEME_AI_ENDPOINT`, `VITE_ESTIMATOR_AI_ENDPOINT`, `VITE_INCIDENT_WEBHOOK_URL`: wire up AI wallpaper ingestion, estimator copilots, and incident bridge flows regardless of environment.
- `DB_PORT`, `POSTGRES_*`: configure the pgvector instance.
- `OTEL_COLLECTOR_{GRPC,HTTP}_PORT`: expose the collector for local tracing.
- `MEASUREMENT_API_PORT`: expose the measurement MockServer (defaults to 8787).

Put sensitive credentials in `.env` (already `.dockerignore`d) and they will be injected automatically by both Compose stacks.

### Cleaning Up

```bash
# Stop containers but keep volumes
docker compose down

# Remove volumes as well (destroys Postgres state)
docker compose down -v

# Remove dev node_modules volume
docker volume rm pavement-performance-suite_devserver_node_modules
```

### Troubleshooting

- **`devserver` rebuilds slowly** – remove the `devserver_node_modules` volume if dependencies drift. Source changes stream instantly because the working tree is bind-mounted.
- **Port collisions** – set `WEB_PORT`, `VITE_PORT`, or `MEASUREMENT_API_PORT` in your `.env` or export them before running Compose.
- **Database connection errors** – ensure the `db` service finished its healthcheck (Compose waits, but manual `docker compose run devserver` without `up` will need `--depend` on `db`).

These container recipes now cover production deployments, mocked AI integrations, and fast local productivity, satisfying Phase 3 of the execution plan.
