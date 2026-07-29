import { test, expect } from '@playwright/test';

test.describe('Syndicated blog posts', () => {
  test('thin syndicated posts are noindex,follow', async ({ page }) => {
    await page.goto('/blog/youtube-lqnbpqipc2a');
    const robots = page.locator('head meta[name="robots"]');
    await expect(robots).toHaveAttribute('content', 'noindex,follow');
  });

  test('indexable syndicated posts are eligible for indexing', async ({ page }) => {
    await page.goto('/blog/shipping-a-multiplayer-game-with-cursor');
    await expect(page.locator('head meta[name="robots"][content="noindex,follow"]')).toHaveCount(0);

    const jsonLd = await page.locator('script[type="application/ld+json"]').first().textContent();
    expect(jsonLd).toBeTruthy();
    const data = JSON.parse(jsonLd!);
    expect(data['@type']).toBe('BlogPosting');
    expect(data.video).toMatchObject({
      '@type': 'VideoObject',
      contentUrl: 'https://www.youtube.com/watch?v=bQl3iidMn7Q',
      embedUrl: 'https://www.youtube.com/embed/bQl3iidMn7Q',
    });
  });
});
