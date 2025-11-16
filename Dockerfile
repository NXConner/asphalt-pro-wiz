# syntax=docker/dockerfile:1.9

ARG NODE_VERSION=22-alpine
ARG APP_HOME=/app

################################################################################
# Base image with shared tooling
################################################################################
FROM node:${NODE_VERSION} AS base
WORKDIR ${APP_HOME}
ENV CI=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm_config_loglevel=warn \
    npm_config_fund=false \
    npm_config_audit=false
RUN apk add --no-cache bash curl git libc6-compat
COPY package.json package-lock.json ./

################################################################################
# Dependency installation (cached)
################################################################################
FROM base AS deps
RUN --mount=type=cache,id=pavement-npm-cache,target=/root/.npm \
  npm ci --include=dev && npm cache clean --force

################################################################################
# Source workspace with node_modules available
################################################################################
FROM base AS workspace
COPY --from=deps ${APP_HOME}/node_modules ./node_modules
COPY tsconfig*.json ./
COPY vitest.config.ts vite.config.ts playwright.config.ts playwright.preview.config.ts ./
COPY tailwind.config.ts postcss.config.js prettier.config.cjs eslint.config.js ./
COPY capacitor.config.ts ./capacitor.config.ts
COPY public ./public
COPY src ./src
COPY tests ./tests
COPY e2e ./e2e
COPY scripts ./scripts
COPY supabase ./supabase
COPY config ./config
COPY README.md ./README.md
COPY .env.example ./.env.example

################################################################################
# Tooling stage (used by docker compose for migrations/seeds)
################################################################################
FROM workspace AS tooling
ENV NODE_ENV=development \
    APP_ENV=development \
    PORT=8080 \
    VITE_DEV_SERVER_PORT=8080

################################################################################
# Quality gates (lint, typecheck, unit tests, env validation)
################################################################################
FROM tooling AS quality
RUN cp .env.example .env \
  && npm run check:env -- --strict \
  && npm run lint \
  && npm run typecheck \
  && npm run test:unit -- --run \
  && npm run format:check \
  && touch /tmp/quality-passed

################################################################################
# Production build
################################################################################
FROM workspace AS build
ARG VITE_APP_VERSION=local-dev
ARG VITE_BASE_PATH=./
ARG VITE_BASE_NAME=/
ARG VITE_ENVIRONMENT=production
ENV NODE_ENV=production \
    VITE_APP_VERSION=${VITE_APP_VERSION} \
    VITE_BASE_PATH=${VITE_BASE_PATH} \
    VITE_BASE_NAME=${VITE_BASE_NAME} \
    VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
RUN cp .env.example .env \
  && npm run build -- --base ${VITE_BASE_PATH:-./} \
  && npm prune --omit=dev

################################################################################
# Dev server (used by docker compose for hot reload)
################################################################################
FROM workspace AS devserver
ENV NODE_ENV=development \
    PORT=8080 \
    VITE_DEV_SERVER_PORT=8080 \
    VITE_BASE_PATH=/ \
    VITE_BASE_NAME=/ \
    VITE_ENVIRONMENT=development
EXPOSE 8080
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "8080"]

################################################################################
# Final runtime image
################################################################################
FROM nginx:1.27-alpine AS runtime
ARG VITE_APP_VERSION=local-dev
LABEL org.opencontainers.image.title="Pavement Performance Suite" \
  org.opencontainers.image.description="Production-ready build of the Pavement Performance Suite web experience" \
  org.opencontainers.image.version="${VITE_APP_VERSION:-local-dev}"
RUN apk add --no-cache curl
COPY --from=quality /tmp/quality-passed /quality/quality-passed
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
