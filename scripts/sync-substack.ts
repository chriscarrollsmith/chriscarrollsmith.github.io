/**
 * Syncs blog posts from Substack RSS feeds into blogs.json
 * Skips gracefully in CI environments where Substack blocks requests
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

interface BlogPost {
  id: number | string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  image?: string;
  script?: string;
  sourceUrl?: string;
  sourceId?: string;
}

interface RSSItem {
  title: string;
  link: string;
  guid: string;
  description: string;
  contentEncoded: string;
  pubDate: string;
}

const FEEDS = [
  'https://knowledgeworkersguide.substack.com/feed',
  'https://modelingmarkets.substack.com/feed',
];

const BLOGS_JSON_PATH = join(import.meta.dir, '..', 'src', 'data', 'blogs.json');
const FETCH_TIMEOUT_MS = 10000;

/**
 * Parse RSS XML and extract items
 */
function parseRSS(xml: string): RSSItem[] {
  const items: RSSItem[] = [];

  // Match all <item> blocks
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];

    const getTagContent = (tag: string): string => {
      // Handle CDATA sections
      const cdataRegex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`, 'i');
      const cdataMatch = itemXml.match(cdataRegex);
      if (cdataMatch) return cdataMatch[1].trim();

      // Handle regular content
      const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
      const tagMatch = itemXml.match(regex);
      return tagMatch ? tagMatch[1].trim() : '';
    };

    const title = getTagContent('title');
    const link = getTagContent('link');
    const guid = getTagContent('guid');
    const description = getTagContent('description');
    const contentEncoded = getTagContent('content:encoded');
    const pubDate = getTagContent('pubDate');

    if (title && guid) {
      items.push({
        title,
        link,
        guid,
        description,
        contentEncoded,
        pubDate,
      });
    }
  }

  return items;
}

/**
 * Convert RSS pubDate to YYYY-MM-DD format
 */
function formatDate(pubDate: string): string {
  const date = new Date(pubDate);
  return date.toISOString().split('T')[0];
}

/**
 * Extract slug from Substack URL for use as route ID
 * e.g., "https://example.substack.com/p/my-post-title" -> "my-post-title"
 */
function extractSlug(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    // Substack URLs are typically /p/slug-here
    const slug = pathParts[pathParts.length - 1] || '';
    return slug;
  } catch {
    // Fallback: use last segment after /
    const parts = url.split('/').filter(Boolean);
    return parts[parts.length - 1] || url;
  }
}

/**
 * Clean Substack HTML content by removing elements that won't work on GitHub Pages
 */
function cleanContent(html: string): string {
  // Remove Substack subscribe widget containers (they won't work outside Substack)
  // The structure is: div.subscription-widget-wrap-editor > div.subscription-widget > (preamble + form with nested divs)
  // We need to match 5 closing </div> tags
  return html.replace(/<div class="subscription-widget-wrap-editor"[\s\S]*?<\/form>\s*<\/div>\s*<\/div>/g, '');
}

/**
 * Extract the first image URL from HTML content for use as thumbnail
 */
function extractFirstImage(html: string): string | undefined {
  // Match src attribute from img tags
  const imgMatch = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgMatch && imgMatch[1]) {
    const src = imgMatch[1];
    // Skip tracking pixels and tiny images (often 1x1)
    if (src.includes('open.substack.com') || src.includes('substackcdn.com/img/')) {
      return undefined;
    }
    return src;
  }
  return undefined;
}

/**
 * Convert RSS item to BlogPost
 */
function rssItemToBlogPost(item: RSSItem): BlogPost {
  const content = cleanContent(item.contentEncoded);
  const image = extractFirstImage(item.contentEncoded);

  return {
    id: extractSlug(item.guid),
    title: item.title,
    date: formatDate(item.pubDate),
    content,
    excerpt: item.description,
    image,
    sourceUrl: item.link,
    sourceId: item.guid,
  };
}

/**
 * Fetch RSS feed with timeout
 */
async function fetchFeed(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlogSync/1.0)',
      },
    });

    if (!response.ok) {
      console.warn(`  Warning: ${url} returned ${response.status}`);
      return null;
    }

    return await response.text();
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.warn(`  Warning: ${url} timed out`);
    } else {
      console.warn(`  Warning: Failed to fetch ${url}:`, error instanceof Error ? error.message : error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  // Skip in CI environment
  if (process.env.CI) {
    console.log('Skipping Substack sync in CI environment');
    return;
  }

  console.log('Syncing Substack posts...');

  // Read existing blogs
  const existingBlogs: BlogPost[] = JSON.parse(readFileSync(BLOGS_JSON_PATH, 'utf-8'));
  const existingSourceIds = new Set(existingBlogs.map(b => b.sourceId).filter(Boolean));

  // Fetch and parse all feeds
  const newPosts: BlogPost[] = [];

  for (const feedUrl of FEEDS) {
    console.log(`  Fetching ${feedUrl}...`);
    const xml = await fetchFeed(feedUrl);

    if (!xml) {
      continue;
    }

    const items = parseRSS(xml);
    console.log(`  Found ${items.length} posts`);

    for (const item of items) {
      if (!existingSourceIds.has(item.guid)) {
        newPosts.push(rssItemToBlogPost(item));
        existingSourceIds.add(item.guid); // Prevent duplicates across feeds
      }
    }
  }

  if (newPosts.length === 0) {
    console.log('No new posts to sync');
    return;
  }

  console.log(`Adding ${newPosts.length} new posts`);

  // Merge and sort by date descending
  const allBlogs = [...existingBlogs, ...newPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Write back
  writeFileSync(BLOGS_JSON_PATH, JSON.stringify(allBlogs, null, 2) + '\n');
  console.log('Done');
}

main().catch(console.error);
