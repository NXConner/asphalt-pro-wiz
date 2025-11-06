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

FROM sources AS quality
RUN npm run lint \
  && npm run typecheck \
  && npm run test:unit -- --run

FROM sources AS build
ARG VITE_APP_VERSION=local-dev
ARG VITE_BASE_PATH=/
ARG VITE_ENVIRONMENT=production
ENV NODE_ENV=production \
    VITE_APP_VERSION=${VITE_APP_VERSION} \
    VITE_BASE_PATH=${VITE_BASE_PATH} \
    VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
RUN npm run build -- --base ${VITE_BASE_PATH} \
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
