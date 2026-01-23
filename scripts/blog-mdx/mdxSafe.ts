export function convertAngleBracketAutolinks(markdown: string): string {
  // MDX parses `<...>` as JSX/HTML. Rewrite autolinks like `<https://...>` to markdown links.
  return markdown.replace(/<((?:https?:\/\/)[^>\s]+)>/g, (_match, url: string) => `[${url}](${url})`);
}

export function convertIndentedCodeBlocksToFenced(markdown: string): string {
  // Convert pandoc-style indented code blocks to fenced blocks for MDX robustness.
  // Preserve any existing fenced blocks.
  const lines = markdown.split('\n');
  const out: string[] = [];

  let inFencedBlock = false;
  let currentFence: string | null = null;

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    const fenceMatch = line.match(/^(\s*)(`{3,})(.*)$/);
    if (fenceMatch) {
      const fence = fenceMatch[2];
      if (!inFencedBlock) {
        inFencedBlock = true;
        currentFence = fence;
      } else if (currentFence && fence.startsWith(currentFence)) {
        inFencedBlock = false;
        currentFence = null;
      }
      out.push(line);
      i += 1;
      continue;
    }

    if (inFencedBlock) {
      out.push(line);
      i += 1;
      continue;
    }

    const isIndentedCodeLine = /^( {4}|\t)/.test(line);
    if (!isIndentedCodeLine) {
      out.push(line);
      i += 1;
      continue;
    }

    const block: string[] = [];
    while (i < lines.length) {
      const current = lines[i];
      if (current.trim() === '') {
        block.push('');
        i += 1;
        continue;
      }
      if (/^( {4}|\t)/.test(current)) {
        block.push(current.startsWith('\t') ? current.slice(1) : current.slice(4));
        i += 1;
        continue;
      }
      break;
    }

    const fence = block.some((l) => l.includes('```')) ? '````' : '```';
    out.push(fence);
    out.push(...block);
    out.push(fence);
  }

  return out.join('\n');
}

export function makeMarkdownMdxSafe(markdown: string): string {
  return convertAngleBracketAutolinks(convertIndentedCodeBlocksToFenced(markdown));
}

