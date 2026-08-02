import { test, expect } from '@playwright/test';

test.describe('Projects work index', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#projects');
    await page.locator('#projects .projects-index').waitFor({ state: 'visible' });
  });

  test('defaults to highlighted projects with GitHub signals', async ({ page }) => {
    await expect(page.locator('#projects .category-title')).toHaveText(
      'Featured Open-Source Projects',
    );
    await expect(page.locator('.projects-row')).toHaveCount(4);
    await expect(page.locator('.projects-count')).toContainText('Showing 4 of 8');

    await expect(page.getByRole('button', { name: 'Python', exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'TypeScript', exact: true })).toHaveCount(0);

    const etielle = page.locator('.projects-row', { hasText: 'etielle' });
    await expect(etielle.locator('.projects-signal-language')).toContainText('Python');
    await expect(etielle.locator('.projects-signal').filter({ hasText: '★' })).toBeVisible();
    await expect(etielle.locator('.projects-signal').filter({ hasText: 'Updated' })).toBeVisible();

    await expect(page.locator('.projects-row', { hasText: 'taskqueue-mcp' })).toHaveCount(0);
    await expect(page.locator('.projects-row', { hasText: 'Promptly Technologies' })).toHaveCount(0);
  });

  test('filters by tag only', async ({ page }) => {
    const tagFacet = page.locator('details.projects-tag-facet');
    await tagFacet.locator('summary').click();
    await expect(tagFacet).toHaveAttribute('open', '');

    // Default is highlight; add python and clear highlight to broaden.
    await page.locator('label.projects-tag-option', { hasText: 'python' }).click();
    await page.locator('label.projects-tag-option', { hasText: 'highlight' }).click();
    await expect(page.locator('.projects-count')).toHaveText(/Showing [1-8] of 8/);
    await expect(page.locator('.projects-row').first()).toBeVisible();

    for (const row of await page.locator('.projects-row').all()) {
      await expect(row.locator('.projects-row-tags')).toContainText('python');
    }

    await page.getByRole('button', { name: 'Reset to highlights' }).click();
    await expect(page.locator('.projects-count')).toHaveText('Showing 4 of 8');
    await expect(page.locator('.projects-row')).toHaveCount(4);
    await expect(tagFacet.locator('summary')).toContainText('Tag (1)');
  });

  test('section title clears the fixed header', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto('/#projects');
    await page.locator('#projects .category-title').waitFor({ state: 'visible' });

    const header = page.locator('#header');
    const title = page.locator('#projects .category-title');
    const headerBox = await header.boundingBox();
    const titleBox = await title.boundingBox();
    expect(headerBox).not.toBeNull();
    expect(titleBox).not.toBeNull();

    const headerBottom = headerBox!.y + headerBox!.height;
    expect(titleBox!.y).toBeGreaterThanOrEqual(headerBottom - 2);
  });
});
