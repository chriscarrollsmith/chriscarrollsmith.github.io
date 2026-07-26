const TITLE_SUFFIX = ' | Christopher Carroll Smith';
/** Budget for the post title portion of `<title>` (suffix is appended after). */
const TITLE_BUDGET = 60;
const DESCRIPTION_BUDGET = 155;

function collapseWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

/**
 * Truncate at a word boundary when possible. Appends an ellipsis only when truncated.
 * The returned string is always <= maxLength characters.
 */
export function truncateAtWordBoundary(value: string, maxLength: number): string {
  const text = collapseWhitespace(value);
  if (text.length <= maxLength) return text;

  const ellipsis = '...';
  const sliceAt = Math.max(0, maxLength - ellipsis.length);
  const head = text.slice(0, sliceAt);
  const boundary = Math.max(
    head.lastIndexOf(' '),
    head.lastIndexOf('—'),
    head.lastIndexOf('-'),
    head.lastIndexOf(','),
  );

  const truncated = (boundary > Math.floor(maxLength * 0.5) ? head.slice(0, boundary) : head)
    .trim()
    .replace(/[.,;:!?-]+$/u, '');
  return `${truncated}${ellipsis}`;
}

export function formatBlogPageTitle(title: string): string {
  const truncated = truncateAtWordBoundary(title, TITLE_BUDGET);
  return `${truncated}${TITLE_SUFFIX}`;
}

export function formatBlogPageDescription(excerpt: string): string {
  return truncateAtWordBoundary(excerpt, DESCRIPTION_BUDGET);
}

export { TITLE_SUFFIX, TITLE_BUDGET, DESCRIPTION_BUDGET };
