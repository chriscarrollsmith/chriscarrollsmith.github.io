import { test, expect } from '@playwright/test';

test.describe('Blog page meta', () => {
  test('long titles truncate on a word boundary without a forced description ellipsis', async ({ page }) => {
    const response = await page.request.get('/blog/comparing-the-two-best-ai-image-generators');
    expect(response.ok()).toBeTruthy();
    const html = await response.text();

    const title = html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '';
    expect(title).toContain(' | Christopher Carroll Smith');
    expect(title).not.toMatch(/Midjou[^.]/);
    expect(title).toMatch(/\.\.\. \| Christopher Carroll Smith$/);

    const description = html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '';
    expect(description.endsWith('...')).toBe(description.length >= 155);
  });
});
