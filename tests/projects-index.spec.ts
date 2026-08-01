import { test, expect } from '@playwright/test';

test.describe('Projects work index', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/#projects');
    await page.locator('#projects .projects-index').waitFor({ state: 'visible' });
  });

  test('renders a dense index with GitHub signals', async ({ page }) => {
    await expect(page.locator('#projects .category-title')).toHaveText('Open-Source Projects');
    await expect(page.locator('.projects-row')).toHaveCount(7);
    await expect(page.locator('.projects-count')).toContainText('Showing 7 of 7');

    const taskqueue = page.locator('.projects-row', { hasText: 'taskqueue-mcp' });
    await expect(taskqueue.locator('.projects-signal-language')).toContainText('TypeScript');
    await expect(taskqueue.locator('.projects-signal').filter({ hasText: '★' })).toBeVisible();
    await expect(taskqueue.locator('.projects-signal').filter({ hasText: 'Updated' })).toBeVisible();
  });

  test('filters by language and tag', async ({ page }) => {
    const typescriptChip = page.getByRole('button', { name: 'TypeScript', exact: true });
    await typescriptChip.click();
    await expect(typescriptChip).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.projects-count')).toHaveText(/Showing [1-6] of 7/);

    const afterLanguage = await page.locator('.projects-row').count();
    expect(afterLanguage).toBeGreaterThan(0);
    expect(afterLanguage).toBeLessThan(7);

    for (const row of await page.locator('.projects-row').all()) {
      await expect(row.locator('.projects-signal-language')).toContainText('TypeScript');
    }

    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.locator('.projects-count')).toHaveText('Showing 7 of 7');
    await expect(page.locator('.projects-row')).toHaveCount(7);

    const tagFacet = page.locator('details.projects-tag-facet');
    await tagFacet.locator('summary').click();
    await expect(tagFacet).toHaveAttribute('open', '');
    await page.locator('label.projects-tag-option', { hasText: 'mcp' }).click();
    await expect(page.locator('.projects-row')).toHaveCount(1);
    await expect(page.locator('.projects-row')).toContainText('taskqueue-mcp');
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
