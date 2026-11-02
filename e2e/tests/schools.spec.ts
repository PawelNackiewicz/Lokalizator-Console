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
    await expect(
      page.getByRole('listbox', { name: 'Lista szkół' }).getByRole('option'),
    ).toHaveCount(0);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(0);
    await expect(page.getByText('0 placówek na mapie Polski')).toBeVisible();
  });

  test('sorting reorders the list by name and by rating', async ({ page }) => {
    const options = page.getByRole('listbox', { name: 'Lista szkół' }).getByRole('option');
    await expect(options.first()).toBeVisible();
    const total = await options.count();

    const readNames = () => options.locator('span:first-child').allInnerTexts();
    const readRatings = async () =>
      (await options.allInnerTexts()).map((text) => {
        const line = text.split('\n').find((part) => /^\d,\d$/.test(part.trim()));
        return Number((line ?? '').trim().replace(',', '.'));
      });
    const collator = new Intl.Collator('pl');

    const ascending = await readNames();
    expect(ascending).toEqual([...ascending].sort((a, b) => collator.compare(a, b)));

    const sort = page.getByLabel('Sortuj według');
    await sort.selectOption({ label: 'Nazwa (Z–A)' });
    await expect.poll(readNames).toEqual([...ascending].reverse());

    await sort.selectOption({ label: 'Ocena (od najwyższej)' });
    await expect
      .poll(async () => {
        const ratings = await readRatings();
        return ratings.every((value, index) => index === 0 || (ratings[index - 1] ?? 0) >= value);
      })
      .toBe(true);

    await sort.selectOption({ label: 'Ocena (od najniższej)' });
    await expect
      .poll(async () => {
        const ratings = await readRatings();
        return ratings.every((value, index) => index === 0 || (ratings[index - 1] ?? 0) <= value);
      })
      .toBe(true);

    await expect(options).toHaveCount(total);
    await expect(page.getByText(`${total} placówek na mapie Polski`)).toBeVisible();
  });

  test('selecting a school in the list highlights it and opens its map popup', async ({ page }) => {
    const option = page.getByRole('listbox', { name: 'Lista szkół' }).getByRole('option').nth(1);
    const name = await option.locator('span').first().innerText();

    await option.click();

    await expect(option).toHaveAttribute('aria-selected', 'true');
    await expect(page.locator('.leaflet-popup')).toContainText(name);
  });
});
