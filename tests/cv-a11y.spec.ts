import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('CV page accessibility', () => {
  test('has no Axe-core accessibility violations', async ({ page }) => {
    await page.goto('/cv');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    if (results.violations.length > 0) {
      // Log a concise summary of violations to help with debugging during development
      // without relying on external reports.
      // eslint-disable-next-line no-console
      console.log(
        JSON.stringify(
          results.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
            nodes: violation.nodes.map((node) => node.target),
          })),
          null,
          2,
        ),
      );
    }

    expect(results.violations, 'Axe-core accessibility violations').toEqual([]);
  });
});


