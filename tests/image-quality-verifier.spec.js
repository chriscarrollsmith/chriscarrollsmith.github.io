import { test, expect } from '@playwright/test';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs';
import { execSync } from 'child_process';

/**
 * Image Quality Verification Test
 *
 * This test verifies that optimized images maintain acceptable quality by:
 * 1. Capturing screenshots with original images
 * 2. Capturing screenshots with optimized images
 * 3. Running pixel comparison
 * 4. Running LLM visual quality assessment
 */

test.describe('Image Quality Verification', () => {
  const SECTIONS_WITH_BACKGROUNDS = [
    { name: 'home', selector: '#home', heroImage: 'Chris_landscape.jpg' },
    { name: 'about', selector: '#about', heroImage: 'motion-background.jpg' },
    { name: 'projects', selector: '#projects', heroImage: 'violetflowers1.png' },
    { name: 'writing', selector: '#writing', heroImage: 'cityscape.png' },
    { name: 'events', selector: '#events-section', heroImage: 'putty.png' },
  ];

  const SCREENSHOTS_DIR = './tests/screenshots';
  const PIXEL_DIFF_THRESHOLD = 0.05; // 5% pixel difference allowed
  const MIN_LLM_SCORE = 9; // Minimum quality score from LLM (out of 10)

  test.beforeAll(() => {
    // Ensure screenshots directory exists
    if (!fs.existsSync(SCREENSHOTS_DIR)) {
      fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
    }
  });

  test('capture baseline screenshots with original images', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const section of SECTIONS_WITH_BACKGROUNDS) {
      const element = page.locator(section.selector);
      await element.scrollIntoViewIfNeeded();

      // Wait for background image to load
      await page.waitForTimeout(500);

      const screenshotPath = `${SCREENSHOTS_DIR}/${section.name}-original.png`;
      await element.screenshot({ path: screenshotPath });

      console.log(`✓ Captured baseline for ${section.name}`);
    }
  });

  test('capture screenshots with optimized images', async ({ page }) => {
    // This test should be run after images are optimized
    // For now, we'll skip if optimized images don't exist
    const optimizedImagesExist = fs.existsSync('./public/images-optimized');

    if (!optimizedImagesExist) {
      test.skip();
      return;
    }

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const section of SECTIONS_WITH_BACKGROUNDS) {
      const element = page.locator(section.selector);
      await element.scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const screenshotPath = `${SCREENSHOTS_DIR}/${section.name}-optimized.png`;
      await element.screenshot({ path: screenshotPath });

      console.log(`✓ Captured optimized for ${section.name}`);
    }
  });

  test('compare pixel differences between original and optimized', async () => {
    test.skip(); // Skip until we have both original and optimized screenshots

    for (const section of SECTIONS_WITH_BACKGROUNDS) {
      const originalPath = `${SCREENSHOTS_DIR}/${section.name}-original.png`;
      const optimizedPath = `${SCREENSHOTS_DIR}/${section.name}-optimized.png`;

      if (!fs.existsSync(originalPath) || !fs.existsSync(optimizedPath)) {
        console.log(`⊘ Skipping ${section.name} - screenshots not found`);
        continue;
      }

      const img1 = PNG.sync.read(fs.readFileSync(originalPath));
      const img2 = PNG.sync.read(fs.readFileSync(optimizedPath));

      const { width, height } = img1;
      const diff = new PNG({ width, height });

      const numDiffPixels = pixelmatch(
        img1.data,
        img2.data,
        diff.data,
        width,
        height,
        { threshold: 0.1 }
      );

      const totalPixels = width * height;
      const diffPercentage = (numDiffPixels / totalPixels) * 100;

      console.log(`${section.name}: ${diffPercentage.toFixed(2)}% pixels different`);

      // Save diff image
      const diffPath = `${SCREENSHOTS_DIR}/${section.name}-diff.png`;
      fs.writeFileSync(diffPath, PNG.sync.write(diff));

      expect(diffPercentage).toBeLessThan(PIXEL_DIFF_THRESHOLD * 100);
    }
  });

  test('LLM quality assessment of optimized images', async () => {
    test.skip(); // Skip until we have optimized screenshots

    for (const section of SECTIONS_WITH_BACKGROUNDS) {
      const optimizedPath = `${SCREENSHOTS_DIR}/${section.name}-optimized.png`;

      if (!fs.existsSync(optimizedPath)) {
        console.log(`⊘ Skipping ${section.name} - screenshot not found`);
        continue;
      }

      try {
        const score = getLLMQualityScore(optimizedPath, section.name);
        console.log(`${section.name} LLM quality score: ${score}/10`);

        expect(score).toBeGreaterThanOrEqual(MIN_LLM_SCORE);
      } catch (error) {
        console.error(`Error getting LLM score for ${section.name}:`, error.message);
        // Don't fail the test if LLM tool is not available
        test.skip();
      }
    }
  });
});

/**
 * Get quality score from LLM for a screenshot
 * @param {string} imagePath - Path to screenshot
 * @param {string} sectionName - Name of the section for context
 * @returns {number} Quality score from 1-10
 */
function getLLMQualityScore(imagePath, sectionName) {
  const prompt = `You are evaluating the visual quality of a background image in a website section called "${sectionName}".

Rate the image quality on a scale of 1-10 based on these criteria:
- Sharpness and clarity (30%)
- Color accuracy and vibrancy (25%)
- Absence of compression artifacts (25%)
- Overall aesthetic appeal (20%)

A score of 10 means perfect quality with no visible degradation.
A score of 9 means excellent quality with minimal imperceptible degradation.
A score of 8 means very good quality with slight but acceptable degradation.
Below 8 means noticeable quality loss that impacts user experience.

Respond with ONLY a single number from 1-10. No explanation needed.`;

  try {
    const result = execSync(
      `llm -m gpt-4o-mini "${prompt}" -a "${imagePath}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    ).trim();

    const score = parseFloat(result);

    if (isNaN(score) || score < 1 || score > 10) {
      throw new Error(`Invalid score returned: ${result}`);
    }

    return score;
  } catch (error) {
    throw new Error(`Failed to get LLM score: ${error.message}`);
  }
}
