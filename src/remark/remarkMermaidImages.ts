import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

type CodeNode = {
  type: 'code';
  lang?: string | null;
  value: string;
};

type Parent = {
  type: string;
  children: unknown[];
};

type HtmlNode = {
  type: 'html';
  value: string;
};

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function titleFromFile(file: { value?: unknown; path?: unknown }): string | undefined {
  let raw = typeof file.value === 'string' ? file.value : '';
  if (!raw && typeof file.path === 'string') {
    try {
      raw = readFileSync(file.path, 'utf8');
    } catch {
      raw = '';
    }
  }

  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return undefined;
  const titleLine = match[1].split(/\r?\n/).find((line) => line.startsWith('title:'));
  if (!titleLine) return undefined;
  const value = titleLine.slice('title:'.length).trim();
  try {
    return JSON.parse(value);
  } catch {
    return value.replace(/^['"]|['"]$/g, '');
  }
}

/**
 * Replace Mermaid fenced code blocks with a static image reference.
 *
 * Images are expected to be generated at build time by `scripts/render-mermaid-images.ts`.
 *
 * Notes:
 * - We intentionally use PNG in the post body for maximum compatibility.
 */
export const remarkMermaidImages: Plugin = () => {
  return (tree, file) => {
    const filePath = typeof file.path === 'string' ? file.path : '';
    const slug = filePath ? path.basename(filePath, path.extname(filePath)) : 'diagram';
    const title = titleFromFile(file);

    let diagramIndex = 0;

    visit(tree, 'code', (node: CodeNode, index: number | null, parent: Parent | null) => {
      if (!parent || index === null) return;
      const lang = typeof node.lang === 'string' ? node.lang.trim().toLowerCase() : '';
      if (lang !== 'mermaid') return;

      diagramIndex += 1;
      const bodyUrl = `/images/mermaid/${slug}-${diagramIndex}.png`;
      const fallbackTitle = title || slug.replace(/-/g, ' ');
      const alt = `Diagram ${diagramIndex} from “${fallbackTitle}”`;
      const replacement: HtmlNode = {
        type: 'html',
        value: `<div class="mermaid-diagram"><img src="${bodyUrl}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async" /></div>`,
      };

      parent.children.splice(index, 1, replacement);
    });
  };
};
