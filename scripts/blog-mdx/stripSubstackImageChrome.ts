/**
 * Strip Substack image overlay chrome (expand/refresh icon buttons) from HTML/MDX.
 * These ship inside `.image-link-expand` / `.pencraft` wrappers and are not useful
 * outside Substack's reader UI.
 */
export function stripSubstackImageChrome(content: string): string {
  return content.replace(
    /<div class="image-link-expand">\s*<div class="pencraft[^"]*">[\s\S]*?<\/div>\s*<\/div>\s*/gi,
    '',
  );
}
