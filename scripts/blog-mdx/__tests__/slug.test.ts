import { describe, expect, test } from 'bun:test';
import { uniqueSlug } from '../slug';

describe('uniqueSlug', () => {
  test('returns desired slug when unused', () => {
    expect(uniqueSlug('foo', new Set())).toBe('foo');
  });

  test('suffixes when used', () => {
    const used = new Set(['foo', 'foo-2']);
    expect(uniqueSlug('foo', used)).toBe('foo-3');
  });
});

