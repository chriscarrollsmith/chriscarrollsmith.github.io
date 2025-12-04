/**
 * Syncs videos from YouTube RSS feed into blogs.json
 * Only includes videos from the last year
 * Skips gracefully in CI environments
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

interface YouTubeEntry {
  videoId: string;
  title: string;
  link: string;
  published: string;
  description: string;
  thumbnail: string;
}

const YOUTUBE_FEED = 'https://www.youtube.com/feeds/videos.xml?channel_id=UCrUXwCl0WDHhi5oV3QC8swg';
const BLOGS_JSON_PATH = join(import.meta.dir, '..', 'src', 'data', 'blogs.json');
const FETCH_TIMEOUT_MS = 10000;
const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

/**
 * Parse YouTube Atom feed XML and extract entries
 */
function parseAtomFeed(xml: string): YouTubeEntry[] {
  const entries: YouTubeEntry[] = [];

  // Match all <entry> blocks
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryXml = match[1];

    const getTagContent = (tag: string, namespace?: string): string => {
      const fullTag = namespace ? `${namespace}:${tag}` : tag;
      const regex = new RegExp(`<${fullTag}[^>]*>([\\s\\S]*?)<\\/${fullTag}>`, 'i');
      const tagMatch = entryXml.match(regex);
      return tagMatch ? tagMatch[1].trim() : '';
    };

    const getAttrValue = (tag: string, attr: string, namespace?: string): string => {
      const fullTag = namespace ? `${namespace}:${tag}` : tag;
      const regex = new RegExp(`<${fullTag}[^>]*${attr}=["']([^"']+)["']`, 'i');
      const attrMatch = entryXml.match(regex);
      return attrMatch ? attrMatch[1] : '';
    };

    const videoId = getTagContent('videoId', 'yt');
    const title = getTagContent('title');
    const link = getAttrValue('link', 'href');
    const published = getTagContent('published');
    const description = getTagContent('description', 'media');
    const thumbnail = getAttrValue('thumbnail', 'url', 'media');

    if (videoId && title) {
      entries.push({
        videoId,
        title,
        link,
        published,
        description,
        thumbnail,
      });
    }
  }

  return entries;
}

/**
 * Convert YouTube pubDate to YYYY-MM-DD format
 */
function formatDate(published: string): string {
  const date = new Date(published);
  return date.toISOString().split('T')[0];
}

/**
 * Check if a date is within the last year
 */
function isWithinLastYear(dateStr: string): boolean {
  const date = new Date(dateStr);
  const oneYearAgo = new Date(Date.now() - ONE_YEAR_MS);
  return date >= oneYearAgo;
}

/**
 * Generate HTML content for a YouTube video blog post
 */
function generateVideoContent(entry: YouTubeEntry): string {
  const descriptionHtml = entry.description
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      // Convert URLs to links
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const linkedLine = line.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener">$1</a>');
      return `<p>${linkedLine}</p>`;
    })
    .join('\n');

  return `<div class="video-container" style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;max-width:100%;margin:1.5rem 0;"><iframe style="position:absolute;top:0;left:0;width:100%;height:100%;" src="https://www.youtube.com/embed/${entry.videoId}" title="${entry.title.replace(/"/g, '&quot;')}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>
${descriptionHtml}`;
}

/**
 * Generate excerpt from description (first sentence or first 200 chars)
 */
function generateExcerpt(description: string): string {
  const firstLine = description.split('\n')[0].trim();
  if (firstLine.length <= 200) {
    return firstLine;
  }
  // Try to cut at sentence boundary
  const sentenceEnd = firstLine.slice(0, 200).lastIndexOf('. ');
  if (sentenceEnd > 100) {
    return firstLine.slice(0, sentenceEnd + 1);
  }
  return firstLine.slice(0, 197) + '...';
}

/**
 * Convert YouTube entry to BlogPost
 */
function youtubeEntryToBlogPost(entry: YouTubeEntry): BlogPost {
  return {
    id: `youtube-${entry.videoId}`,
    title: entry.title,
    date: formatDate(entry.published),
    content: generateVideoContent(entry),
    excerpt: generateExcerpt(entry.description),
    image: entry.thumbnail,
    sourceUrl: entry.link,
    sourceId: `youtube:${entry.videoId}`,
  };
}

/**
 * Fetch YouTube feed with timeout
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
    console.log('Skipping YouTube sync in CI environment');
    return;
  }

  console.log('Syncing YouTube videos...');

  // Read existing blogs
  const existingBlogs: BlogPost[] = JSON.parse(readFileSync(BLOGS_JSON_PATH, 'utf-8'));
  const existingSourceIds = new Set(existingBlogs.map(b => b.sourceId).filter(Boolean));

  // Fetch and parse feed
  console.log(`  Fetching ${YOUTUBE_FEED}...`);
  const xml = await fetchFeed(YOUTUBE_FEED);

  if (!xml) {
    console.log('Failed to fetch YouTube feed');
    return;
  }

  const entries = parseAtomFeed(xml);
  console.log(`  Found ${entries.length} videos`);

  // Filter to last year and exclude existing
  const newPosts: BlogPost[] = [];
  for (const entry of entries) {
    const sourceId = `youtube:${entry.videoId}`;
    if (existingSourceIds.has(sourceId)) {
      continue;
    }
    if (!isWithinLastYear(entry.published)) {
      continue;
    }
    newPosts.push(youtubeEntryToBlogPost(entry));
    existingSourceIds.add(sourceId); // Prevent duplicates
  }

  if (newPosts.length === 0) {
    console.log('No new videos to sync');
    return;
  }

  console.log(`Adding ${newPosts.length} new videos`);

  // Merge and sort by date descending
  const allBlogs = [...existingBlogs, ...newPosts].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Write back
  writeFileSync(BLOGS_JSON_PATH, JSON.stringify(allBlogs, null, 2) + '\n');
  console.log('Done');
}

main().catch(console.error);
