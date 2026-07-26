import { test, expect } from '@playwright/test';

test.describe('Custom 404 page', () => {
  test('unknown routes serve the custom not-found page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist', { waitUntil: 'domcontentloaded' });
    expect(response).not.toBeNull();

    await expect(page.locator('h1')).toContainText(/page not found/i);
    await expect(page.locator('a[href="/"]')).toBeVisible();
    await expect(page.locator('a[href="/blog"]')).toBeVisible();
    await expect(page.locator('a[href="/cv"]')).toBeVisible();

    const robots = page.locator('head meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex,follow');
  });
});
