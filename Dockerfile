# syntax=docker/dockerfile:1.7-labs

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS base
WORKDIR /app
ENV CI=1 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    npm_config_loglevel=notice
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=pavement-npm-cache,target=/root/.npm \
  npm ci --include=dev && npm cache clean --force

FROM base AS sources
ENV NODE_ENV=development
COPY tsconfig*.json ./
COPY vitest.config.ts vite.config.ts playwright.config.ts ./
COPY src ./src
COPY public ./public
COPY scripts ./scripts
COPY supabase ./supabase
COPY tests ./tests

FROM sources AS tooling
ENV NODE_ENV=development \
    APP_ENV=development \
    VITE_ENVIRONMENT=development \
    VITE_APP_VERSION=local-dev \
    VITE_BASE_PATH=./ \
    VITE_BASE_NAME=/ \
    VITE_BASE_URL=http://localhost:8080 \
    VITE_SUPABASE_URL=https://example.supabase.co \
    VITE_SUPABASE_PUBLISHABLE_KEY=dummy-supabase-key \
    SUPABASE_URL=https://example.supabase.co \
    SUPABASE_ANON_KEY=dummy-supabase-key \
    SUPABASE_PROJECT_REF=example-ref \
    SUPABASE_SERVICE_ROLE_KEY=dummy-service-role-key \
    DATABASE_URL=postgres://postgres:postgres@db:5432/pavement \
    VITE_LOG_BEACON_URL=http://localhost:4000/beacon \
    VITE_GEMINI_PROXY_URL=https://example.supabase.co/functions/v1/gemini-proxy \
    GEMINI_API_KEY=dummy-gemini-key \
    VITE_GOOGLE_MAPS_API_KEY=dummy-maps-key \
    VITE_FLAG_COMMANDCENTER=1 \
    VITE_FLAG_OBSERVABILITY=1 \
    VITE_FLAG_PWA=1

FROM tooling AS quality
RUN npm run check:env -- --strict \
  && npm run lint \
  && npm run typecheck \
  && npm run test:unit -- --run

FROM sources AS build
ARG VITE_APP_VERSION=local-dev
ARG VITE_BASE_PATH=./
ARG VITE_BASE_NAME=/
ARG VITE_ENVIRONMENT=production
ENV NODE_ENV=production \
    VITE_APP_VERSION=${VITE_APP_VERSION} \
    VITE_BASE_PATH=${VITE_BASE_PATH} \
    VITE_BASE_NAME=${VITE_BASE_NAME} \
    VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
RUN npm run build -- --base ${VITE_BASE_PATH:-./} \
  && npm prune --omit=dev

FROM nginx:1.27-alpine AS runtime
ARG VITE_APP_VERSION=local-dev
LABEL org.opencontainers.image.title="Pavement Performance Suite" \
  org.opencontainers.image.description="Production-ready build of the Pavement Performance Suite web experience" \
  org.opencontainers.image.version="${VITE_APP_VERSION:-local-dev}"
RUN apk add --no-cache curl
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 CMD curl -f http://127.0.0.1/ || exit 1
CMD ["nginx", "-g", "daemon off;"]
