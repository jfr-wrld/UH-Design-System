import { createPropertyFormatter, fileHeader } from 'style-dictionary/utils';

import {
  isMode,
  isPrimitive,
  isThemeless,
  publicName,
  publicPath,
  toCssSegment,
  typographyStyles,
} from './layers.mjs';

const INDENT = '  ';

/**
 * Build the `--uh-*` declaration lines for a subset of tokens.
 *
 * Tokens are re-labelled to their public name first: internally `light` and
 * `dark` are distinct tokens, but both must be written as the same custom
 * property. References are untouched - they always point at primitives, which
 * have no mode segment to strip.
 */
function declarations(tokens, dictionary, options, prefix) {
  const formatProperty = createPropertyFormatter({
    outputReferences: options.outputReferences,
    dictionary,
    format: 'css',
    usesDtcg: true,
  });
  // createPropertyFormatter already indents each line for the `css` format.
  return tokens
    .map((token) => formatProperty({ ...token, name: publicName(token, prefix) }))
    .join('\n');
}

/**
 * One self-contained stylesheet holding both themes:
 *
 *   :root                                  primitives + light semantics
 *   [data-theme='dark']                    dark semantics (explicit opt-in)
 *   @media (prefers-color-scheme: dark)    dark semantics (system default,
 *                                          unless [data-theme='light'] wins)
 */
export const cssThemedFormat = {
  name: 'css/uh-themed',
  format: async ({ dictionary, file, options, platform }) => {
    const header = await fileHeader({ file });
    const { prefix } = platform;
    const all = dictionary.allTokens;

    const themeless = all.filter(isThemeless);
    const light = all.filter(isMode('light'));
    const dark = all.filter(isMode('dark'));

    const root = [
      ':root {',
      `${INDENT}color-scheme: light;`,
      '',
      `${INDENT}/* Primitives and typography - identical in both themes. */`,
      declarations(themeless, dictionary, options, prefix),
      '',
      `${INDENT}/* Layer 2 - semantic, light theme. */`,
      declarations(light, dictionary, options, prefix),
      '}',
    ].join('\n');

    const darkBody = [
      `${INDENT}color-scheme: dark;`,
      '',
      declarations(dark, dictionary, options, prefix),
    ].join('\n');

    return [
      header.trimEnd(),
      '',
      root,
      '',
      "/* Explicit opt-in: <html data-theme='dark'>. */",
      `[data-theme='dark'] {\n${darkBody}\n}`,
      '',
      '/* System preference, unless the page has explicitly asked for light. */',
      '@media (prefers-color-scheme: dark) {',
      `${INDENT}:root:not([data-theme='light']) {`,
      darkBody
        .split('\n')
        .map((line) => (line ? INDENT + line : line))
        .join('\n'),
      `${INDENT}}`,
      '}',
      '',
    ].join('\n');
  },
};

/**
 * Maps the `--uh-*` variables onto Tailwind's theme namespaces.
 *
 * Semantic colours are renamed so the generated utilities read well:
 *   color.text.*   -> --color-fg-*      (text-fg-primary)
 *   color.bg.*     -> --color-*         (bg-surface, bg-canvas)
 *   everything else keeps its path      (border-border-default, bg-status-paid-solid)
 */
function tailwindColorName(token) {
  const [, group, ...rest] = publicPath(token); // drop the leading `color`
  if (isPrimitive(token)) return [group, ...rest].join('-');
  if (group === 'text') return ['fg', ...rest].join('-');
  if (group === 'bg') return rest.join('-');
  return [group, ...rest].join('-');
}

/**
 * Typography maps onto Tailwind's `--text-*` namespace, where a size can carry
 * its own line-height, letter-spacing and weight via `--text-<name>--<prop>`.
 * That makes `text-web-h1` apply the whole composite style in one utility.
 */
function typographyThemeEntries(tokens, prefix) {
  const SUB = {
    lineHeight: 'line-height',
    letterSpacing: 'letter-spacing',
    fontWeight: 'font-weight',
  };
  const lines = [];
  for (const [, style] of typographyStyles(tokens)) {
    const key = `${toCssSegment(style.scale)}-${toCssSegment(style.name)}`;
    const size = style.fields.get('fontSize');
    if (!size) continue;
    lines.push(`${INDENT}--text-${key}: var(--${publicName(size, prefix)});`);
    for (const [field, suffix] of Object.entries(SUB)) {
      const token = style.fields.get(field);
      if (token) {
        lines.push(`${INDENT}--text-${key}--${suffix}: var(--${publicName(token, prefix)});`);
      }
    }
  }
  return lines;
}

/** `--font-latin` / `--font-arabic` and the weight scale. */
function fontThemeEntries(tokens, prefix) {
  const lines = [];
  for (const token of tokens) {
    const path = publicPath(token);
    if (path[0] !== 'font') continue;
    const ns = path[1] === 'family' ? 'font' : 'font-weight';
    lines.push(`${INDENT}--${ns}-${toCssSegment(path[2])}: var(--${publicName(token, prefix)});`);
  }
  return lines;
}

