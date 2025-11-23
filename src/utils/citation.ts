// Thin wrapper around citation-js so TypeScript issues are localized to one place.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error citation-js does not ship official TypeScript types
import { Cite as RawCite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import type { CSLPublication, CSLPresentation } from '../types/data';

type CSLItem = CSLPublication | CSLPresentation;

interface CiteInstance {
  format(
    mode: 'bibliography' | 'citation' | string,
    options?: {
      format?: 'html' | 'text' | 'string';
      template?: string;
      lang?: string;
    }
  ): string;
}

interface CiteConstructor {
  new (data: CSLItem | CSLItem[]): CiteInstance;
}

// Strongly-typed re-export of the Cite constructor, based on the canonical CSL item type.
export const Cite = RawCite as unknown as CiteConstructor;

