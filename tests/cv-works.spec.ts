import { test, expect } from '@playwright/test';

test.describe('CV works browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv');
    await page.locator('.cv-works-browser').waitFor({ state: 'visible' });
  });

  test('filters works by search query', async ({ page }) => {
    const search = page.getByRole('searchbox', {
      name: /search publications and presentations/i,
    });
    await search.fill('Anti-Islamic');

    await expect(page.locator('.cv-works-count')).toContainText('Showing 1 of');
    await expect(page.locator('.publication-entry')).toHaveCount(1);
    await expect(page.locator('.publication-formatted')).toContainText('Anti-Islamic');
  });

  test('filters works by year facet', async ({ page }) => {
    await page.locator('details.cv-works-facet', { hasText: 'Year' }).locator('summary').click();
    await page.locator('label.cv-works-chip', { hasText: '2024' }).click();

    await expect(page.locator('.cv-works-count')).toContainText('Showing');
    const countText = await page.locator('.cv-works-count').innerText();
    const shown = Number(countText.match(/Showing (\d+)/)?.[1] ?? 0);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(65);

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('.cv-works-count')).toContainText('Showing 65 of 65');
  });

  test('toggles compact density', async ({ page }) => {
    const browser = page.locator('.cv-works-browser');
    await expect(browser).toHaveClass(/density-comfortable/);

    await page.getByRole('button', { name: 'Compact' }).click();
    await expect(browser).toHaveClass(/density-compact/);
    await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('copies APA citation from the cite menu', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const firstEntry = page.locator('.publication-entry').first();
    await firstEntry.getByRole('button', { name: /Cite/ }).click();
    await page.getByRole('menuitem', { name: 'Copy APA' }).click();

    const clipboard = await page.evaluate(() => navigator.clipboard.readText());
    expect(clipboard.length).toBeGreaterThan(20);
    expect(clipboard).toMatch(/\(20\d{2}\)/);
  });
});
