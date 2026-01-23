const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeHtmlEntities(input: string): string {
  // Numeric entities: &#8212; and hex: &#x2014;
  const numericDecoded = input
    .replace(/&#(\d+);/g, (_m, dec: string) => {
      const codePoint = Number(dec);
      if (!Number.isFinite(codePoint)) return _m;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return _m;
      }
    })
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, hex: string) => {
      const codePoint = Number.parseInt(hex, 16);
      if (!Number.isFinite(codePoint)) return _m;
      try {
        return String.fromCodePoint(codePoint);
      } catch {
        return _m;
      }
    });

  // Common named entities used in RSS/HTML snippets.
  return numericDecoded.replace(/&([a-zA-Z]+);/g, (m, name: string) => NAMED[name] ?? m);
}

