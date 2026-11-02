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

  test('search narrows the list, counter and markers, and clearing restores them', async ({
    page,
  }) => {
    const options = page.getByRole('listbox', { name: 'Lista szkół' }).getByRole('option');
    await expect(options.first()).toBeVisible();
    const total = await options.count();

    const search = page.getByLabel('Szukaj szkoły');
    await search.fill('SZKOLA podstawowa');

    await expect(options.first()).toBeVisible();
    const filtered = await options.count();
    expect(filtered).toBeGreaterThan(0);
    expect(filtered).toBeLessThan(total);
    await expect(options.getByText(/Szkoła Podstawowa/)).toHaveCount(filtered);
    await expect(page.getByText(`${filtered} placówek na mapie Polski`)).toBeVisible();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(filtered);

    await search.clear();
    await expect(options).toHaveCount(total);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(total);
  });

  test('search shows an empty state when nothing matches', async ({ page }) => {
    await page.getByLabel('Szukaj szkoły').fill('zzzzzz');

    await expect(page.getByText('Brak szkół pasujących do wyszukiwania')).toBeVisible();
    await expect(page.getByRole('option')).toHaveCount(0);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(0);
    await expect(page.getByText('0 placówek na mapie Polski')).toBeVisible();
  });

  test('selecting a school in the list highlights it and opens its map popup', async ({ page }) => {
    const option = page.getByRole('option').nth(1);
    const name = await option.locator('span').first().innerText();

    await option.click();

    await expect(option).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.leaflet-popup')).toContainText(name);
  });
});
