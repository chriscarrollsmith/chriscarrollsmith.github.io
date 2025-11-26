#!/usr/bin/env node

/**
 * Generate site-preview.gif for README
 *
 * Captures screenshots of homepage sections and combines them into an animated GIF.
 * The GIF shows each section in sequence with a delay between frames.
 *
 * Usage:
 *   bun visual_qa/generate_preview_gif.mjs --base-url http://localhost:4321
 *   bun visual_qa/generate_preview_gif.mjs --base-url http://localhost:4321 --start-dev
 *
 * Options:
 *   --base-url <url>       Base URL of the site (required)
 *   --output <path>        Output GIF path (default: site-preview.gif)
 *   --start-dev            Start dev server automatically
 *   --dev-cmd <cmd>        Dev server command (default: "bun run preview")
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { PNG } from 'pngjs';

// GIF dimensions (matching current site-preview.gif)
const GIF_WIDTH = 1280;
const GIF_HEIGHT = 602;

// Sections to capture (in order of appearance on homepage)
const HOMEPAGE_SECTIONS = [
  { id: '#home', name: 'home' },
  { id: '#about', name: 'about' },
  { id: '#projects', name: 'projects' },
  { id: '#writing', name: 'writing' },
  { id: '#events', name: 'events' },
];

// Frame delay in milliseconds (time each frame is shown)
const FRAME_DELAY = 2000; // 2 seconds per frame

function parseArgs(argv) {
  const args = argv.slice(2);
  let baseUrl = null;
  let output = 'site-preview.gif';
  let startDev = false;
  let devCmd = 'bun run preview';

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--base-url' && args[i + 1]) {
      baseUrl = args[i + 1];
      i += 1;
    } else if (arg === '--output' && args[i + 1]) {
      output = args[i + 1];
      i += 1;
    } else if (arg === '--start-dev') {
      startDev = true;
    } else if (arg === '--dev-cmd' && args[i + 1]) {
      devCmd = args[i + 1];
      i += 1;
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    }
  }

  if (!baseUrl) {
    console.error('Error: --base-url is required (e.g., --base-url http://localhost:4321)');
    process.exit(1);
  }

  return { baseUrl, output, startDev, devCmd };
}

async function captureSection(page, sectionId, width, height) {
  const locator = page.locator(sectionId);
  const count = await locator.count();

  if (count === 0) {
    throw new Error(`No element found for selector "${sectionId}"`);
  }

  // Scroll section to top of viewport
  await page.evaluate((selector) => {
    const element = document.querySelector(selector);
    if (element) {
      element.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, sectionId);

  // Wait for any animations/images to load
  await page.waitForTimeout(1500);
  await page.waitForLoadState('networkidle');

  // Capture screenshot to buffer
  const screenshotBuffer = await page.screenshot({
    fullPage: false,
  });

  return screenshotBuffer;
}

async function resizeAndCropImage(buffer, targetWidth, targetHeight) {
  const png = PNG.sync.read(buffer);

  // Calculate scaling to fill target dimensions while maintaining aspect ratio
  const scaleX = targetWidth / png.width;
  const scaleY = targetHeight / png.height;
  const scale = Math.max(scaleX, scaleY);

  const scaledWidth = Math.round(png.width * scale);
  const scaledHeight = Math.round(png.height * scale);

  // Create new image at target size
  const result = new PNG({ width: targetWidth, height: targetHeight });

  // Calculate crop offset to center the image
  const offsetX = Math.round((scaledWidth - targetWidth) / 2);
  const offsetY = Math.round((scaledHeight - targetHeight) / 2);

  // Simple nearest-neighbor scaling and cropping
  for (let y = 0; y < targetHeight; y++) {
    for (let x = 0; x < targetWidth; x++) {
      const srcX = Math.floor((x + offsetX) / scale);
      const srcY = Math.floor((y + offsetY) / scale);

      if (srcX >= 0 && srcX < png.width && srcY >= 0 && srcY < png.height) {
        const srcIdx = (png.width * srcY + srcX) << 2;
        const dstIdx = (targetWidth * y + x) << 2;

        result.data[dstIdx] = png.data[srcIdx];
        result.data[dstIdx + 1] = png.data[srcIdx + 1];
        result.data[dstIdx + 2] = png.data[srcIdx + 2];
        result.data[dstIdx + 3] = png.data[srcIdx + 3];
      }
    }
  }

  return result;
}

async function generatePreviewGif({ baseUrl, output }) {
  const outputPath = path.resolve(process.cwd(), output);
  const tempDir = path.resolve(process.cwd(), '.temp_gif_frames');

  // Create temp directory for frames
  await fs.promises.mkdir(tempDir, { recursive: true });

  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--font-render-hinting=none',
      '--disable-gpu',
      '--disable-cache',
      '--disable-application-cache',
      '--disable-offline-load-stale-cache',
    ],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: GIF_WIDTH, height: GIF_HEIGHT },
      deviceScaleFactor: 1,
      colorScheme: 'light',
      bypassCSP: true,
      ignoreHTTPSErrors: true,
    });
    const page = await context.newPage();

    // Disable cache for this page
    await page.route('**/*', (route) => {
      route.continue({
        headers: {
          ...route.request().headers(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      });
    });

    // Disable animations for consistent rendering
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `,
    });

    console.log(`Navigating to ${baseUrl}...`);
    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // Wait for fonts to load
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);

    // Capture each section
    const frameBuffers = [];
    for (let i = 0; i < HOMEPAGE_SECTIONS.length; i++) {
      const section = HOMEPAGE_SECTIONS[i];
      console.log(`Capturing section ${i + 1}/${HOMEPAGE_SECTIONS.length}: ${section.name} (${section.id})`);
      const buffer = await captureSection(page, section.id, GIF_WIDTH, GIF_HEIGHT);
      frameBuffers.push(buffer);

      // Save frame to temp directory with numbered filename for correct ordering
      const framePath = path.join(tempDir, `frame-${i}-${section.name}.png`);
      await fs.promises.writeFile(framePath, buffer);
    }

    await context.close();
    await browser.close();

    console.log('\nAll frames captured.');
    console.log(`Frames saved to: ${tempDir}`);
    console.log('\nTo create the animated GIF, install ImageMagick and run:');
    console.log(`  convert -delay ${FRAME_DELAY / 10} -loop 0 ${tempDir}/frame-*.png ${outputPath}`);
    console.log('\nOr install gifsicle and use:');
    console.log(`  # First convert PNGs to GIFs`);
    console.log(`  for f in ${tempDir}/frame-*.png; do convert "$f" "\${f%.png}.gif"; done`);
    console.log(`  # Then combine`);
    console.log(`  gifsicle --delay=${FRAME_DELAY / 10} --loop ${tempDir}/frame-*.gif > ${outputPath}`);

  } catch (error) {
    console.error('Error generating preview GIF:', error);
    throw error;
  }
}

