export interface HighlightPart {
  text: string;
  match: boolean;
}

/**
 * Splits a label into the parts that matched the query and the parts that did
 * not, preserving the original casing throughout.
 *
 * Done by index rather than by regular expression: a query is whatever the
 * pilgrim typed, and "Jeddah (KSA)" would be a broken pattern rather than a
 * search for a bracket. There is no expression here to escape.
 */
export function splitMatches(text: string, query: string): HighlightPart[] {
  const needle = query.trim();
  if (!needle) return [{ text, match: false }];

  const haystack = text.toLowerCase();
  const lower = needle.toLowerCase();
  const parts: HighlightPart[] = [];
  let cursor = 0;

  for (;;) {
    const found = haystack.indexOf(lower, cursor);
    if (found === -1) break;
    if (found > cursor) parts.push({ text: text.slice(cursor, found), match: false });
    parts.push({ text: text.slice(found, found + lower.length), match: true });
    cursor = found + lower.length;
  }

  if (cursor < text.length) parts.push({ text: text.slice(cursor), match: false });
  return parts.length > 0 ? parts : [{ text, match: false }];
}
