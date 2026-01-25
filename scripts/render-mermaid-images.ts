import { readdir, readFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';
import { chromium, type Page } from 'playwright';

const require = createRequire(import.meta.url);

const PROJECT_ROOT = process.cwd();
const BLOG_DIR = path.join(PROJECT_ROOT, 'src', 'content', 'blog');
const OUT_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'mermaid');

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const PADDING = 24;
const BODY_MAX_WIDTH = 1600;

function splitFrontmatter(mdx: string): { frontmatter: string; body: string } {
  const trimmed = mdx.trimStart();
  if (!trimmed.startsWith('---\n') && !trimmed.startsWith('---\r\n')) {
    return { frontmatter: '', body: mdx };
  }

  const lines = trimmed.split(/\r?\n/);
  if (lines[0] !== '---') return { frontmatter: '', body: mdx };

  let endIdx = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i] === '---') {
      endIdx = i;
      break;
    }
  }

  if (endIdx === -1) return { frontmatter: '', body: mdx };
  const frontmatter = lines.slice(0, endIdx + 1).join('\n');
  const body = lines.slice(endIdx + 1).join('\n');
  return { frontmatter, body };
}

function extractMermaidBlocks(mdxBody: string): string[] {
  const blocks: string[] = [];
  const re = /```[ \t]*mermaid[ \t]*\r?\n([\s\S]*?)```/gi;
  let match: RegExpExecArray | null;
  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(mdxBody))) {
    const diagram = match[1]?.trim();
    if (diagram) blocks.push(diagram);
  }
  return blocks;
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function renderMermaidToPng(page: Page, diagram: string, outPath: string): Promise<void> {
  // Mermaid browser bundle (UMD) from node_modules.
  const mermaidJsPath = require.resolve('mermaid/dist/mermaid.min.js');

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: #ffffff; }
      #frame {
        width: ${OG_WIDTH}px;
        height: ${OG_HEIGHT}px;
        box-sizing: border-box;
        padding: ${PADDING}px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #ffffff;
      }
      .mermaid {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .mermaid svg {
        width: 100%;
        height: 100%;
        max-width: 100%;
        max-height: 100%;
      }
    </style>
  </head>
  <body>
    <div id="frame">
      <div class="mermaid">${escapeHtml(diagram)}</div>
    </div>
  </body>
</html>
`;

  await page.setViewportSize({ width: OG_WIDTH, height: OG_HEIGHT });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.addScriptTag({ path: mermaidJsPath });

  await page.evaluate(async () => {
    // @ts-expect-error - mermaid is provided by injected script tag.
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'strict',
    });

    const el = document.querySelector('.mermaid');
    if (!el) throw new Error('Missing mermaid container');

    // @ts-expect-error - mermaid is provided by injected script tag.
    await mermaid.run({ nodes: [el] });

    const svg = document.querySelector('.mermaid svg');
    if (svg) {
      svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
      svg.removeAttribute('width');
      svg.removeAttribute('height');
      (svg as SVGElement).style.width = '100%';
      (svg as SVGElement).style.height = '100%';
    }
  });

  await page.locator('#frame').screenshot({ path: outPath, type: 'png' });
}

async function renderMermaidToBodyPng(page: Page, diagram: string, outPath: string): Promise<void> {
  const mermaidJsPath = require.resolve('mermaid/dist/mermaid.min.js');

  const html = `
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body { margin: 0; padding: 0; background: #ffffff; }
      #wrap { padding: 0; }
      .mermaid { display: inline-block; }
      .mermaid svg { background: #ffffff; }
    </style>
  </head>
  <body>
    <div id="wrap">
      <div class="mermaid">${escapeHtml(diagram)}</div>
    </div>
  </body>
</html>
`;

  await page.setViewportSize({ width: BODY_MAX_WIDTH, height: 2400 });
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.addScriptTag({ path: mermaidJsPath });

  await page.evaluate(async (maxWidth: number) => {
    // @ts-expect-error - mermaid is provided by injected script tag.
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'strict',
    });

    const el = document.querySelector('.mermaid');
    if (!el) throw new Error('Missing mermaid container');

    // @ts-expect-error - mermaid is provided by injected script tag.
    await mermaid.run({ nodes: [el] });

    const svg = document.querySelector('.mermaid svg');
    if (!svg) return;

    // Make the diagram render at a readable pixel size. We keep aspect ratio.
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.removeAttribute('width');
    svg.removeAttribute('height');
    (svg as SVGElement).style.width = `${maxWidth}px`;
    (svg as SVGElement).style.height = 'auto';
    (svg as SVGElement).style.maxWidth = 'none';
  }, BODY_MAX_WIDTH);

  // Screenshot the rendered SVG itself to avoid any OG letterboxing.
  await page.locator('.mermaid svg').screenshot({ path: outPath, type: 'png' });
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const entries = await readdir(BLOG_DIR, { withFileTypes: true });
  const mdxFiles = entries
    .filter(e => e.isFile() && e.name.endsWith('.mdx'))
    .map(e => path.join(BLOG_DIR, e.name));

  const browser = await chromium.launch();

  // Body: higher DPI so text remains crisp when scaled down in CSS.
  const bodyContext = await browser.newContext({ deviceScaleFactor: 2 });
  const bodyPage = await bodyContext.newPage();

  // OG: exact 1200×630 output.
  const ogPage = await browser.newPage();

  let total = 0;

  for (const filePath of mdxFiles) {
    const mdx = await readFile(filePath, 'utf-8');
    const { body } = splitFrontmatter(mdx);
    const blocks = extractMermaidBlocks(body);
    if (blocks.length === 0) continue;

    const slug = path.basename(filePath, path.extname(filePath));
    for (let i = 0; i < blocks.length; i += 1) {
      const outBodyPath = path.join(OUT_DIR, `${slug}-${i + 1}.png`);
      const outOgPath = path.join(OUT_DIR, `${slug}-${i + 1}-og.png`);
      // Overwrite to keep stable URLs.
      await renderMermaidToBodyPng(bodyPage, blocks[i], outBodyPath);
      await renderMermaidToPng(ogPage, blocks[i], outOgPath);
      total += 1;
    }
  }

  await bodyContext.close();
  await browser.close();

  // eslint-disable-next-line no-console
  console.log(`Rendered ${total} Mermaid diagram(s) to ${path.relative(PROJECT_ROOT, OUT_DIR)}/`);
}

main().catch(err => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

