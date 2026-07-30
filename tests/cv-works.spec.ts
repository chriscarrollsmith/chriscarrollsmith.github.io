import { test, expect } from '@playwright/test';

test.describe('CV works browser', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cv');
    await page.locator('.cv-works-browser').waitFor({ state: 'visible' });
  });

  test('filters works by search query', async ({ page }) => {
    const search = page.getByRole('searchbox', {
      name: /search publications and presentations/i,
    });
    await search.fill('Anti-Islamic');

    await expect(page.locator('.cv-works-count')).toContainText('Showing 2 of');
    await expect(page.locator('.publication-entry')).toHaveCount(1);
    await expect(page.locator('.presentation-entry')).toHaveCount(1);
    await expect(page.locator('.publication-formatted')).toContainText('Anti-Islamic');
  });

  test('filters works by year facet', async ({ page }) => {
    const yearFacet = page.locator('details.cv-works-facet', { hasText: 'Year' });
    const typeFacet = page.locator('details.cv-works-facet', { hasText: 'Type' });
    const yearSummary = yearFacet.locator('summary');
    const typeSummary = typeFacet.locator('summary');

    await page.locator('.cv-works-toolbar').scrollIntoViewIfNeeded();
    const yearBefore = await yearSummary.boundingBox();
    const typeBefore = await typeSummary.boundingBox();
    expect(yearBefore).toBeTruthy();
    expect(typeBefore).toBeTruthy();
    // Year and Type share a row before opening.
    expect(Math.abs(yearBefore!.y - typeBefore!.y)).toBeLessThan(4);

    await yearSummary.click();
    await expect(yearFacet).toHaveAttribute('open', '');
    await page.locator('label.cv-works-chip', { hasText: '2024' }).click();

    const yearAfter = await yearSummary.boundingBox();
    const typeAfter = await typeSummary.boundingBox();
    expect(yearAfter).toBeTruthy();
    expect(typeAfter).toBeTruthy();
    // Opening/selecting must not stretch Year to full width or push Type to a new row.
    expect(yearAfter!.width).toBeLessThan(160);
    expect(Math.abs(yearAfter!.y - typeAfter!.y)).toBeLessThan(4);
    expect(typeAfter!.x).toBeGreaterThan(yearAfter!.x);

    await expect(page.locator('.cv-works-count')).toContainText('Showing');
    const countText = await page.locator('.cv-works-count').innerText();
    const shown = Number(countText.match(/Showing (\d+)/)?.[1] ?? 0);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(65);

    await yearSummary.click();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('.cv-works-count')).toContainText('Showing 65 of 65');
  });

  test('closes year dropdown when clicking outside the menu', async ({ page }) => {
    const yearFacet = page.locator('details.cv-works-facet', { hasText: 'Year' });
    await yearFacet.locator('summary').click();
    await expect(yearFacet).toHaveAttribute('open', '');

    await page.locator('.cv-works-search input').click();
    await expect(yearFacet).not.toHaveAttribute('open', '');

    await yearFacet.locator('summary').click();
    await expect(yearFacet).toHaveAttribute('open', '');

    await page.locator('h2:text("Publications")').click();
    await expect(yearFacet).not.toHaveAttribute('open', '');
  });

  test('places search controls under the Publications heading', async ({ page }) => {
    const publicationsHeading = page.locator('.publications-list > h2');
    const toolbar = page.locator('.publications-list > .cv-works-toolbar');
    await expect(publicationsHeading).toBeVisible();
    await expect(toolbar).toBeVisible();

    const headingBox = await publicationsHeading.boundingBox();
    const toolbarBox = await toolbar.boundingBox();
    expect(headingBox).toBeTruthy();
    expect(toolbarBox).toBeTruthy();
    expect(toolbarBox!.y).toBeGreaterThan(headingBox!.y);
  });

  test('toggles compact density', async ({ page }) => {
    const browser = page.locator('.cv-works-browser');
    await expect(browser).toHaveClass(/density-comfortable/);

    await page.getByRole('button', { name: 'Compact' }).click();
    await expect(browser).toHaveClass(/density-compact/);
    await expect(page.getByRole('button', { name: 'Compact' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('copies APA citation from the cite menu', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);

    const firstEntry = page.locator('.publication-entry').first();
    await firstEntry.getByRole('button', { name: /Cite/ }).click();
    await page.getByRole('menuitem', { name: 'Copy APA' }).click();
    await expect(firstEntry.locator('.citation-copy-status')).toContainText('Copied APA');

    await expect
      .poll(async () => page.evaluate(() => navigator.clipboard.readText()))
      .toMatch(/\(20\d{2}\)/);
  });
});

