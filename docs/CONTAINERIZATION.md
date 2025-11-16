## Containerization Guide

This project ships with a container stack that targets both production deployments and day-to-day development. Everything is driven by multi-stage Docker builds plus two Compose entrypoints, and the build context is aggressively pruned via `.dockerignore` (Android sources, archived folders, docs, and vendored externals are now excluded) so `docker build` stays lean even on CI runners:

| Use Case                                        | Command                                                                                      | Notes                                                                                                                                        |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| Production-like stack (Nginx + Postgres + Otel) | `docker compose up --build app`                                                              | Builds the multi-stage image, runs migrations via the `migrator` service, then serves the static bundle behind Nginx.                        |
| Interactive dev server with hot reload          | `docker compose -f docker-compose.yml -f docker-compose.dev.yml up app-dev db observability` | Reuses the tooling stage, mounts your working tree, and runs `npm run dev` on port `5173` while keeping Postgres + Otel in the same network. |
| Database migrations only                        | `docker compose run --rm migrator`                                                           | Uses the tooling target to run `npm run migrate:up`.                                                                                         |
| Database seed data                              | `docker compose --profile setup run --rm seeder`                                             | Seeds realistic demo data after migrations succeed.                                                                                          |

### Dockerfile Layout

The root `Dockerfile` already follows a multi-stage structure:

1. **`base`** installs dependencies with `npm ci` using predictable caching.
2. **`sources`** copies the TypeScript, Vite, test, and Supabase sources.
3. **`tooling`** configures the full environment to run linting, tests, and scripts (used by `migrator`, `seeder`, and now `app-dev`).
4. **`quality`** executes `npm run check:env -- --strict`, ESLint, TypeScript, and Vitest to prevent shipping broken builds.
5. **`build`** produces the optimized Vite bundle and prunes dev dependencies.
6. **`runtime`** copies the dist output into an `nginx:1.27-alpine` image with health checks baked in.

Every stage honours the `NODE_VERSION`, `VITE_*`, and Supabase arguments so the same Dockerfile powers production releases, CI checks, and local development.

### docker-compose.yml (production parity)

The main Compose file provides:

- `app`: the runtime Nginx container built from the `runtime` target.
- `migrator`: runs migrations on start and exits.
- `seeder`: optional profile to load demo data via `npm run seed`.
- `db`: `pgvector/pgvector:pg16` database with a persistent `pg_data` volume.
- `observability`: an Otel Collector bootstraped via `config/observability/otel-collector.yaml`.

Each service shares the `pavement` bridge network and inherits a consistent environment block (`x-app-env`) so secrets stay in `.env` while safe defaults ship for preview builds.

### docker-compose.dev.yml (hot reload stack)

Phase 3 introduces `docker-compose.dev.yml`, which adds a dedicated `app-dev` service:

- Builds from the `tooling` stage to reuse the full Node toolchain.
- Mounts your working directory at `/workspace` and a named volume for `node_modules`.
- Runs `npm install` (cached in the container) before starting `npm run dev -- --host 0.0.0.0 --port 5173`.
- Uses the new Compose `develop.watch` sync rules so `src/` and `public/` changes stream into the container without a rebuild.
- Shares the same `pavement` network so it can talk to `db` and `observability`.

Start the dev stack with:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build app-dev db observability
```

### Useful Environment Variables

- `APP_ENV`, `VITE_ENVIRONMENT`: controls feature-flag defaults and telemetry.
- `WEB_PORT`: port exposed by the production Nginx container (defaults to 8080).
- `DEV_SERVER_PORT`: port exposed by the Vite dev server (defaults to 5173).
- `DB_PORT`, `POSTGRES_*`: configure the pgvector instance.
- `OTEL_COLLECTOR_{GRPC,HTTP}_PORT`: expose the collector for local tracing.

Put sensitive credentials in `.env` (already `.dockerignore`d) and they will be injected automatically by both Compose stacks.

### Cleaning Up

```bash
# Stop containers but keep volumes
docker compose down

# Remove volumes as well (destroys Postgres state)
docker compose down -v

# Remove dev node_modules volume
docker volume rm pavement-performance-suite_dev_node_modules
```

### Troubleshooting

- **`app-dev` rebuilds slowly** – docker-sync watch rules only rebuild when `package*.json` change; otherwise code changes stream instantly. For large dependency updates, remove the `dev_node_modules` volume.
- **Port collisions** – set `WEB_PORT` or `DEV_SERVER_PORT` in your `.env` or export them before running Compose.
- **Database connection errors** – ensure the `db` service finished its healthcheck (Compose waits, but manual `docker compose run app-dev` without `up` will need `--depend` on `db`).

These container recipes now cover both production deployments and local productivity, satisfying Phase 3 of the execution plan.
