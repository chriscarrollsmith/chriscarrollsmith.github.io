import { test, expect } from '@playwright/test';

test.describe('Page heading visibility (not obscured by nav)', () => {
  const pages = [
    { url: '/blog', heading: 'Blog' },
    { url: '/cv', heading: 'Curriculum Vitae' },
  ];

  for (const { url, heading } of pages) {
    test(`${url} - heading is not behind nav on desktop`, async ({ page }) => {
      await page.goto(url);

      // Get the header (nav) bounding box
      const header = page.locator('#header');
      const headerBox = await header.boundingBox();
      expect(headerBox).not.toBeNull();

      // Get the h1 heading bounding box
      const h1 = page.locator('h1').filter({ hasText: heading });
      const h1Box = await h1.boundingBox();
      expect(h1Box).not.toBeNull();

      // The heading should not overlap with the header
      // Check that the top of the h1 is below the bottom of the header
      const headerBottom = headerBox!.y + headerBox!.height;
      const h1Top = h1Box!.y;

      expect(h1Top, `H1 top (${h1Top}) should be below header bottom (${headerBottom})`).toBeGreaterThanOrEqual(headerBottom);
    });

    test(`${url} - heading is not behind nav on mobile`, async ({ page }) => {
      // Set mobile viewport (iPhone SE dimensions)
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(url);

      // Get the header (nav) bounding box
      const header = page.locator('#header');
      const headerBox = await header.boundingBox();
      expect(headerBox).not.toBeNull();

      // Get the h1 heading bounding box
      const h1 = page.locator('h1').filter({ hasText: heading });
      const h1Box = await h1.boundingBox();
      expect(h1Box).not.toBeNull();

      // The heading should not overlap with the header
      // Check that the top of the h1 is below the bottom of the header
      const headerBottom = headerBox!.y + headerBox!.height;
      const h1Top = h1Box!.y;

      expect(h1Top, `H1 top (${h1Top}) should be below header bottom (${headerBottom}) on mobile`).toBeGreaterThanOrEqual(headerBottom);
    });

    test(`${url} - heading has adequate clearance below nav on mobile`, async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(url);

      // Get the header (nav) bounding box
      const header = page.locator('#header');
      const headerBox = await header.boundingBox();
      expect(headerBox).not.toBeNull();

      // Get the h1 heading bounding box
      const h1 = page.locator('h1').filter({ hasText: heading });
      const h1Box = await h1.boundingBox();
      expect(h1Box).not.toBeNull();

      // The heading should have at least 16px of clearance below the nav
      const headerBottom = headerBox!.y + headerBox!.height;
      const h1Top = h1Box!.y;
      const clearance = h1Top - headerBottom;

      expect(clearance, `H1 should have at least 16px clearance below nav, got ${clearance}px`).toBeGreaterThanOrEqual(16);
    });
  }
});
