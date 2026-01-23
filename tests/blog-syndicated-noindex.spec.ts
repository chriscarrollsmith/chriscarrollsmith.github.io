import { test, expect } from '@playwright/test';

test.describe('Syndicated blog posts', () => {
  test('syndicated posts are noindex,follow', async ({ page }) => {
    await page.goto('/blog/youtube-lqnbpqipc2a');
    const robots = page.locator('head meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex,follow');
  });
});

