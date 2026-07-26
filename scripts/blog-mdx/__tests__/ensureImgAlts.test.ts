import { describe, expect, test } from 'bun:test';
import { ensureHtmlImgAlts, ensureImgAlts, ensureMarkdownImageAlts } from '../ensureImgAlts';

describe('ensureImgAlts', () => {
  test('fills missing HTML alt from data-attrs', () => {
    const html =
      '<img src="https://example.com/a.jpg" data-attrs="{&quot;alt&quot;:&quot;A cat&quot;,&quot;title&quot;:null}" />';
    const out = ensureHtmlImgAlts(html, { title: 'Post' });
    expect(out).toContain('alt="A cat"');
  });

  test('falls back to post title when data-attrs alt is null', () => {
    const html =
      '<img src="https://example.com/a.jpg" data-attrs="{&quot;alt&quot;:null,&quot;title&quot;:null}" width="10" />';
    const out = ensureHtmlImgAlts(html, { title: 'My Post' });
    expect(out).toContain('alt="Featured image for “My Post”"');
  });

  test('marks lucide/data-uri images as decorative', () => {
    const html =
      '<img src="data:image/svg+xml;base64,AAA" class="lucide lucide-refresh-cw" /><img src="https://cdn.example/x.png" />';
    const out = ensureHtmlImgAlts(html, { title: 'Post' });
    expect(out).toContain('alt=""');
    expect(out).toContain('alt="Featured image for “Post”"');
  });

  test('fills empty markdown image alts', () => {
    const md = '![keep](https://example.com/a.jpg)\n![](https://example.com/b.jpg)';
    const out = ensureMarkdownImageAlts(md, { title: 'Post' });
    expect(out).toContain('![keep](https://example.com/a.jpg)');
    expect(out).toContain('![Featured image for “Post”](https://example.com/b.jpg)');
  });

  test('handles mixed HTML and markdown content', () => {
    const content = '<img src="https://example.com/a.jpg" />\n\n![](https://example.com/b.jpg)';
    const out = ensureImgAlts(content, { title: 'Mixed' });
    expect(out).toContain('alt="Featured image for “Mixed”"');
    expect(out).toContain('![Image 2 from “Mixed”](https://example.com/b.jpg)');
  });
});
