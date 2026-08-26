import flatTokens from '@umrahhaji/tokens/json/flat';

/**
 * The Foundations pages are generated from the token build, not written next
 * to it. Every value shown is read from `tokens.flat.json` (light mode) or
 * drawn through `var(--uh-*)` (both modes), so the documentation cannot say
 * one thing while the build says another.
 */
export const FLAT = flatTokens as Record<string, string | number>;

/** Every flat token whose name starts with the prefix, in build order. */
export function tokensByPrefix(prefix: string): Array<{ name: string; value: string }> {
  return Object.entries(FLAT)
    .filter(([name]) => name.startsWith(prefix))
    .map(([name, value]) => ({ name, value: String(value) }));
}
