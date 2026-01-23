import { describe, expect, test } from 'bun:test';
import { makeMarkdownMdxSafe } from '../mdxSafe';

describe('mdxSafe', () => {
  test('converts angle-bracket autolinks to markdown links', () => {
    expect(makeMarkdownMdxSafe('See <https://example.com>.')).toBe(
      'See [https://example.com](https://example.com).',
    );
  });

  test('converts indented code block to fenced code block', () => {
    const input = ['Example:', '', '    x <- 1', '    y <- 2', '', 'Done.'].join('\n');
    const output = makeMarkdownMdxSafe(input);
    expect(output).toContain('```');
    expect(output).toContain('x <- 1');
    expect(output).toContain('y <- 2');
  });

  test('does not corrupt existing fenced blocks', () => {
    const input = ['``` python', 'print("hi")', '```', '', '    x <- 1'].join('\n');
    const output = makeMarkdownMdxSafe(input);
    expect(output).toContain('``` python\nprint("hi")\n```');
    // Also fenced for the indented block
    expect(output).toContain('x <- 1');
  });
});

