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

  export const plugins: {
    config: {
      get: (name: string) => unknown;
    };
  };
}

declare module '@citation-js/plugin-csl' {
  // Plugin registration - no exports needed
}

declare module '@citation-js/plugin-bibtex' {
  // Plugin registration - no exports needed
}

declare module '*.csl?raw' {
  const content: string;
  export default content;
}

export {};
