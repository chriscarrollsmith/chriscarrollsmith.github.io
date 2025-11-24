#!/usr/bin/env node

/**
 * Visual QA screenshot helper
 *
 * Captures viewport-height screenshots of specific anchored sections
 * (e.g., "#home", "#about") at a set of key breakpoint widths.
 *
 * Usage:
 *   bun visual_qa/capture_anchors.mjs --base-url http://localhost:4321 --label baseline "#home" "#about"
 *   bun visual_qa/capture_anchors.mjs --base-url http://localhost:4321 --label baseline --color-scheme dark "#cv"
 *   bun visual_qa/capture_anchors.mjs --base-url http://localhost:4321 --label baseline --color-scheme both "#cv"
 *
 * Options:
 *   --base-url <url>       Base URL of the site (required)
 *   --label <label>        Label for screenshot folder (default: "run")
 *   --color-scheme <mode>  Color scheme: "light", "dark", or "both" (default: "both")
 *   --start-dev            Start dev server automatically
 *   --dev-cmd <cmd>        Dev server command (default: "bun run dev")
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

function parseArgs(argv) {
  const args = argv.slice(2);
  let baseUrl = null;
  let label = 'run';
  const anchors = [];
  let startDev = false;
  let devCmd = 'bun run dev';
  let colorScheme = 'both'; // 'light', 'dark', or 'both'

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === '--base-url' && args[i + 1]) {
      baseUrl = args[i + 1];
      i += 1;
    } else if (arg === '--label' && args[i + 1]) {
      label = args[i + 1];
      i += 1;
    } else if (arg === '--color-scheme' && args[i + 1]) {
      const scheme = args[i + 1];
      if (!['light', 'dark', 'both'].includes(scheme)) {
        console.error('Error: --color-scheme must be "light", "dark", or "both"');
        process.exit(1);
      }
      colorScheme = scheme;
      i += 1;
    } else if (arg === '--start-dev') {
      startDev = true;
    } else if (arg === '--dev-cmd' && args[i + 1]) {
      devCmd = args[i + 1];
      i += 1;
    } else if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    } else {
      anchors.push(arg);
    }
  }

  if (!baseUrl) {
    console.error('Error: --base-url is required (e.g., --base-url http://localhost:4321)');
    process.exit(1);
  }

  if (anchors.length === 0) {
    console.error('Error: At least one anchor selector (e.g., "#home") is required.');
    process.exit(1);
  }

  return {
    baseUrl,
    label,
    anchors,
    startDev,
    devCmd,
    colorScheme,
  };
}

function sanitizeAnchorForFilename(anchor) {
  return anchor.replace(/^#+/, '').replace(/[^a-z0-9_-]+/gi, '-');
}

async function ensureDir(dir) {
  await fs.promises.mkdir(dir, { recursive: true });
}

async function captureScreens({ baseUrl, label, anchors, colorScheme }) {
  const outputRoot = path.resolve(process.cwd(), 'visual_qa', 'screenshots', label);
  await ensureDir(outputRoot);

  const browser = await chromium.launch();

  // Determine which color schemes to capture
  const schemes = colorScheme === 'both' ? ['light', 'dark'] : [colorScheme];

  try {
    for (const scheme of schemes) {
      console.log(`\n=== Color Scheme: ${scheme} ===`);

      for (const bp of BREAKPOINTS) {
        const context = await browser.newContext({
          viewport: { width: bp.width, height: bp.height },
          colorScheme: scheme,
        });
        const page = await context.newPage();

        console.log(`\n=== Breakpoint: ${bp.name} (${bp.width}x${bp.height}) ===`);
        await page.goto(baseUrl, { waitUntil: 'networkidle' });

        for (const anchor of anchors) {
          const anchorSlug = sanitizeAnchorForFilename(anchor);
          const schemeSuffix = schemes.length > 1 ? `-${scheme}` : '';
          const fileName = `${bp.name}-${anchorSlug}${schemeSuffix}.png`;
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

          await page.screenshot({
            path: filePath,
            fullPage: false,
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
          await compareDirectories(baselineDir, candidateDir);
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


