#!/usr/bin/env node

/**
 * Visual QA screenshot helper
 *
 * Captures screenshots of page sections (anchors) or full pages (paths).
 *
 * Anchors (e.g., "#home", "#about"):
 *   - Viewport-height screenshots at all breakpoints (xs, sm, md, xl)
 *   - Saved to: visual_qa/screenshots/{label}/{breakpoint}-{section}-{scheme}.png
 *
 * Page paths (e.g., "/cv", "/blog"):
 *   - Full-page screenshots at lg breakpoint (1024px) in both light and dark
 *   - Saved to: visual_qa/screenshots/{label}/fullpage/{page}-{scheme}.png
 *
 * Usage:
 *   bun visual_qa/capture_anchors.mjs --base-url http://localhost:4321 --label baseline "#home" "#about"
 *   bun visual_qa/capture_anchors.mjs --base-url http://localhost:4321 --label baseline "/cv" "/blog" "/blog/1"
 *   bun visual_qa/capture_anchors.mjs --base-url http://localhost:4321 --label baseline "#home" "/cv"
 *
 * Options:
 *   --base-url <url>       Base URL of the site (required)
 *   --label <label>        Label for screenshot folder (default: "run")
 *   --start-dev            Start dev server automatically
 *   --dev-cmd <cmd>        Dev server command (default: "bun run dev")
 *   --annotate             Add CSS selector labels to screenshots
 *
 * Requirements:
 *   - Dev or preview server must be running and reachable at --base-url
 *   - Playwright dependency installed (see package.json)
 */

import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { compareDirectories } from './compare_images.mjs';

const BREAKPOINTS = [
  { name: 'xs', width: 320, height: 568 },  // small mobile
  { name: 'sm', width: 640, height: 932 },   // large mobile (canonical sm breakpoint)
  { name: 'md', width: 768, height: 1024 },  // tablet (canonical md breakpoint)
  { name: 'xl', width: 1280, height: 900 },  // large desktop (canonical xl breakpoint)
];

// Breakpoint for full-page screenshots
const FULLPAGE_BREAKPOINT = { name: 'lg', width: 1025, height: 1400 };

function parseArgs(argv) {
  const args = argv.slice(2);
  let baseUrl = null;
  let label = 'run';
  const targets = []; // can be anchors (#home) or paths (/cv)
  let startDev = false;
  let devCmd = 'bun run dev';
  let annotate = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--base-url' && args[i + 1]) {
      baseUrl = args[i + 1];
      i += 1;
    } else if (arg === '--label' && args[i + 1]) {
      label = args[i + 1];
      i += 1;
    } else if (arg === '--start-dev') {
      startDev = true;
    } else if (arg === '--dev-cmd' && args[i + 1]) {
      devCmd = args[i + 1];
      i += 1;
    } else if (arg === '--annotate') {
      annotate = true;
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    } else {
      targets.push(arg);
    }
  }

  if (!baseUrl) {
    console.error('Error: --base-url is required (e.g., --base-url http://localhost:4321)');
    process.exit(1);
  }

  if (targets.length === 0) {
    console.error('Error: At least one target (anchor like "#home" or path like "/cv") is required.');
    process.exit(1);
  }

  return {
    baseUrl,
    label,
    targets,
    startDev,
    devCmd,
    annotate,
  };
}

function sanitizeAnchorForFilename(anchor) {
  return anchor.replace(/^#+/, '').replace(/[^a-z0-9_-]+/gi, '-');
}

function sanitizePathForFilename(urlPath) {
  // Convert /cv -> cv, /blog -> blog, /blog/1 -> blog-1
  return urlPath.replace(/^\/+/, '').replace(/\/+/g, '-') || 'index';
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

/**
 * Injects CSS selector labels into the page for screenshot annotation
 * Uses a bookmarklet-style approach to overlay labels without breaking layout
 */
async function addSelectorLabels(page) {
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      // Skip if element is too small or is a label we already added
      const rect = el.getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20 || el.dataset.selectorLabel) return;

      // Build selector string
      let label = el.tagName.toLowerCase();
      if (el.id) label += `#${el.id}`;
      if (el.className && typeof el.className === 'string') {
        const classes = el.className.trim().split(/\s+/).filter(c => c);
        if (classes.length > 0) {
          label += `.${classes.join('.')}`;
        }
      }

      // Create label overlay
      const div = document.createElement('div');
      div.textContent = label;
      div.dataset.selectorLabel = 'true';
      div.style.cssText = `
        position: fixed;
        left: ${rect.left}px;
        top: ${rect.top}px;
        background: rgba(0, 0, 0, 0.8);
        color: #0f0;
        font: 10px monospace;
        padding: 2px 4px;
        pointer-events: none;
        z-index: 999999;
        white-space: nowrap;
      `;
      document.body.appendChild(div);
    });
  });
}

