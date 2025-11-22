#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * Converts large PNG/JPG images to optimized WebP format
 * Tests multiple quality levels and validates with LLM scorer
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { getImageQualityScore } from './llm-image-scorer.js';

const QUALITY_LEVELS = [95, 90, 85, 80, 75, 70];
const MIN_ACCEPTABLE_SCORE = 9;
const TARGET_SIZE_KB = 150; // Target max size per image

const IMAGES_TO_OPTIMIZE = [
  { file: 'violetflowers1.png', currentSize: 2030, targetSize: 100 },
  { file: 'putty.png', currentSize: 1798, targetSize: 100 },
  { file: 'cityscape.png', currentSize: 1719, targetSize: 100 },
  { file: 'promptly-desktop.png', currentSize: 970, targetSize: 150 },
];

/**
 * Check if ImageMagick is installed
 */
function checkDependencies() {
  try {
    execSync('convert --version', { stdio: 'ignore' });
    return true;
  } catch {
    console.error('Error: ImageMagick not found.');
    console.error('Install: sudo apt-get install imagemagick');
    return false;
  }
}

/**
 * Optimize an image to WebP at specified quality
 */
function optimizeToWebP(inputPath, outputPath, quality) {
  const cmd = `convert "${inputPath}" -quality ${quality} -define webp:method=6 "${outputPath}"`;

  try {
    execSync(cmd, { stdio: 'ignore' });
    const stats = fs.statSync(outputPath);
    return stats.size / 1024; // Return size in KB
  } catch (error) {
    throw new Error(`Failed to optimize ${inputPath}: ${error.message}`);
  }
}

/**
 * Find optimal quality level for an image
 */
async function findOptimalQuality(imagePath, targetSizeKB, useLLM = false) {
  const inputPath = path.join('public/images', imagePath);
  const baseName = path.basename(imagePath, path.extname(imagePath));
  const tempDir = 'tests/temp-optimized';

  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Optimizing: ${imagePath}`);
  console.log(`${'='.repeat(60)}`);

  // Test original quality first if using LLM
  if (useLLM) {
    console.log('\n1. Testing original image quality...');
    try {
      const originalScore = getImageQualityScore(inputPath);
      console.log(`   Original quality score: ${originalScore}/10`);

      if (originalScore < MIN_ACCEPTABLE_SCORE) {
        console.log(`   ⚠ Warning: Original image scores below ${MIN_ACCEPTABLE_SCORE}`);
      }
    } catch (error) {
      console.log(`   ⚠ Could not score original: ${error.message}`);
      useLLM = false; // Disable LLM if it's not working
    }
  }

  console.log('\n2. Testing quality levels...');

  for (const quality of QUALITY_LEVELS) {
    const outputPath = path.join(tempDir, `${baseName}-q${quality}.webp`);

    try {
      const sizeKB = optimizeToWebP(inputPath, outputPath, quality);
      const sizeReduction = ((1 - sizeKB / (targetSizeKB * 10)) * 100).toFixed(1);

      console.log(`\n   Quality ${quality}:`);
      console.log(`   - Size: ${sizeKB.toFixed(1)} KB (${sizeReduction}% reduction)`);

      // Check LLM score if enabled
      let score = null;
      if (useLLM) {
        try {
          score = getImageQualityScore(outputPath);
          console.log(`   - LLM Score: ${score}/10`);
        } catch (error) {
          console.log(`   - LLM Score: Error - ${error.message}`);
        }
      }

      // Determine if this quality level is acceptable
      const sizeAcceptable = sizeKB <= targetSizeKB;
      const qualityAcceptable = !useLLM || (score && score >= MIN_ACCEPTABLE_SCORE);

      if (sizeAcceptable && qualityAcceptable) {
        console.log(`   ✓ OPTIMAL: Quality ${quality} meets all criteria`);
        return { quality, sizeKB, score, outputPath };
      } else if (!sizeAcceptable) {
        console.log(`   ⊗ Size too large (target: ${targetSizeKB} KB)`);
      } else if (!qualityAcceptable) {
        console.log(`   ⊗ Quality below threshold (need ${MIN_ACCEPTABLE_SCORE}/10)`);
      }
    } catch (error) {
      console.error(`   ✗ Failed at quality ${quality}: ${error.message}`);
    }
  }

  // If no quality level met criteria, return best compromise
  console.log('\n   ⚠ No quality level met all criteria. Using quality 80 as fallback.');
  const fallbackPath = path.join(tempDir, `${baseName}-q80.webp`);
  const fallbackSize = optimizeToWebP(inputPath, fallbackPath, 80);

  return {
    quality: 80,
    sizeKB: fallbackSize,
    score: null,
    outputPath: fallbackPath,
    isFallback: true,
  };
}

/**
 * Main optimization workflow
 */
async function main() {
  const useLLM = process.argv.includes('--llm');
  const dryRun = process.argv.includes('--dry-run');

  console.log('\n╔════════════════════════════════════════════════════════╗');
  console.log('║        Image Optimization Workflow                     ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  console.log(`Mode: ${dryRun ? 'DRY RUN (no files will be replaced)' : 'LIVE'}`);
  console.log(`LLM Quality Check: ${useLLM ? 'Enabled' : 'Disabled (use --llm to enable)'}`);

  if (!checkDependencies()) {
    process.exit(1);
  }

  const results = [];

  for (const image of IMAGES_TO_OPTIMIZE) {
    try {
      const result = await findOptimalQuality(image.file, image.targetSize, useLLM);
      results.push({ image: image.file, ...result });
    } catch (error) {
      console.error(`\n✗ Error optimizing ${image.file}: ${error.message}`);
      results.push({ image: image.file, error: error.message });
    }
  }

  // Summary
  console.log('\n\n╔════════════════════════════════════════════════════════╗');
  console.log('║        Optimization Summary                            ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  for (const result of results) {
    if (result.error) {
      console.log(`✗ ${result.image}: FAILED - ${result.error}`);
    } else {
      console.log(`✓ ${result.image}:`);
      console.log(`  - Quality: ${result.quality}%`);
      console.log(`  - Size: ${result.sizeKB.toFixed(1)} KB`);
      if (result.score) console.log(`  - LLM Score: ${result.score}/10`);
      if (result.isFallback) console.log(`  - Note: Fallback quality used`);
    }
  }

  if (!dryRun) {
    console.log('\n📦 To apply these optimizations, copy files from tests/temp-optimized/');
    console.log('   to public/images/ and update heroimages.json to use .webp extensions');
  } else {
    console.log('\n✓ Dry run complete. Run without --dry-run to optimize.');
  }
}

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(console.error);
}

export { findOptimalQuality, optimizeToWebP };
