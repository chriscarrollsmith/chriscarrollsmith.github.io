export function uniqueSlug(desired: string, used: Set<string>): string {
  if (!used.has(desired)) return desired;
  let i = 2;
  while (used.has(`${desired}-${i}`)) i += 1;
  return `${desired}-${i}`;
}

