declare module '@citation-js/core' {
  export class Cite {
    constructor(data: unknown | unknown[]);
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
