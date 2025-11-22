#!/usr/bin/env node

/**
 * LLM Image Quality Scorer
 *
 * Rates image quality using an LLM with vision capabilities.
 * Requires: https://github.com/simonw/llm (with gpt-4o-mini or similar vision model)
 */

import { execSync } from 'child_process';
import fs from 'fs';

const SCORING_RUBRIC = `You are evaluating the visual quality of a background image for a website.

Rate the image quality on a scale of 1-10 based on these criteria:
- Sharpness and clarity (30%)
- Color accuracy and vibrancy (25%)
- Absence of compression artifacts (25%)
- Overall aesthetic appeal (20%)

Scoring guide:
10 = Perfect quality, no visible degradation
9  = Excellent quality, minimal imperceptible degradation
8  = Very good quality, slight but acceptable degradation
7  = Good quality, minor noticeable degradation
6  = Acceptable quality, some visible degradation
<6 = Noticeable quality loss that impacts user experience

Respond with ONLY a single number from 1-10. No explanation needed.`;

/**
 * Get quality score from LLM for an image
 * @param {string} imagePath - Path to image file
 * @param {string} model - LLM model to use (default: gpt-4o-mini)
 * @returns {number} Quality score from 1-10
 */
function getImageQualityScore(imagePath, model = 'gpt-4o-mini') {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Image not found: ${imagePath}`);
  }

  console.log(`Analyzing: ${imagePath}`);
  console.log(`Using model: ${model}`);

  try {
    const result = execSync(
      `llm -m ${model} "${SCORING_RUBRIC}" -a "${imagePath}"`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }
    ).trim();

    console.log(`LLM response: ${result}`);

    const score = parseFloat(result);

    if (isNaN(score) || score < 1 || score > 10) {
      throw new Error(`Invalid score returned: ${result}`);
    }

    return score;
  } catch (error) {
    if (error.message.includes('command not found')) {
      throw new Error('llm command not found. Install from: https://github.com/simonw/llm');
    }
    throw new Error(`Failed to get LLM score: ${error.message}`);
  }
}

// CLI usage
if (process.argv[1] === new URL(import.meta.url).pathname) {
  const imagePath = process.argv[2];
  const model = process.argv[3] || 'gpt-4o-mini';

  if (!imagePath) {
    console.error('Usage: node llm-image-scorer.js <image-path> [model]');
    console.error('Example: node llm-image-scorer.js public/images/violetflowers1.png');
    process.exit(1);
  }

  try {
    const score = getImageQualityScore(imagePath, model);
    console.log(`\nQuality Score: ${score}/10`);

    if (score >= 9) {
      console.log('✓ Excellent quality');
    } else if (score >= 8) {
      console.log('⚠ Good quality, minor degradation');
    } else {
      console.log('✗ Quality below acceptable threshold');
    }

    process.exit(score >= 9 ? 0 : 1);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

export { getImageQualityScore };
