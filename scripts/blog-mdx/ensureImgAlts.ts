import { decodeHtmlEntities } from './htmlEntities';

export type EnsureImgAltsOptions = {
  title: string;
};

function escapeAttr(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function getAttr(attrs: string, name: string): string | undefined {
  const match = attrs.match(new RegExp(`\\b${name}\\s*=\\s*(["'])([\\s\\S]*?)\\1`, 'i'));
  return match?.[2];
}

function isDecorativeImage(src: string, className: string): boolean {
  if (!src) return false;
  if (src.startsWith('data:')) return true;
  if (className.includes('lucide')) return true;
  if (src.includes('open.substack.com')) return true;
  return false;
}

function altFromDataAttrs(attrs: string): string | undefined {
  const raw = getAttr(attrs, 'data-attrs');
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(decodeHtmlEntities(raw)) as {
      alt?: unknown;
      title?: unknown;
    };
    if (typeof parsed.alt === 'string' && parsed.alt.trim()) return parsed.alt.trim();
    if (typeof parsed.title === 'string' && parsed.title.trim()) return parsed.title.trim();
  } catch {
    // data-attrs is best-effort metadata from Substack HTML.
  }

  return undefined;
}

function fallbackAlt(title: string, index: number): string {
  if (index === 1) return `Featured image for “${title}”`;
  return `Image ${index} from “${title}”`;
}

function setOrReplaceAlt(tag: string, attrs: string, alt: string): string {
  const quoted = escapeAttr(alt);
  if (/\balt\s*=/i.test(attrs)) {
    const nextAttrs = attrs.replace(/\balt\s*=\s*(["'])[\s\S]*?\1/i, `alt="${quoted}"`);
    return `<img${nextAttrs}>`;
  }

  const trimmed = attrs.trimEnd();
  const spacer = trimmed.length === 0 || /\s$/.test(attrs) ? '' : ' ';
  if (trimmed.endsWith('/')) {
    const withoutSlash = trimmed.slice(0, -1).trimEnd();
    return `<img${withoutSlash}${spacer}alt="${quoted}" />`;
  }

  return `<img${attrs}${spacer}alt="${quoted}">`;
}

/**
 * Ensure every HTML <img> has an alt attribute.
 * Decorative Substack chrome gets alt=""; content images fall back to post title.
 */
export function ensureHtmlImgAlts(html: string, options: EnsureImgAltsOptions): string {
  let contentImageIndex = 0;

  return html.replace(/<img\b([^>]*?)>/gi, (full, attrs: string) => {
    const src = getAttr(attrs, 'src') ?? '';
    const className = getAttr(attrs, 'class') ?? '';
    const existingAlt = getAttr(attrs, 'alt');

    if (isDecorativeImage(src, className)) {
      return setOrReplaceAlt(full, attrs, '');
    }

    if (typeof existingAlt === 'string' && existingAlt.trim() !== '') {
      return full;
    }

    const fromData = altFromDataAttrs(attrs);
    contentImageIndex += 1;
    return setOrReplaceAlt(full, attrs, fromData ?? fallbackAlt(options.title, contentImageIndex));
  });
}

/**
 * Fill empty markdown image alts (`![](url)`) using the post title.
 */
export function ensureMarkdownImageAlts(
  markdown: string,
  options: EnsureImgAltsOptions,
  startIndex = 0,
): string {
  let contentImageIndex = startIndex;

  return markdown.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (full, alt: string, url: string) => {
    if (url.startsWith('data:') || url.includes('open.substack.com')) {
      return alt.trim() ? full : `![](${url})`;
    }
    if (alt.trim()) return full;

    contentImageIndex += 1;
    return `![${fallbackAlt(options.title, contentImageIndex)}](${url})`;
  });
}

function countFilledHtmlContentImages(html: string): number {
  let count = 0;
  for (const match of html.matchAll(/<img\b([^>]*?)>/gi)) {
    const attrs = match[1] ?? '';
    const src = getAttr(attrs, 'src') ?? '';
    const className = getAttr(attrs, 'class') ?? '';
    if (isDecorativeImage(src, className)) continue;
    count += 1;
  }
  return count;
}

export function ensureImgAlts(content: string, options: EnsureImgAltsOptions): string {
  const withHtmlAlts = ensureHtmlImgAlts(content, options);
  return ensureMarkdownImageAlts(withHtmlAlts, options, countFilledHtmlContentImages(withHtmlAlts));
}
