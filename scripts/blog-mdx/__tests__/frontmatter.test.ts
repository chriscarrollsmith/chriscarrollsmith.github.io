import { describe, expect, test } from 'bun:test';
import { parseFrontmatter, stringifyFrontmatter } from '../frontmatter';

describe('frontmatter', () => {
  test('stringify then parse round-trips simple scalars', () => {
    const fm = {
      title: 'Hello',
      date: '2026-01-01',
      excerpt: 'World',
      sourceUrl: 'https://example.com',
      sourceId: 'example:1',
      image: '/images/foo.png',
      legacyId: '1',
    };

    const text = `${stringifyFrontmatter(fm)}\n\nBody`;
    expect(parseFrontmatter(text)).toEqual(fm);
  });

  test('parse returns empty object when no frontmatter present', () => {
    expect(parseFrontmatter('# hello')).toEqual({});
  });
});

