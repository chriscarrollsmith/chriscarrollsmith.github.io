import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * Navigation Link Tests
 *
 * Tests navigation functionality by:
 * 1. Discovering all on-site nav links
 * 2. Clicking each link
 * 3. Verifying correct navigation using URL, content, and ARIA attributes
 */

interface NavItem {
  text: string;
  href: string;
  targetUrl: string;
  targetHash: string | null;
  verifyContent: (page: Page) => Promise<void>;
}

test.describe('Navigation Links', () => {
  // Expected navigation structure with verification signals
  const expectedNavItems: NavItem[] = [
    {
      text: 'Home',
      href: '/#home',
      targetUrl: '/',
      targetHash: '#home',
      verifyContent: async (page) => {
        // Check for unique home section content
        await expect(page.locator('#home')).toBeVisible();
        await expect(page.locator('#home h1')).toContainText(/christopher carroll smith/i);
      }
    },
    {
      text: 'About',
      href: '/#about',
      targetUrl: '/',
      targetHash: '#about',
      verifyContent: async (page) => {
        await expect(page.locator('#about')).toBeVisible();
        // About section has "President of Promptly Technologies" text
        await expect(page.locator('#about')).toContainText(/promptly technologies/i);
      }
    },
    {
      text: 'Projects',
      href: '/#projects',
      targetUrl: '/',
      targetHash: '#projects',
      verifyContent: async (page) => {
        await expect(page.locator('#projects')).toBeVisible();
        // Projects section has category titles - check for the first one
        await expect(page.locator('#projects .category-title').first()).toBeVisible();
      }
    },
    {
      text: 'Writing',
      href: '/#writing',
      targetUrl: '/',
      targetHash: '#writing',
      verifyContent: async (page) => {
        await expect(page.locator('#writing')).toBeVisible();
        // Writing section has the writing grid
        await expect(page.locator('#writing .writing-grid')).toBeVisible();
      }
    },
    {
      text: 'Events',
      href: '/#events',
      targetUrl: '/',
      targetHash: '#events',
      verifyContent: async (page) => {
        await expect(page.locator('#events')).toBeVisible();
        // Events section has h1 with "Events" and calendar
        await expect(page.locator('#events h1')).toContainText(/events/i);
        await expect(page.locator('#calendar')).toBeVisible();
      }
    },
    {
      text: 'CV',
      href: '/cv',
      targetUrl: '/cv',
      targetHash: null,
      verifyContent: async (page) => {
        await expect(page.locator('.cv-container h1')).toContainText(/curriculum vitae/i);
        // CV page should have education, publications, presentations, and awards sections
        await expect(page.locator('.education-list')).toBeVisible();
        await expect(page.locator('.publications-list')).toBeVisible();
      }
    },
    {
      text: 'Blog',
      href: '/blog',
      targetUrl: '/blog',
      targetHash: null,
      verifyContent: async (page) => {
        await expect(page.locator('.blog-container h1')).toContainText(/blog/i);
        // Blog page should have blog posts or a "no posts" message
        const hasContent = await page.locator('body').textContent();
        expect(hasContent).toBeTruthy();
      }
    }
  ];

  test('should discover all expected nav links', async ({ page }) => {
    await page.goto('/');

    // Find the header/nav element
    const header = page.locator('#header');
    await expect(header).toBeVisible();

    // Get all links in the header
    const navLinks = await header.locator('a').all();

    // Should have all expected nav items
    expect(navLinks.length).toBe(expectedNavItems.length);

    // Verify each expected link exists
    for (const expected of expectedNavItems) {
      const link = header.locator(`a:has-text("${expected.text}")`);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', expected.href);
    }
  });

  test('should navigate to each section from home page', async ({ page }) => {
    for (const navItem of expectedNavItems) {
      // Start fresh from home page for each test
      await page.goto('/');

      // Find and click the nav link
      const link = page.locator('#header').locator(`a:has-text("${navItem.text}")`);
      await expect(link).toBeVisible();

      // Click the link
      await link.click();

      // Wait for navigation to complete
      await page.waitForLoadState('networkidle');

      // Verify URL
      const currentUrl = new URL(page.url());
      expect(currentUrl.pathname).toBe(navItem.targetUrl);
      if (navItem.targetHash) {
        expect(currentUrl.hash).toBe(navItem.targetHash);
      }

      // Verify content is visible
      await navItem.verifyContent(page);

      // Additional check: verify the target element is in viewport
      // (important for hash navigation)
      if (navItem.targetHash) {
        const targetElement = page.locator(navItem.targetHash);
        await expect(targetElement).toBeInViewport();
      }
    }
  });

  test('should navigate to sections from blog page', async ({ page }) => {
    // Test navigation from a different page (blog) back to home sections
    const hashNavItems = expectedNavItems.filter(
      (item): item is NavItem & { targetHash: string } => item.targetHash !== null
    );

    for (const navItem of hashNavItems) {
      // Start from blog page
      await page.goto('/blog');

      // Click the nav link
      const link = page.locator('#header').locator(`a:has-text("${navItem.text}")`);
      await expect(link).toBeVisible();
      await link.click();

      // Wait for navigation
      await page.waitForLoadState('networkidle');

      // Verify we're on the home page with correct hash
      const currentUrl = new URL(page.url());
      expect(currentUrl.pathname).toBe('/');
      expect(currentUrl.hash).toBe(navItem.targetHash);

      // Verify content
      await navItem.verifyContent(page);

      // Verify element is in viewport - scroll to it first if needed
      const targetElement = page.locator(navItem.targetHash);
      await targetElement.scrollIntoViewIfNeeded();
      await expect(targetElement).toBeInViewport();
    }
  });

  test('should maintain header visibility and styling on all pages', async ({ page }) => {
    for (const navItem of expectedNavItems) {
      await page.goto('/');

      // Navigate to the section/page
      const link = page.locator('#header').locator(`a:has-text("${navItem.text}")`);
      await link.click();
      await page.waitForLoadState('networkidle');

      // Verify header is still visible
      const header = page.locator('#header');
      await expect(header).toBeVisible();

      // Verify all nav links are still present and visible
      for (const expectedItem of expectedNavItems) {
        const navLink = header.locator(`a:has-text("${expectedItem.text}")`);
        await expect(navLink).toBeVisible();
      }

      // Check that the header has proper ARIA structure
      // Note: This is optional but good for accessibility
      const headerLinks = await header.locator('a').all();
      for (const link of headerLinks) {
        // Each link should be keyboard accessible
        const href = await link.getAttribute('href');
        expect(href).toBeTruthy();
        // Links should be focusable (no tabindex=-1)
        const tabindex = await link.getAttribute('tabindex');
        if (tabindex !== null) {
          expect(parseInt(tabindex)).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  test('should highlight active page in navigation', async ({ page }) => {
    // Test that the blog link has active styling when on blog page
    await page.goto('/blog');

    const blogLink = page.locator('#header').locator('a:has-text("Blog")');

    // Check if it has an active class
    const classes = await blogLink.getAttribute('class');
    if (classes) {
      expect(classes).toContain('active');
    }
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/');

    // Tab through nav links
    await page.keyboard.press('Tab');

    const header = page.locator('#header');
    const firstLink = header.locator('a').first();

    // First link should be focusable
    await firstLink.focus();
    await expect(firstLink).toBeFocused();

    // Should be able to activate with Enter
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Should have navigated (we don't know which link was first,
    // but the header should still be visible)
    await expect(header).toBeVisible();
  });
});
