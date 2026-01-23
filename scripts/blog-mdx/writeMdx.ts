import { mkdirSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import type { Frontmatter } from './frontmatter';
import { stringifyFrontmatter } from './frontmatter';

export type RenderedMdx = {
  frontmatter: Frontmatter;
  imports?: string;
  body: string;
};

export function renderMdx(doc: RenderedMdx): string {
  const fm = stringifyFrontmatter(doc.frontmatter);
  const imports = doc.imports ? `${doc.imports.trim()}\n\n` : '';
  const body = doc.body.trim();
  return `${fm}\n\n${imports}${body}\n`;
}

export function writeFileEnsuringDir(path: string, contents: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, contents, 'utf-8');
}

export function normalizeImagePath(image: string): string {
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  return `/${image.replace(/^\/+/, '')}`;
}

