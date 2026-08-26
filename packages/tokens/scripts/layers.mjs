/**
 * The token file has three layers, and the semantic layer carries two modes:
 *
 *   primitive.color.teal.500          -> layer: primitive
 *   semantic.light.color.text.primary -> layer: semantic, mode: light
 *   semantic.dark.color.text.primary  -> layer: semantic, mode: dark
 *   typography.web.h1.fontSize        -> layer: typography (no mode)
 *
 * Both modes must produce the *same* output name (`--uh-color-text-primary`)
 * so that a theme switch is a plain CSS cascade. These helpers strip the
 * bookkeeping segments from a token path.
 */

export const MODES = ['light', 'dark'];

/** @param {{ path: string[] }} token */
export function tokenLayer(token) {
  const [head, second] = token.path;
  if (head === 'semantic' && MODES.includes(second)) {
    return { layer: 'semantic', mode: second };
  }
  if (head === 'primitive') {
    return { layer: 'primitive', mode: null };
  }
  if (head === 'typography') {
    return { layer: 'typography', mode: null };
  }
  return { layer: 'unknown', mode: null };
}

/**
 * The path a consumer actually sees, with `primitive` / `semantic.<mode>`
 * removed.
 * @param {{ path: string[] }} token
 */
export function publicPath(token) {
  const { layer } = tokenLayer(token);
  if (layer === 'semantic') return token.path.slice(2);
  if (layer === 'primitive') return token.path.slice(1);
  // Typography keeps its own prefix - `--uh-typography-web-h1-font-size` reads
  // better than `--uh-web-h1-font-size` and cannot collide with a colour role.
  return token.path;
}

export const isPrimitive = (token) => tokenLayer(token).layer === 'primitive';
export const isTypography = (token) => tokenLayer(token).layer === 'typography';
export const isMode = (mode) => (token) => tokenLayer(token).mode === mode;

/** Tokens that do not change between themes, so they live in `:root` once. */
export const isThemeless = (token) => isPrimitive(token) || isTypography(token);

/**
 * Group typography leaf tokens back into their composite styles.
 * `typography.web.h1.fontSize` -> style `web.h1`, field `fontSize`.
 * @param {Array<{ path: string[] }>} tokens
 */
export function typographyStyles(tokens) {
  /** @type {Map<string, { scale: string, name: string, fields: Map<string, object> }>} */
  const styles = new Map();
  for (const token of tokens) {
    if (!isTypography(token)) continue;
    const [, scale, name, field] = token.path;
    if (!field) continue; // `typography.measure.base` has no style level
    const key = `${scale}.${name}`;
    if (!styles.has(key)) styles.set(key, { scale, name, fields: new Map() });
    styles.get(key).fields.set(field, token);
  }
  return styles;
}

/**
 * The path Style Dictionary uses internally. The mode is kept so that the light
 * and dark variants stay distinct tokens - otherwise every semantic token would
 * be reported as a name collision.
 * @param {{ path: string[] }} token
 */
export function internalPath(token) {
  const { layer } = tokenLayer(token);
  if (layer === 'primitive' || layer === 'semantic') return token.path.slice(1);
  return token.path;
}

/**
 * Normalise one path segment for CSS output. Dots are not valid in a CSS
 * identifier (`border-width.1.5` -> `border-width-1-5`), and typography tokens
 * are authored in camelCase so they read naturally in the JSON that iOS and
 * Android consume (`fontSize` -> `font-size`).
 */
export const toCssSegment = (segment) =>
  String(segment)
    .replace(/\./g, '-')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();

/** The name a consumer writes, e.g. `uh-color-text-primary` - mode stripped. */
export function publicName(token, prefix) {
  return [prefix, ...publicPath(token)].filter(Boolean).map(toCssSegment).join('-');
}
