/**
 * Backfill HTML/markdown image alt attributes on existing Substack-syndicated MDX posts.
 * Safe to re-run: keeps non-empty alts and only fills gaps / decorative chrome.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_CONTENT_DIR } from './blog-mdx/paths';
import { parseFrontmatter } from './blog-mdx/frontmatter';
import { ensureImgAlts } from './blog-mdx/ensureImgAlts';
import { renderMdx, writeFileEnsuringDir } from './blog-mdx/writeMdx';

function splitMdx(mdx: string): { frontmatterBlock: string; body: string } {
  const trimmed = mdx.trimStart();
  if (!trimmed.startsWith('---')) {
    return { frontmatterBlock: '', body: mdx };
  }

  const lines = trimmed.split(/\r?\n/);
  let endIdx = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i] === '---') {
      endIdx = i;
      break;
    }
  }
  if (endIdx === -1) return { frontmatterBlock: '', body: mdx };

  return {
    frontmatterBlock: lines.slice(0, endIdx + 1).join('\n'),
    body: lines.slice(endIdx + 1).join('\n'),
  };
}

function main() {
  const files = readdirSync(BLOG_CONTENT_DIR).filter((name) => name.endsWith('.mdx'));
  let updated = 0;

  for (const name of files) {
    const path = join(BLOG_CONTENT_DIR, name);
    const mdx = readFileSync(path, 'utf8');
    const frontmatter = parseFrontmatter(mdx);
    const sourceUrl = frontmatter.sourceUrl ?? '';
    if (!sourceUrl.includes('substack.com')) continue;

    const title = frontmatter.title ?? name.replace(/\.mdx$/, '');
    const { body } = splitMdx(mdx);
    const nextBody = ensureImgAlts(body, { title });
    if (nextBody === body) continue;

    writeFileEnsuringDir(
      path,
      renderMdx({
        frontmatter,
        body: nextBody,
      }),
    );
    updated += 1;
    console.log(`  updated ${name}`);
  }

  console.log(`Backfilled image alts on ${updated} Substack post(s)`);
}

main();
