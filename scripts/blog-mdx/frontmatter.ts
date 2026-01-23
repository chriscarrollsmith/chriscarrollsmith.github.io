export type Frontmatter = Record<string, string | undefined>;

export function parseFrontmatter(mdx: string): Frontmatter {
  const trimmed = mdx.trimStart();
  if (!trimmed.startsWith('---\n') && !trimmed.startsWith('---\r\n')) return {};

  const lines = trimmed.split(/\r?\n/);
  if (lines[0] !== '---') return {};

  const out: Frontmatter = {};
  for (let i = 1; i < lines.length; i += 1) {
    const line = lines[i];
    if (line === '---') break;
    const idx = line.indexOf(':');
    if (idx === -1) continue;

    const key = line.slice(0, idx).trim();
    const rawValue = line.slice(idx + 1).trim();
    if (!key) continue;

    // Our writer uses JSON string quoting for scalars. Accept both quoted and unquoted.
    if (rawValue.startsWith('"') || rawValue.startsWith("'")) {
      try {
        // Prefer JSON.parse for values we wrote with JSON.stringify.
        out[key] = JSON.parse(rawValue);
      } catch {
        // Fallback: strip surrounding quotes.
        out[key] = rawValue.replace(/^['"]|['"]$/g, '');
      }
    } else {
      out[key] = rawValue;
    }
  }

  return out;
}

export function stringifyFrontmatter(data: Frontmatter): string {
  const lines: string[] = ['---'];

  for (const [key, value] of Object.entries(data)) {
    if (value === undefined) continue;
    lines.push(`${key}: ${JSON.stringify(value)}`);
  }

  lines.push('---');
  return lines.join('\n');
}

