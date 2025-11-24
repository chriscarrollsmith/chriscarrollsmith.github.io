#!/usr/bin/env node

/**
 * Pixel-level image comparison utility
 *
 * Compares two PNG images and returns the number and percentage of different pixels.
 *
 * Usage:
 *   bun visual_qa/compare_images.mjs baseline.png candidate.png
 *
 * Returns:
 *   - Exit code 0 if images are identical
 *   - Exit code 1 if images differ or comparison fails
 *   - Prints difference statistics to stdout
 */

import fs from 'fs';
import path from 'path';
import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';

/**
 * Compare two PNG images pixel-by-pixel
 * @param {string} baselinePath - Path to baseline image
 * @param {string} candidatePath - Path to candidate image
 * @returns {Object} Comparison result with diffPixels, totalPixels, and percentDiff
 */
export async function compareImages(baselinePath, candidatePath) {
  // Check if both files exist
  if (!fs.existsSync(baselinePath)) {
    throw new Error(`Baseline image not found: ${baselinePath}`);
  }

  if (!fs.existsSync(candidatePath)) {
    throw new Error(`Candidate image not found: ${candidatePath}`);
  }

  // Read images
  const baselineData = PNG.sync.read(fs.readFileSync(baselinePath));
  const candidateData = PNG.sync.read(fs.readFileSync(candidatePath));

  // Verify dimensions match
  if (baselineData.width !== candidateData.width || baselineData.height !== candidateData.height) {
    throw new Error(
      `Image dimensions mismatch: baseline (${baselineData.width}x${baselineData.height}) vs candidate (${candidateData.width}x${candidateData.height})`
    );
  }

  const { width, height } = baselineData;
  const totalPixels = width * height;

  // Create diff image buffer (optional, we don't save it here)
  const diff = new PNG({ width, height });

  // Compare images
  const diffPixels = pixelmatch(
    baselineData.data,
    candidateData.data,
    diff.data,
    width,
    height,
    { threshold: 0.1 } // Adjust threshold if needed (0-1, where 0 is most strict)
  );

  const percentDiff = ((diffPixels / totalPixels) * 100).toFixed(3);

  return {
    diffPixels,
    totalPixels,
    percentDiff: parseFloat(percentDiff),
  };
}

/**
 * Compare baseline and candidate folders and print results
 * @param {string} baselineDir - Path to baseline screenshots folder
 * @param {string} candidateDir - Path to candidate screenshots folder
 * @returns {Array} Array of comparison results
 */
export async function compareDirectories(baselineDir, candidateDir) {
  if (!fs.existsSync(baselineDir)) {
    console.warn(`Baseline directory not found: ${baselineDir}`);
    return [];
  }

  if (!fs.existsSync(candidateDir)) {
    console.warn(`Candidate directory not found: ${candidateDir}`);
    return [];
  }

  const candidateFiles = fs.readdirSync(candidateDir).filter(f => f.endsWith('.png'));
  const results = [];

  console.log('\n=== Pixel Comparison Results ===\n');

  for (const filename of candidateFiles) {
    const baselinePath = path.join(baselineDir, filename);
    const candidatePath = path.join(candidateDir, filename);

    if (!fs.existsSync(baselinePath)) {
      console.log(`⚠️  ${filename}: No baseline found (new screenshot)`);
      results.push({ filename, status: 'new' });
      continue;
    }

    try {
      const result = await compareImages(baselinePath, candidatePath);

      if (result.diffPixels === 0) {
        console.log(`✅ ${filename}: Identical`);
        results.push({ filename, status: 'identical', ...result });
      } else {
        console.log(`🔶 ${filename}: ${result.percentDiff}% pixels changed (${result.diffPixels.toLocaleString()} / ${result.totalPixels.toLocaleString()})`);
        results.push({ filename, status: 'different', ...result });
      }
    } catch (err) {
      console.error(`❌ ${filename}: Comparison failed - ${err.message}`);
      results.push({ filename, status: 'error', error: err.message });
    }
  }

  // Summary
  const identical = results.filter(r => r.status === 'identical').length;
  const different = results.filter(r => r.status === 'different').length;
  const newFiles = results.filter(r => r.status === 'new').length;
  const errors = results.filter(r => r.status === 'error').length;

  console.log('\n=== Summary ===');
  console.log(`Total: ${results.length} images`);
  console.log(`✅ Identical: ${identical}`);
  console.log(`🔶 Different: ${different}`);
  if (newFiles > 0) console.log(`⚠️  New: ${newFiles}`);
  if (errors > 0) console.log(`❌ Errors: ${errors}`);

  if (different > 0) {
    console.log('\n📋 Images requiring visual review:');
    results
      .filter(r => r.status === 'different')
      .sort((a, b) => b.percentDiff - a.percentDiff)
      .forEach(r => {
        console.log(`   ${r.filename} (${r.percentDiff}% changed)`);
      });
  }

  console.log(''); // Final newline

  return results;
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);

  if (args.length === 2) {
    // Direct image comparison
    const [baseline, candidate] = args;

    try {
      const result = await compareImages(baseline, candidate);

      if (result.diffPixels === 0) {
        console.log('Images are identical');
        process.exit(0);
      } else {
        console.log(`Images differ: ${result.percentDiff}% pixels changed`);
        console.log(`${result.diffPixels.toLocaleString()} / ${result.totalPixels.toLocaleString()} pixels`);
        process.exit(1);
      }
    } catch (err) {
      console.error(`Error: ${err.message}`);
      process.exit(1);
    }
  } else if (args.length === 0 || args.includes('--help')) {
    console.log('Usage:');
    console.log('  bun visual_qa/compare_images.mjs baseline.png candidate.png');
    console.log('  bun visual_qa/compare_images.mjs  (compares visual_qa/screenshots/{baseline,candidate})');
    process.exit(0);
  } else {
    // Directory comparison (default baseline vs candidate)
    const baselineDir = path.resolve(process.cwd(), 'visual_qa', 'screenshots', 'baseline');
    const candidateDir = path.resolve(process.cwd(), 'visual_qa', 'screenshots', 'candidate');

    const results = await compareDirectories(baselineDir, candidateDir);

    // Exit with 1 if any differences found
    const hasDifferences = results.some(r => r.status === 'different' || r.status === 'new');
    process.exit(hasDifferences ? 1 : 0);
  }
}
