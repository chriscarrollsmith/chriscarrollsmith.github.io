import { test, expect } from '@playwright/test';
import type { ConsoleMessage } from '@playwright/test';

/**
 * Console Error and Warning Tests
 *
 * Tests that pages render without console errors or warnings.
 * This helps catch:
 * - JavaScript errors
 * - React warnings
 * - Missing resources
 * - Invalid HTML/CSS
 * - Third-party script issues
 */

interface ConsoleLog {
  type: string;
  text: string;
  url: string;
}

test.describe('Console Errors and Warnings', () => {
  const pagesToTest = [
    { url: '/', name: 'Home page' },
    { url: '/blog', name: 'Blog page' },
  ];

  // Filter function to ignore known acceptable console messages
  const shouldIgnoreMessage = (msg: ConsoleMessage): boolean => {
    const text = msg.text();

    // Ignore certain known/acceptable messages here if needed
    // Example: if (text.includes('Download the React DevTools')) return true;

    return false;
  };

  for (const page of pagesToTest) {
    test(`${page.name} should not have console errors or warnings`, async ({ page: playwrightPage }) => {
      const consoleMessages: ConsoleLog[] = [];
      const pageErrors: string[] = [];

      // Listen for console messages
      playwrightPage.on('console', (msg: ConsoleMessage) => {
        // Skip if this is an ignorable message
        if (shouldIgnoreMessage(msg)) {
          return;
        }

        const type = msg.type();

        // Only collect errors and warnings
        if (type === 'error' || type === 'warning') {
          consoleMessages.push({
            type,
            text: msg.text(),
            url: playwrightPage.url(),
          });
        }
      });

      // Listen for uncaught page errors
      playwrightPage.on('pageerror', (error: Error) => {
        pageErrors.push(`${error.name}: ${error.message}\n${error.stack}`);
      });

      // Navigate to the page
      await playwrightPage.goto(page.url);

      // Wait for page to be fully loaded
      await playwrightPage.waitForLoadState('networkidle');

      // Give any async operations a moment to complete
      await playwrightPage.waitForTimeout(1000);

      // Build error message if there were issues
      let errorMessage = '';

      if (consoleMessages.length > 0) {
        errorMessage += `\n\nConsole messages found on ${page.name}:\n`;
        consoleMessages.forEach((log, index) => {
          errorMessage += `\n${index + 1}. [${log.type.toUpperCase()}] ${log.text}`;
        });
      }

      if (pageErrors.length > 0) {
        errorMessage += `\n\nPage errors found on ${page.name}:\n`;
        pageErrors.forEach((error, index) => {
          errorMessage += `\n${index + 1}. ${error}`;
        });
      }

      // Assert no errors or warnings were found
      expect(consoleMessages, errorMessage).toHaveLength(0);
      expect(pageErrors, errorMessage).toHaveLength(0);
    });
  }

  test('should not have console errors when navigating between sections', async ({ page }) => {
    const consoleMessages: ConsoleLog[] = [];

    // Listen for console messages
    page.on('console', (msg: ConsoleMessage) => {
      if (shouldIgnoreMessage(msg)) {
        return;
      }

      const type = msg.type();
      if (type === 'error' || type === 'warning') {
        consoleMessages.push({
          type,
          text: msg.text(),
          url: page.url(),
        });
      }
    });

    // Navigate to home
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click through various sections
    const sections = ['#about', '#projects', '#writing', '#events'];

    for (const section of sections) {
      const link = page.locator(`#header a[href="${section}"]`);
      if (await link.count() > 0) {
        await link.click();
        await page.waitForTimeout(500); // Give time for any console messages
      }
    }

    // Navigate to blog
    await page.goto('/blog');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(500);

    // Build error message if there were issues
    let errorMessage = '';
    if (consoleMessages.length > 0) {
      errorMessage += '\n\nConsole messages found during navigation:\n';
      consoleMessages.forEach((log, index) => {
        errorMessage += `\n${index + 1}. [${log.type.toUpperCase()}] at ${log.url}\n   ${log.text}`;
      });
    }

    // Assert no errors or warnings were found
    expect(consoleMessages, errorMessage).toHaveLength(0);
  });
});
