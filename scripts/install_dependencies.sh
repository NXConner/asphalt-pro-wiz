#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Install project dependencies, prepare git hooks, and provision optional tooling.

Usage: scripts/install_dependencies.sh [--skip-playwright]

Flags:
  --skip-playwright   Do not download Playwright browsers (useful for CI containers)
USAGE
}

SKIP_PLAYWRIGHT=false
for arg in "$@"; do
  case "$arg" in
    --help|-h)
      usage
      exit 0
      ;;
    --skip-playwright)
      SKIP_PLAYWRIGHT=true
      shift
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      usage
      exit 1
      ;;
  esac
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

echo "Preparing Husky git hooks..."
npm run prepare >/dev/null 2>&1 || true

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

echo "Dependencies installed and developer tooling prepared."
