import { defineConfig } from '@playwright/test';

import baseConfig from './playwright.config';

export default defineConfig({
  ...baseConfig,
  testMatch: /preview-smoke\.spec\.ts$/,
  use: {
    ...baseConfig.use,
    baseURL: 'http://localhost:4173',
  },
  webServer: {
    command: 'npm run preview -- --host --port 4173',
    url: 'http://localhost:4173/',
    reuseExistingServer: !process.env.CI,
    env: {
      ...process.env,
      VITE_LOVABLE_BASE_PATH: '/preview/smoke',
      SECRET_PROVIDER: 'env',
    },
    stdout: 'pipe',
    stderr: 'pipe',
    timeout: 120_000,
  },
});
