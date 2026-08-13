import { test, expect } from '@playwright/test';

const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'small phone', width: 320, height: 568 },
];

const BLOG_PAGES = [
  '/blog',
  '/blog/xor-encryption',
  '/blog/understanding-mutable-default',
  '/blog/finding-your-digital-twin-in-latent-space',
  '/blog/knowledge-workers-guide',
  '/blog/creating-beautiful-shader-art-with',
];

test.describe('Blog pages do not overflow horizontally on mobile', () => {
  for (const viewport of MOBILE_VIEWPORTS) {
    for (const url of BLOG_PAGES) {
      test(`${url} fits ${viewport.name} (${viewport.width}px) without horizontal scroll`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await page.goto(url, { waitUntil: 'networkidle' });

        const layout = await page.evaluate(() => {
          const clientWidth = document.documentElement.clientWidth;
          const overflowing = [...document.querySelectorAll('body *')]
            .map((el) => {
              const rect = el.getBoundingClientRect();
              return {
                right: rect.right,
                width: rect.width,
              };
            })
            .filter((rect) => rect.right > clientWidth + 1 || rect.width > clientWidth + 1);

          return {
            clientWidth,
            scrollWidth: document.documentElement.scrollWidth,
            bodyScrollWidth: document.body.scrollWidth,
            overflowingCount: overflowing.length,
          };
        });

        expect(
          layout.scrollWidth,
          `${url} document scrollWidth (${layout.scrollWidth}) should not exceed viewport (${layout.clientWidth})`,
        ).toBeLessThanOrEqual(layout.clientWidth + 1);
        expect(
          layout.bodyScrollWidth,
          `${url} body scrollWidth (${layout.bodyScrollWidth}) should not exceed viewport (${layout.clientWidth})`,
        ).toBeLessThanOrEqual(layout.clientWidth + 1);
        expect(
          layout.overflowingCount,
          `${url} should not have elements wider than the viewport`,
        ).toBe(0);
      });
    }
  }
});
