// Type definitions for @citation-js/core, scoped to CSL-JSON usage in this project
import type { HttpsResourceCitationstylesOrgSchemaV10InputJsonCslDataJson } from './csl-generated';

type CSLItem = HttpsResourceCitationstylesOrgSchemaV10InputJsonCslDataJson[number];

declare module '@citation-js/core' {
  export class Cite {
    constructor(data: CSLItem | CSLItem[]);
    format(
      mode: 'bibliography' | 'citation' | string,
      options?: {
        format?: 'html' | 'text' | 'string';
        template?: string;
        lang?: string;
      }
    ): string;
  }
}

declare module '@citation-js/plugin-csl' {
  // Plugin registration - no exports needed
}

export {};
