#!/usr/bin/env bash
set -euo pipefail

if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

# Initialize Husky hooks
npm run prepare || true

# Install Playwright browsers for E2E if package present (idempotent)
if npx --yes playwright --version >/dev/null 2>&1; then
  npx --yes playwright install --with-deps || true
fi

echo "Dependencies installed and hooks prepared."
