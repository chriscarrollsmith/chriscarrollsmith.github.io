import { test, expect } from '@playwright/test';

test.describe('Custom 404 page', () => {
  test('unknown routes serve the custom not-found page', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist', { waitUntil: 'domcontentloaded' });
    expect(response).not.toBeNull();

    const main = page.locator('main');
    await expect(main.locator('h1')).toContainText(/page not found/i);
    await expect(main.locator('a[href="/"]')).toBeVisible();
    await expect(main.locator('a[href="/blog"]')).toBeVisible();
    await expect(main.locator('a[href="/cv"]')).toBeVisible();

    const robots = page.locator('head meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex,follow');
  });

  test('fills the viewport and keeps the footer at the bottom', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/this-page-does-not-exist', { waitUntil: 'domcontentloaded' });

    const layout = await page.evaluate(() => {
      const app = document.querySelector('.not-found-page');
      const footer = document.querySelector('#footer');
      if (!app || !footer) return null;
      const appBox = app.getBoundingClientRect();
      const footerBox = footer.getBoundingClientRect();
      return {
        appHeight: appBox.height,
        viewportHeight: window.innerHeight,
        footerBottom: footerBox.bottom,
      };
    });

    expect(layout).not.toBeNull();
    expect(layout!.appHeight).toBeGreaterThanOrEqual(layout!.viewportHeight - 1);
    expect(layout!.footerBottom).toBeGreaterThanOrEqual(layout!.viewportHeight - 1);
  });
});
