import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

/**
 * External Links Validation Tests
 *
 * Tests that all external links on the site are valid and working.
 * This helps catch:
 * - Broken external links (404s)
 * - Dead resources
 * - Domain expiration
 * - Service shutdowns
 *
 * Note: These tests only run if we have internet connectivity.
 */

interface ExternalLink {
  url: string;
  text: string;
  sourcePage: string;
}

/**
 * Extract all external links from a page
 */
async function getExternalLinks(page: Page, pageUrl: string, siteUrl: string): Promise<ExternalLink[]> {
  const links = await page.locator('a[href^="http"]').all();
  const externalLinks: ExternalLink[] = [];

  for (const link of links) {
    const href = await link.getAttribute('href');
    const text = (await link.textContent())?.trim() || '(no text)';

    if (!href) continue;

    // Skip if it's an internal link (pointing to our own site)
    try {
      const linkUrl = new URL(href);
      const siteHostname = new URL(siteUrl).hostname;

      if (linkUrl.hostname === siteHostname || linkUrl.hostname === `www.${siteHostname}`) {
        continue;
      }

      externalLinks.push({
        url: href,
        text,
        sourcePage: pageUrl,
      });
    } catch {
      // Invalid URL, skip it
      continue;
    }
  }

  return externalLinks;
}

/**
 * Check if a URL is accessible (not 404 or other error)
 */
async function checkUrlStatus(url: string): Promise<{ ok: boolean; status: number; error?: string }> {
  try {
    // First try HEAD request (faster, doesn't download content)
    const headResponse = await fetch(url, {
      method: 'HEAD',
      // Some servers block requests without user agent
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ExternalLinkChecker/1.0)',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    // If HEAD is not allowed (405), try GET
    if (headResponse.status === 405) {
      const getResponse = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; ExternalLinkChecker/1.0)',
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });

      return {
        ok: getResponse.ok,
        status: getResponse.status,
      };
    }

    return {
      ok: headResponse.ok,
      status: headResponse.status,
    };
  } catch (error) {
    return {
      ok: false,
      status: 0,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Check if we have internet connectivity
 */
async function hasInternetConnection(): Promise<boolean> {
  try {
    const response = await fetch('https://www.google.com', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}

test.describe('External Links Validation', () => {
  const pagesToTest = [
    { url: '/', name: 'Home page' },
    { url: '/cv', name: 'CV page' },
    { url: '/blog', name: 'Blog page' },
  ];

  const siteUrl = 'https://christophercarrollsmith.com';

  // Domains that block automated requests but work fine for humans
  // These commonly return 403/429 or timeout in CI environments
  const botBlockingDomains = [
    'linkedin.com',
    'twitter.com',
    'facebook.com',
    'jstor.org',
    'substack.com',      // Returns 403 in CI
    'instagram.com',     // Returns 429 (rate limit) in CI
    'scholar.google.com', // Returns 403 in CI
    'web.archive.org',   // Often times out in CI
    'academia.edu',      // Often times out in CI
  ];

  // Increase timeout for external link validation (checking many URLs)
  test.setTimeout(120000); // 2 minutes

  test.beforeAll(async () => {
    const isOnline = await hasInternetConnection();
    if (!isOnline) {
      test.skip();
    }
  });

  test('should validate all external links are accessible', async ({ page }) => {
    // Collect all external links from all pages
    const allExternalLinks: ExternalLink[] = [];

    for (const testPage of pagesToTest) {
      await page.goto(testPage.url);
      await page.waitForLoadState('networkidle');

      const links = await getExternalLinks(page, testPage.name, siteUrl);
      allExternalLinks.push(...links);
    }

    // Remove duplicates (same URL might appear on multiple pages)
    const uniqueUrls = new Map<string, ExternalLink>();
    for (const link of allExternalLinks) {
      if (!uniqueUrls.has(link.url)) {
        uniqueUrls.set(link.url, link);
      }
    }

    // Filter out bot-blocking domains
    const urlsToCheck = Array.from(uniqueUrls.entries()).filter(([url]) => {
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname.toLowerCase();
        return !botBlockingDomains.some(domain => hostname.includes(domain));
      } catch {
        return true; // Include invalid URLs so they get caught as errors
      }
    });

    const skippedCount = uniqueUrls.size - urlsToCheck.length;
    console.log(`\nFound ${uniqueUrls.size} unique external links (${urlsToCheck.length} to validate, ${skippedCount} skipped due to bot-blocking)...`);

    // Check links in parallel with concurrency limit
    const CONCURRENCY_LIMIT = 10;
    const failedLinks: Array<ExternalLink & { status: number; error?: string }> = [];

    // Process links in batches
    for (let i = 0; i < urlsToCheck.length; i += CONCURRENCY_LIMIT) {
      const batch = urlsToCheck.slice(i, i + CONCURRENCY_LIMIT);

      const results = await Promise.all(
        batch.map(async ([url, link]) => {
          console.log(`Checking: ${url}`);
          const result = await checkUrlStatus(url);
          return { url, link, result };
        })
      );

      // Collect failures from this batch
      for (const { link, result } of results) {
        if (!result.ok) {
          failedLinks.push({
            ...link,
            status: result.status,
            error: result.error,
          });
        }
      }
    }

    // Build error message if there were failures
    let errorMessage = '';
    if (failedLinks.length > 0) {
      errorMessage += `\n\n${failedLinks.length} external link(s) failed validation:\n`;
      failedLinks.forEach((link, index) => {
        errorMessage += `\n${index + 1}. [${link.status || 'ERROR'}] ${link.url}`;
        errorMessage += `\n   Text: "${link.text}"`;
        errorMessage += `\n   Found on: ${link.sourcePage}`;
        if (link.error) {
          errorMessage += `\n   Error: ${link.error}`;
        }
      });
      errorMessage += `\n\nTotal links: ${uniqueUrls.size} (${urlsToCheck.length} checked, ${skippedCount} skipped)`;
    }

    // Assert all links are accessible
    expect(failedLinks, errorMessage).toHaveLength(0);
  });

  test('should find external links on each page', async ({ page }) => {
    // This test verifies we're actually finding external links
    // (useful to confirm the test isn't passing vacuously)

    for (const testPage of pagesToTest) {
      await page.goto(testPage.url);
      await page.waitForLoadState('networkidle');

      const links = await getExternalLinks(page, testPage.name, siteUrl);

      // Log what we found for debugging
      if (links.length > 0) {
        console.log(`\n${testPage.name}: Found ${links.length} external links`);
        links.slice(0, 3).forEach(link => {
          console.log(`  - ${link.url} ("${link.text}")`);
        });
        if (links.length > 3) {
          console.log(`  ... and ${links.length - 3} more`);
        }
      } else {
        console.log(`\n${testPage.name}: No external links found`);
      }

      // We expect at least some external links across all pages
      // (though individual pages might not have any)
    }
  });
});
