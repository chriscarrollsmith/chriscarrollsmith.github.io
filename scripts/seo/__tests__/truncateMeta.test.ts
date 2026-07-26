import { describe, expect, test } from 'bun:test';
import {
  DESCRIPTION_BUDGET,
  TITLE_BUDGET,
  formatBlogPageDescription,
  formatBlogPageTitle,
  truncateAtWordBoundary,
} from '../../../src/seo/truncateMeta';

describe('truncateMeta', () => {
  test('does not append ellipsis when text fits', () => {
    expect(truncateAtWordBoundary('Short excerpt', DESCRIPTION_BUDGET)).toBe('Short excerpt');
    expect(formatBlogPageDescription('Short excerpt')).toBe('Short excerpt');
  });

  test('truncates titles on a word boundary within budget', () => {
    const title =
      'Comparing the two best AI image generators: Dall-E 2 and Midjourney AI';
    const formatted = formatBlogPageTitle(title);
    expect(formatted.endsWith(' | Christopher Carroll Smith')).toBe(true);
    const head = formatted.replace(/ \| Christopher Carroll Smith$/, '');
    expect(head.length).toBeLessThanOrEqual(TITLE_BUDGET);
    expect(head.endsWith('...')).toBe(true);
    expect(head.includes('Midjou')).toBe(false);
  });

  test('appends ellipsis only when description is truncated', () => {
    const long = 'A'.repeat(200);
    const out = formatBlogPageDescription(long);
    expect(out.endsWith('...')).toBe(true);
    expect(out.length).toBeLessThanOrEqual(DESCRIPTION_BUDGET);
  });
});
