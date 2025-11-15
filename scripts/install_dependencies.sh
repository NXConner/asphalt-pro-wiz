#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Install project dependencies, prepare git hooks, and provision optional tooling.

Usage: scripts/install_dependencies.sh [--skip-playwright] [--skip-husky]

Flags:
  --skip-playwright   Do not download Playwright browsers (useful for CI containers)
  --skip-husky        Skip Husky git hook installation
USAGE
}

SKIP_PLAYWRIGHT=false
SKIP_HUSKY=false

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
