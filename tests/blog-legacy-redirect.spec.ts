import { test, expect } from '@playwright/test';

test.describe('Blog legacy numeric ID behavior', () => {
  test('legacy numeric blog id emits redirect metadata to canonical slug', async ({ page }) => {
    // Assert metadata by fetching the raw HTML. A browser navigation may follow the meta refresh
    // quickly enough that the DOM is already on the canonical slug page.
    const response = await page.request.get('/blog/1');
    expect(response.ok()).toBeTruthy();
    const html = await response.text();

    expect(html).toContain('rel="canonical"');
    expect(html).toContain('https://christophercarrollsmith.com/blog/xor-encryption');
    expect(html).toContain('http-equiv="refresh"');
    expect(html).toContain('0; url=/blog/xor-encryption');
    expect(html).toContain('name="robots"');
    expect(html).toContain('noindex,follow');
    expect(html).toContain('Redirecting');

    // Assert user-visible behavior: visiting the legacy URL lands on the canonical slug.
    await page.goto('/blog/1', { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**/blog/xor-encryption', { timeout: 10000 });
  });

  test('canonical slug page does not emit redirect metadata', async ({ page }) => {
    await page.goto('/blog/xor-encryption');

    await expect(page.locator('head meta[http-equiv="refresh"]')).toHaveCount(0);
    await expect(page.locator('head meta[name="robots"][content="noindex,follow"]')).toHaveCount(0);
  });
});

