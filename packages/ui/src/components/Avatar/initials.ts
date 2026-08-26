/**
 * First letter of the first and last word: "Ahmad bin Abdullah" gives AA, not
 * AB. Names in this product are commonly three or four parts with a patronymic
 * in the middle, and the middle part is the least identifying.
 *
 * Lives outside Avatar.tsx so that file exports only components, which is what
 * Fast Refresh needs to hot-reload it.
 */
export function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return (parts[0] as string).slice(0, 2).toUpperCase();
  const first = parts[0] as string;
  const last = parts[parts.length - 1] as string;
  return (first[0] ?? '').concat(last[0] ?? '').toUpperCase();
}
