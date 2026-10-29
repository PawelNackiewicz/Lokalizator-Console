import { fileURLToPath } from 'node:url';

import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';

const repoRoot = fileURLToPath(new URL('..', import.meta.url));
loadEnv({ path: `${repoRoot}/.env`, quiet: true });

const apiUrl = process.env.VITE_API_URL ?? 'http://localhost:3000';
const webPort = process.env.WEB_PORT ?? '5173';
const webUrl = `http://localhost:${webPort}`;
const isCi = Boolean(process.env.CI);

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCi,
  retries: isCi ? 1 : 0,
  reporter: isCi ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: webUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  // Runs the production builds, not the dev servers — `pnpm test:e2e` builds first.
  // Locally a running `pnpm dev` is reused instead.
  webServer: [
    {
      command: 'pnpm --filter @lokalizator/api start',
      cwd: repoRoot,
      url: `${apiUrl}/health`,
      reuseExistingServer: !isCi,
      timeout: 60_000,
    },
    {
      // WEB_ORIGIN (CORS) is exact, so preview must serve on the same port as dev.
      command: `pnpm --filter @lokalizator/web preview --port ${webPort} --strictPort`,
      cwd: repoRoot,
      url: webUrl,
      reuseExistingServer: !isCi,
      timeout: 60_000,
    },
  ],
});