async function captureScreens({ baseUrl, label, targets, annotate }) {
  const outputRoot = path.resolve(process.cwd(), 'visual_qa', 'screenshots', label);
  await ensureDir(outputRoot);

  // Separate anchors from paths
  const anchors = targets.filter(t => t.startsWith('#'));
  const paths = targets.filter(t => t.startsWith('/'));

  const browser = await chromium.launch();

  try {
    // Capture anchor-based viewport screenshots (home page sections)
    if (anchors.length > 0) {
      console.log('\n=== Capturing viewport screenshots (anchors) ===');

      // For home page anchors, we only need light mode since sections alternate
      for (const bp of BREAKPOINTS) {
        const context = await browser.newContext({
          viewport: { width: bp.width, height: bp.height },
          colorScheme: 'light',
        });
        const page = await context.newPage();

        console.log(`\n=== Breakpoint: ${bp.name} (${bp.width}x${bp.height}) ===`);
        await page.goto(baseUrl, { waitUntil: 'networkidle' });

        for (const anchor of anchors) {
          const anchorSlug = sanitizeAnchorForFilename(anchor);
          const fileName = `${bp.name}-${anchorSlug}.png`;
          const filePath = path.join(outputRoot, fileName);

          console.log(`Capturing ${anchor} -> ${fileName}`);

          const locator = page.locator(anchor);
          const count = await locator.count();

          if (count === 0) {
            console.warn(`  Warning: No element found for selector "${anchor}" at this breakpoint.`);
            continue;
          }

          await locator.first().scrollIntoViewIfNeeded();
          // Give layout a moment to settle after scrolling
          await page.waitForTimeout(500);

          // Add selector labels if --annotate flag is set
          if (annotate) {
            await addSelectorLabels(page);
          }

          await page.screenshot({
            path: filePath,
            fullPage: false,
          });
        }

        await context.close();
      }
    }

    // Capture full-page screenshots (CV, blog, etc.)
    if (paths.length > 0) {
      console.log('\n=== Capturing full-page screenshots (paths) ===');

      const fullpageDir = path.join(outputRoot, 'fullpage');
      await ensureDir(fullpageDir);

      // Capture in both light and dark modes
      for (const scheme of ['light', 'dark']) {
        console.log(`\n=== Color Scheme: ${scheme} ===`);

        const context = await browser.newContext({
          viewport: { width: FULLPAGE_BREAKPOINT.width, height: FULLPAGE_BREAKPOINT.height },
          deviceScaleFactor: 1,
          colorScheme: scheme,
        });
        const page = await context.newPage();

        for (const urlPath of paths) {
          const pathSlug = sanitizePathForFilename(urlPath);
          const fileName = `${pathSlug}-${scheme}.png`;
          const filePath = path.join(fullpageDir, fileName);
          const fullUrl = `${baseUrl}${urlPath}`;

          console.log(`Capturing ${fullUrl} -> ${fileName}`);

          await page.goto(fullUrl, { waitUntil: 'networkidle' });
          // Extra delay for full-page screenshots to ensure layout is settled
          await page.waitForTimeout(600);

          // Add selector labels if --annotate flag is set
          if (annotate) {
            await addSelectorLabels(page);
          }

          await page.screenshot({
            path: filePath,
            fullPage: true,
          });
        }

        await context.close();
      }
    }

    console.log(`\nScreenshots saved under: ${outputRoot}`);
  } finally {
    await browser.close();
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

      await captureScreens(options);

      // If we captured with label "candidate", automatically compare against baseline
      if (options.label === 'candidate') {
        const baselineDir = path.resolve(process.cwd(), 'visual_qa', 'screenshots', 'baseline');
        const candidateDir = path.resolve(process.cwd(), 'visual_qa', 'screenshots', options.label);

        if (fs.existsSync(baselineDir)) {
          // Compare top-level screenshots (viewport/anchor-based)
          await compareDirectories(baselineDir, candidateDir);

          // Compare fullpage screenshots if both directories exist
          const baselineFullpage = path.join(baselineDir, 'fullpage');
          const candidateFullpage = path.join(candidateDir, 'fullpage');
          if (fs.existsSync(baselineFullpage) && fs.existsSync(candidateFullpage)) {
            console.log('\n=== Full-page Screenshot Comparison ===');
            await compareDirectories(baselineFullpage, candidateFullpage);
          }
        } else {
          console.log('\nℹ️  No baseline directory found. Skipping comparison.');
          console.log('   Run with --label baseline first to create baseline screenshots.');
        }
      }

      handleExit();
    } catch (err) {
      console.error('Error during capture:', err);
      handleExit();
      process.exit(1);
    }
  })();
}


