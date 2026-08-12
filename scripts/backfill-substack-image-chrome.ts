/**
 * Strip Substack image overlay chrome from existing blog MDX posts.
 * Safe to re-run.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BLOG_CONTENT_DIR } from './blog-mdx/paths';
import { stripSubstackImageChrome } from './blog-mdx/stripSubstackImageChrome';
import { writeFileEnsuringDir } from './blog-mdx/writeMdx';

function main() {
  const files = readdirSync(BLOG_CONTENT_DIR).filter((f) => f.endsWith('.mdx'));
  let updated = 0;

  for (const file of files) {
    const path = join(BLOG_CONTENT_DIR, file);
    const before = readFileSync(path, 'utf8');
    const after = stripSubstackImageChrome(before);
    if (after === before) continue;
    writeFileEnsuringDir(path, after);
    updated += 1;
    console.log(`  cleaned ${file}`);
  }

  console.log(`Done. Updated ${updated} of ${files.length} posts.`);
}

main();
