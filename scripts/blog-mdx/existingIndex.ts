import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { parseFrontmatter } from './frontmatter';

export type ExistingBlogIndex = {
  slugs: Set<string>;
  sourceIds: Set<string>;
};

export function buildExistingBlogIndex(contentDir: string): ExistingBlogIndex {
  const slugs = new Set<string>();
  const sourceIds = new Set<string>();

  const files = readdirSync(contentDir).filter((f) => f.endsWith('.mdx'));
  for (const file of files) {
    const slug = file.replace(/\.mdx$/, '');
    slugs.add(slug);

    const mdx = readFileSync(join(contentDir, file), 'utf-8');
    const fm = parseFrontmatter(mdx);
    if (fm.sourceId) sourceIds.add(fm.sourceId);
  }

  return { slugs, sourceIds };
}

