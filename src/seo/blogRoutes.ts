import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const SITE_URL = 'https://christophercarrollsmith.com';
const BLOG_DIR = join(process.cwd(), 'src/content/blog');

export type BlogRouteMeta = {
  slug: string;
  legacyId?: string;
  /** Thin syndication mirrors stay out of the sitemap; enriched posts can opt in. */
  isNoindex: boolean;
};

function parseFrontmatter(raw: string): Record<string, string> {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const fields: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':');
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key) fields[key] = value;
  }
  return fields;
}

export function getBlogRouteMeta(): BlogRouteMeta[] {
  return readdirSync(BLOG_DIR)
    .filter((name) => name.endsWith('.mdx') || name.endsWith('.md'))
    .map((name) => {
      const slug = name.replace(/\.mdx?$/, '');
      const fields = parseFrontmatter(readFileSync(join(BLOG_DIR, name), 'utf8'));
      const indexable = fields.indexable === 'true';
      return {
        slug,
        legacyId: fields.legacyId,
        isNoindex: Boolean(fields.sourceUrl) && !indexable,
      };
    });
}

export function getLegacyBlogRedirects(): Record<string, string> {
  const redirects: Record<string, string> = {};
  for (const post of getBlogRouteMeta()) {
    if (post.legacyId) {
      redirects[`/blog/${post.legacyId}`] = `/blog/${post.slug}`;
    }
  }
  return redirects;
}

function normalizeSitemapPath(page: string): string {
  const { pathname } = new URL(page);
  return pathname.replace(/\/+$/, '') || '/';
}

/** Exclude noindex syndicated posts and legacy numeric blog paths from the sitemap. */
export function shouldIncludeInSitemap(page: string): boolean {
  const path = normalizeSitemapPath(page);
  const posts = getBlogRouteMeta();

  if (/^\/blog\/\d+$/.test(path)) {
    return false;
  }

  const blogMatch = path.match(/^\/blog\/([^/]+)$/);
  if (blogMatch) {
    const slug = blogMatch[1].toLowerCase();
    const post = posts.find((entry) => entry.slug.toLowerCase() === slug);
    if (post?.isNoindex) {
      return false;
    }
  }

  return true;
}

export { SITE_URL };
