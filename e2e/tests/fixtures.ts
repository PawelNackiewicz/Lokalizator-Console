import { test as base, expect, type Page } from '@playwright/test';

export const API_URL = process.env.VITE_API_URL ?? 'http://localhost:3000';

export const ADMIN = {
  username: process.env.SEED_ADMIN_USER ?? 'admin',
  password: process.env.SEED_ADMIN_PASSWORD ?? 'admin',
};

export async function loginViaApi(page: Page): Promise<void> {
  // The cookie is scoped to the host, not the port, so the web app on :5173 sees it too.
  const response = await page.request.post(`${API_URL}/auth/login`, { data: ADMIN });
  expect(response.status(), 'seeded admin must be able to log in').toBe(200);
}

// Map tiles come from openstreetmap.org: an external dependency that would make
// the suite flaky and slow, and nothing here asserts on the tile images.
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.route('**://*.tile.openstreetmap.org/**', (route) => route.fulfill({ status: 204 }));
    await use(page);
  },
});

export { expect };
