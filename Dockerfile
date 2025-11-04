# syntax=docker/dockerfile:1.7-labs

ARG NODE_VERSION=22-alpine

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,id=pavement-npm-cache,target=/root/.npm \
  npm ci --include=dev && npm cache clean --force

FROM node:${NODE_VERSION} AS build
ARG VITE_APP_VERSION=local-dev
ARG VITE_BASE_PATH=/
ARG VITE_ENVIRONMENT=production
ENV NODE_ENV=production \
  VITE_APP_VERSION=${VITE_APP_VERSION} \
  VITE_BASE_PATH=${VITE_BASE_PATH} \
  VITE_ENVIRONMENT=${VITE_ENVIRONMENT}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build && npm prune --omit=dev

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
