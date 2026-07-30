import '@citation-js/plugin-csl';
import '@citation-js/plugin-bibtex';
import { Cite, plugins } from './citation';
import type { CSLPublication, CSLPresentation } from '../types/data';

export type CitationStyle = 'apa' | 'chicago' | 'bibtex';
export type CSLItem = CSLPublication | CSLPresentation;

let chicagoReady: Promise<void> | null = null;

async function ensureChicagoStyle(): Promise<void> {
  if (chicagoReady) return chicagoReady;

  chicagoReady = (async () => {
    const conf = plugins.config.get('@csl') as {
      templates: { has: (name: string) => boolean; add: (name: string, csl: string) => void };
    };
    if (conf.templates.has('chicago')) return;

    const { default: csl } = await import('../data/csl/chicago-author-date.csl?raw');
    conf.templates.add('chicago', csl);
  })();

  return chicagoReady;
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatCitationSync(item: CSLItem, style: 'apa' | 'bibtex'): string {
  const cite = new Cite([item]);
  if (style === 'bibtex') {
    return String(cite.format('bibtex')).trim();
  }
  return stripHtml(
    cite.format('bibliography', {
      format: 'text',
      template: 'apa',
      lang: 'en-US',
    }),
  );
}

export async function formatCitation(item: CSLItem, style: CitationStyle): Promise<string> {
  if (style === 'chicago') {
    await ensureChicagoStyle();
    const cite = new Cite([item]);
    return stripHtml(
      cite.format('bibliography', {
        format: 'text',
        template: 'chicago',
        lang: 'en-US',
      }),
    );
  }
  return formatCitationSync(item, style);
}

export async function copyCitation(item: CSLItem, style: CitationStyle): Promise<void> {
  const text = await formatCitation(item, style);
  await navigator.clipboard.writeText(text);
}