function startDevServer(devCmd) {
  console.log(`Starting dev server with command: ${devCmd}`);
  const [cmd, ...cmdArgs] = devCmd.split(' ');

  const child = spawn(cmd, cmdArgs, {
    stdio: 'inherit',
  });

  let exited = false;

  child.on('exit', (code, signal) => {
    exited = true;
    if (code !== null) {
      console.log(`Dev server exited with code ${code}`);
    } else if (signal) {
      console.log(`Dev server killed by signal ${signal}`);
    }
  });

  return {
    child,
    stop() {
      if (exited) return;
      console.log('Stopping dev server...');
      child.kill('SIGINT');
    },
  };
}

async function waitForServer(url, timeoutMs = 60000, intervalMs = 1000) {
  const start = Date.now();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // Ignore and retry
    }

    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for server at ${url}`);
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseArgs(process.argv);
  let dev = null;

  const handleExit = () => {
    if (dev) {
      dev.stop();
    }
  };

  process.on('SIGINT', () => {
    handleExit();
    process.exit(130);
  });

  process.on('SIGTERM', () => {
    handleExit();
    process.exit(143);
  });

  (async () => {
    try {
      if (options.startDev) {
        dev = startDevServer(options.devCmd);
        await waitForServer(options.baseUrl);
      }

      await generatePreviewGif(options);

      handleExit();
    } catch (err) {
      console.error('Error:', err);
      handleExit();
      process.exit(1);
    }
  })();
}
