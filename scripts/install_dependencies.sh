#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Install project dependencies, verify the toolchain, and prime developer automation.

Usage: scripts/install_dependencies.sh [--skip-playwright] [--skip-husky] [--skip-env-check] [--strict-env]

Flags:
  --skip-playwright   Do not download Playwright browsers (useful for CI containers)
  --skip-husky        Skip Husky git hook installation
  --skip-env-check    Skip running npm run check:env (not recommended)
  --strict-env        Run check:env with --strict to enforce completeness
USAGE
}

SKIP_PLAYWRIGHT=false
SKIP_HUSKY=false
SKIP_ENV_CHECK=false
STRICT_ENV=false

while [ $# -gt 0 ]; do
    case "$1" in
    --help|-h)
      usage
      exit 0
      ;;
    --skip-playwright)
      SKIP_PLAYWRIGHT=true
      ;;
    --skip-husky)
      SKIP_HUSKY=true
      ;;
      --skip-env-check)
        SKIP_ENV_CHECK=true
        ;;
      --strict-env)
        STRICT_ENV=true
        ;;
    *)
      echo "Unknown argument: $1" >&2
      usage
      exit 1
      ;;
  esac
  shift
done

if ! command -v node >/dev/null 2>&1; then
  echo "Node.js is required but was not found on PATH." >&2
  exit 2
fi

NODE_VERSION=$(node --version | sed 's/^v//')
NODE_MAJOR=${NODE_VERSION%%.*}
if [ "${NODE_MAJOR}" -lt 18 ]; then
  echo "Node.js >= 18 is required. Current: v${NODE_VERSION}" >&2
  exit 3
fi

echo "Installing npm packages..."
if [ -f package-lock.json ]; then
  npm ci --include=dev
else
  npm install --include=dev
fi

if ! $SKIP_HUSKY; then
  echo "Preparing Husky git hooks..."
  npm run prepare >/dev/null 2>&1 || true
else
  echo "Skipping Husky git hook installation."
fi

echo "Syncing lint-staged cache..."
npx --yes lint-staged --version >/dev/null 2>&1 || true

if [ ! -f .env ] && [ -f .env.example ]; then
  echo "Hydrating .env from .env.example (edit this file with real secrets)..."
  cp .env.example .env
fi

if ! $SKIP_ENV_CHECK; then
  echo "Validating environment configuration..."
  ENV_ARGS=()
  if $STRICT_ENV; then
    ENV_ARGS+=(--strict)
  fi
  if [ "${#ENV_ARGS[@]}" -eq 0 ]; then
    npm run check:env
  else
    npm run check:env -- "${ENV_ARGS[@]}"
  fi
else
  echo "Skipping environment validation."
fi

if ! $SKIP_PLAYWRIGHT; then
  if npx --yes playwright --version >/dev/null 2>&1; then
    echo "Installing Playwright browsers..."
    npx --yes playwright install --with-deps >/dev/null 2>&1 || true
  fi
else
  echo "Skipping Playwright browser installation."
fi

if command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI detected: $(supabase --version 2>/dev/null | head -n1)"
else
  echo "Supabase CLI not found. Install via 'npm install -g supabase' or follow docs/UNIFIED_SUPABASE_GUIDE.md"
fi

echo "Dependencies installed and developer tooling prepared."
