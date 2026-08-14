import { describe, expect, test } from 'vitest';
import { stripSubstackImageChrome } from '../stripSubstackImageChrome';

const ARTIFACT = `<div class="image-link-expand">
<div class="pencraft pc-display-flex pc-gap-8 pc-reset">
<img src="data:image/svg+xml;base64,AAA" class="lucide lucide-refresh-cw" alt="" />
<img src="data:image/svg+xml;base64,BBB" class="lucide lucide-maximize2 lucide-maximize-2" alt="" />
</div>
</div>
`;

describe('stripSubstackImageChrome', () => {
  test('removes image-link-expand / pencraft chrome under images', () => {
    const html = `<img src="https://cdn.example/a.png" alt="A" />
${ARTIFACT}<figcaption>Caption</figcaption>`;
    const out = stripSubstackImageChrome(html);
    expect(out).not.toContain('image-link-expand');
    expect(out).not.toContain('pencraft');
    expect(out).not.toContain('lucide-refresh-cw');
    expect(out).toContain('<img src="https://cdn.example/a.png" alt="A" />');
    expect(out).toContain('<figcaption>Caption</figcaption>');
  });

  test('is a no-op when chrome is absent', () => {
    const html = '<p>Hello</p><img src="https://cdn.example/a.png" alt="A" />';
    expect(stripSubstackImageChrome(html)).toBe(html);
  });
});