/** Tokens that Tailwind v4 has a theme namespace for. */
function tailwindNamespace(token) {
  const [group] = publicPath(token);
  if (group === 'color') return { ns: 'color', key: tailwindColorName(token) };
  if (group === 'spacing') return { ns: 'spacing', key: publicPath(token)[1] };
  if (group === 'radius') return { ns: 'radius', key: publicPath(token)[1] };
  if (group === 'elevation') return { ns: 'shadow', key: publicPath(token)[1] };
  if (group === 'motion' && publicPath(token)[1] === 'easing') {
    return { ns: 'ease', key: publicPath(token)[2] };
  }
  return null;
}

const themeEntries = (tokens, prefix) => {
  const seen = new Set();
  const lines = [];
  for (const token of tokens) {
    const mapped = tailwindNamespace(token);
    if (!mapped) continue;
    const name = `--${mapped.ns}-${toCssSegment(mapped.key)}`;
    if (seen.has(name)) continue;
    seen.add(name);
    lines.push(`${INDENT}${name}: var(--${publicName(token, prefix)});`);
  }
  return lines;
};

export const tailwindThemeFormat = {
  name: 'css/uh-tailwind-theme',
  format: async ({ dictionary, file, options, platform }) => {
    const header = await fileHeader({ file });
    const { prefix } = platform;
    const all = dictionary.allTokens;

    // Only the light semantics are enumerated: the `--uh-*` variable they point
    // at is what flips between themes, so one entry covers both modes.
    const forTheme = all.filter((token) => isPrimitive(token) || isMode('light')(token));

    return [
      header,
      `@import '${options.variablesImport}';`,
      '',
      '/*',
      ' * `inline` is required: these values are `var()` references that change',
      ' * between themes, and Tailwind must not snapshot them at build time.',
      ' *',
      " * `--spacing-*: initial` clears Tailwind's default step scale first. Without",
      ' * it, `p-4` would resolve to this system (4px) while `p-6` still resolved to',
      " * Tailwind's multiplier (24px). This scale is named in pixels, not steps.",
      ' */',
      '@theme inline {',
      `${INDENT}--spacing-*: initial;`,
      '',
      ...themeEntries(forTheme, prefix),
      '',
      `${INDENT}/* Font families and weights. */`,
      ...fontThemeEntries(all, prefix),
      '',
      `${INDENT}/* Composite text styles: text-web-h1, text-mobile-body-m, text-arabic-lg. */`,
      ...typographyThemeEntries(all, prefix),
      '}',
      '',
    ].join('\n');
  },
};

/**
 * Tailwind v3 `theme.extend` fragment. Values are `var()` references so the
 * light/dark cascade still applies.
 */
export const tailwindJsFormat = {
  name: 'javascript/uh-tailwind',
  format: async ({ dictionary, file, platform }) => {
    const header = await fileHeader({ file });
    const { prefix } = platform;
    const buckets = {
      colors: {},
      spacing: {},
      borderRadius: {},
      boxShadow: {},
      borderWidth: {},
      zIndex: {},
      transitionDuration: {},
      transitionTimingFunction: {},
      fontFamily: {},
      fontWeight: {},
      fontSize: {},
    };
    const groupToBucket = {
      spacing: 'spacing',
      radius: 'borderRadius',
      elevation: 'boxShadow',
      'border-width': 'borderWidth',
      'z-index': 'zIndex',
    };

    for (const token of dictionary.allTokens) {
      if (!isPrimitive(token) && !isMode('light')(token)) continue;
      const path = publicPath(token);
      const [group] = path;
      const value = `var(--${publicName(token, prefix)})`;

      if (group === 'color') {
        buckets.colors[tailwindColorName(token)] = value;
      } else if (group === 'font') {
        const bucket = path[1] === 'family' ? 'fontFamily' : 'fontWeight';
        buckets[bucket][path[2]] = value;
      } else if (group === 'motion') {
        const bucket = path[1] === 'duration' ? 'transitionDuration' : 'transitionTimingFunction';
        buckets[bucket][path[2]] = value;
      } else if (groupToBucket[group]) {
        buckets[groupToBucket[group]][path.slice(1).join('-')] = value;
      }
    }

    // Tailwind v3 expresses a composite text style as [size, { ...rest }].
    for (const [, style] of typographyStyles(dictionary.allTokens)) {
      const size = style.fields.get('fontSize');
      if (!size) continue;
      const rest = {};
      for (const field of ['lineHeight', 'letterSpacing', 'fontWeight']) {
        const token = style.fields.get(field);
        if (token) rest[field] = `var(--${publicName(token, prefix)})`;
      }
      buckets.fontSize[`${style.scale}-${style.name}`] = [
        `var(--${publicName(size, prefix)})`,
        rest,
      ];
    }

    return [
      header.replace(/^\/\*\*/, '/**').trimEnd(),
      '',
      '/**',
      ' * Tailwind v3 `theme.extend` fragment. Import `build/css/variables.css`',
      ' * somewhere in your stylesheet for these to resolve.',
      ' *',
      ' * Tailwind v4 users want `build/tailwind/theme.css` instead.',
      ' */',
      `export const theme = ${JSON.stringify(buckets, null, 2)};`,
      '',
      'export default theme;',
      '',
    ].join('\n');
  },
};

export const formats = [cssThemedFormat, tailwindThemeFormat, tailwindJsFormat];
