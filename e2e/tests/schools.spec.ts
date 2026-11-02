import { expect, loginViaApi, test } from './fixtures';

test.describe('schools', () => {
  test.beforeEach(async ({ page }) => {
    await loginViaApi(page);
    await page.goto('/schools');
  });

  test('renders every school both in the list and as a map marker', async ({ page }) => {
    const options = page.getByRole('listbox', { name: 'Lista szkół' }).getByRole('option');
    await expect(options.first()).toBeVisible();

    const count = await options.count();
    expect(count).toBeGreaterThan(0);

    await expect(page.getByText(`${count} placówek na mapie Polski`)).toBeVisible();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(count);
  });

  test('selecting a school in the list highlights it and opens its map popup', async ({ page }) => {
    const option = page.getByRole('option').nth(1);
    const name = await option.locator('span').first().innerText();

    await option.click();

    await expect(option).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.leaflet-popup')).toContainText(name);
  });
});
