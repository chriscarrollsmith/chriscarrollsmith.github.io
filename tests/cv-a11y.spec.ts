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

test.describe('CV page section headings', () => {
  test('renders section headings only when data exists (happy path)', async ({ page }) => {
    await page.goto('/cv');

    // Check that main section headings are present (h2 level)
    const educationHeading = page.locator('h2:text("Education")');
    const publicationsHeading = page.locator('h2:text("Publications")');
    const presentationsHeading = page.locator('h2:text("Presentations")');
    const awardsHeading = page.locator('h2:text("Awards & Fellowships")');

    // All main sections should be visible when data exists
    await expect(educationHeading).toBeVisible();
    await expect(publicationsHeading).toBeVisible();
    await expect(presentationsHeading).toBeVisible();
    await expect(awardsHeading).toBeVisible();
  });

  test('renders publication subsection headings only for sections with entries', async ({ page }) => {
    await page.goto('/cv');

    // Wait for the publications list to be visible (React hydration)
    await page.locator('.publications-list').waitFor({ state: 'visible' });

    // Check that publication subsections are present
    const academicPublicationsHeading = page.locator('.publication-section h3:text("Academic Publications")');
    const fictionHeading = page.locator('.publication-section h3:text("Fiction")');

    // Both sections should be visible when they have entries
    await expect(academicPublicationsHeading).toBeVisible();
    await expect(fictionHeading).toBeVisible();

    // Verify that each visible subsection heading has at least one entry
    const publicationSections = page.locator('.publication-section');
    const sectionCount = await publicationSections.count();

    for (let i = 0; i < sectionCount; i++) {
      const section = publicationSections.nth(i);
      const entriesContainer = section.locator('.publications-entries');
      const entries = entriesContainer.locator('.publication-entry-card, .publication-entry-list');
      const entryCount = await entries.count();

      // Each section with a heading should have at least one entry
      expect(entryCount).toBeGreaterThan(0);
    }
  });

  test('renders presentation subsection headings only for sections with entries', async ({ page }) => {
    await page.goto('/cv');

    // Wait for the presentations list to be visible (React hydration)
    await page.locator('.presentations-list').waitFor({ state: 'visible' });

    // Verify that each visible subsection heading has at least one entry
    const presentationSections = page.locator('.presentation-section');
    const sectionCount = await presentationSections.count();

    expect(sectionCount).toBeGreaterThan(0);

    for (let i = 0; i < sectionCount; i++) {
      const section = presentationSections.nth(i);
      const entriesContainer = section.locator('.presentation-entries');
      const entries = entriesContainer.locator('.presentation-entry-card, .presentation-entry-list');
      const entryCount = await entries.count();

      // Each section with a heading should have at least one entry
      expect(entryCount).toBeGreaterThan(0);
    }
  });

  test('does not render empty sections (unhappy path verification)', async ({ page }) => {
    await page.goto('/cv');

    // Wait for the CV content to be visible (React hydration)
    await page.locator('.publications-list').waitFor({ state: 'visible' });
    await page.locator('.presentations-list').waitFor({ state: 'visible' });

    // Verify there are no empty section containers
    // An empty section would be a .publication-section or .presentation-section with 0 entries

    // Check publications - no section should be empty
    const publicationSections = page.locator('.publication-section');
    const pubSectionCount = await publicationSections.count();

    for (let i = 0; i < pubSectionCount; i++) {
      const section = publicationSections.nth(i);
      const heading = await section.locator('h3').textContent();
      const entries = section.locator('.publications-entries > div');
      const entryCount = await entries.count();

      // If a section heading exists, it must have entries
      expect(entryCount, `Publication section "${heading}" should have entries`).toBeGreaterThan(0);
    }

    // Check presentations - no section should be empty
    const presentationSections = page.locator('.presentation-section');
    const presSectionCount = await presentationSections.count();

    for (let i = 0; i < presSectionCount; i++) {
      const section = presentationSections.nth(i);
      const heading = await section.locator('h3').textContent();
      const entries = section.locator('.presentation-entries > div');
      const entryCount = await entries.count();

      // If a section heading exists, it must have entries
      expect(entryCount, `Presentation section "${heading}" should have entries`).toBeGreaterThan(0);
    }

    // Check education - if heading exists, must have entries
    const educationList = page.locator('.education-list');
    if (await educationList.count() > 0) {
      const educationEntries = educationList.locator('.education-entry');
      const eduEntryCount = await educationEntries.count();
      expect(eduEntryCount, 'Education section should have entries').toBeGreaterThan(0);
    }

    // Check awards - if heading exists, must have entries
    const awardsList = page.locator('.awards-list');
    if (await awardsList.count() > 0) {
      const awardEntries = awardsList.locator('.award-entry');
      const awardEntryCount = await awardEntries.count();
      expect(awardEntryCount, 'Awards section should have entries').toBeGreaterThan(0);
    }
  });
});
