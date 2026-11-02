import { ADMIN, expect, loginViaApi, test } from './fixtures';

test.describe('authentication', () => {
  test('logs in with valid credentials and lands on the schools page', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Login').fill(ADMIN.username);
    await page.getByLabel('Hasło').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page).toHaveURL(/\/schools$/);
    await expect(page.getByRole('banner')).toContainText(ADMIN.username);
  });

  test('shows an error for a wrong password and stays on the login page', async ({ page }) => {
    await page.goto('/login');

    await page.getByLabel('Login').fill(ADMIN.username);
    await page.getByLabel('Hasło').fill('definitely-not-the-password');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByRole('alert')).toContainText('Nieprawidłowy login lub hasło');
    await expect(page).toHaveURL(/\/login/);
  });

  test('validates empty fields on the client without calling the API', async ({ page }) => {
    let loginRequests = 0;
    page.on('request', (request) => {
      if (request.url().endsWith('/auth/login')) loginRequests++;
    });

    await page.goto('/login');
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page.getByText('Login jest wymagany')).toBeVisible();
    await expect(page.getByText('Hasło jest wymagane')).toBeVisible();
    expect(loginRequests).toBe(0);
  });

  test('redirects an anonymous visitor to login and back after signing in', async ({ page }) => {
    await page.goto('/schools');

    await expect(page).toHaveURL(/\/login\?redirect=/);

    await page.getByLabel('Login').fill(ADMIN.username);
    await page.getByLabel('Hasło').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Zaloguj się' }).click();

    await expect(page).toHaveURL(/\/schools$/);
  });

  test('logout clears the session', async ({ page }) => {
    await loginViaApi(page);
    await page.goto('/schools');

    await page.getByRole('button', { name: 'Wyloguj' }).click();
    await expect(page).toHaveURL(/\/login/);

    await page.goto('/schools');
    await expect(page).toHaveURL(/\/login\?redirect=/);
  });
});
