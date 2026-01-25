import path from 'node:path';
import type { Plugin } from 'unified';
import { visit } from 'unist-util-visit';

type CodeNode = {
  type: 'code';
  lang?: string | null;
  value: string;
};

type ImageNode = {
  type: 'image';
  url: string;
  title?: string;
  alt?: string;
};

type Parent = {
  type: string;
  children: unknown[];
};

type HtmlNode = {
  type: 'html';
  value: string;
};

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

    let diagramIndex = 0;

    visit(tree, 'code', (node: CodeNode, index: number | null, parent: Parent | null) => {
      if (!parent || index === null) return;
      const lang = typeof node.lang === 'string' ? node.lang.trim().toLowerCase() : '';
      if (lang !== 'mermaid') return;

      diagramIndex += 1;
      const bodyUrl = `/images/mermaid/${slug}-${diagramIndex}.png`;
      const replacement: HtmlNode = {
        type: 'html',
        value: `<div class="mermaid-diagram"><img src="${bodyUrl}" alt="Diagram" loading="lazy" decoding="async" /></div>`,
      };

      parent.children.splice(index, 1, replacement);
    });
  };
};

