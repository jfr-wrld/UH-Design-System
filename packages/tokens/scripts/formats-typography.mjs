import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { fileHeader } from 'style-dictionary/utils';

import { publicName, toCssSegment, typographyStyles } from './layers.mjs';

const INDENT = '  ';

/** Token field -> CSS declaration. Fields not listed here are ignored. */
const CSS_PROPERTY = {
  fontFamily: 'font-family',
  fontSize: 'font-size',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
  fontWeight: 'font-weight',
  fontFeatureSettings: 'font-feature-settings',
  fontVariantNumeric: 'font-variant-numeric',
  textTransform: 'text-transform',
  direction: 'direction',
  textAlign: 'text-align',
};

/** Order declarations the way a human would write them. */
const FIELD_ORDER = Object.keys(CSS_PROPERTY);

/**
 * Utility classes, one per composite style, built out of the custom properties
 * that `css/uh-themed` already emitted. Applying `.uh-type-web-h1` therefore
 * costs nothing extra and stays in sync with the tokens automatically.
 */
export const typographyUtilitiesFormat = {
  name: 'css/uh-typography',
  format: async ({ dictionary, file, platform }) => {
    const header = await fileHeader({ file });
    const { prefix } = platform;
    const styles = typographyStyles(dictionary.allTokens);

    const blocks = [];
    for (const [, style] of styles) {
      const fields = [...style.fields.entries()]
        .filter(([field]) => CSS_PROPERTY[field])
        .sort(([a], [b]) => FIELD_ORDER.indexOf(a) - FIELD_ORDER.indexOf(b));
      if (!fields.length) continue;

      const selector = `.${prefix}-type-${toCssSegment(style.scale)}-${toCssSegment(style.name)}`;
      const decls = fields.map(
        ([field, token]) => `${INDENT}${CSS_PROPERTY[field]}: var(--${publicName(token, prefix)});`,
      );
      blocks.push(`${selector} {\n${decls.join('\n')}\n}`);
    }

    const measure = dictionary.allTokens.find(
      (t) => t.path[0] === 'typography' && t.path[1] === 'measure' && t.path[2] === 'base',
    );

    return [
      header.trimEnd(),
      '',
      '/*',
      ' * Requires the custom properties from variables.css to be loaded first -',
      ' * either directly, or via the Tailwind entry point which imports them.',
      ' * Deliberately not imported here, so the two entry points cannot both pull',
      ' * variables.css into one bundle.',
      ' */',
      '',
      '/* One class per composite text style. */',
      blocks.join('\n\n'),
      '',
      '/*',
      ' * Line length. Body copy reads best between 60 and 75 characters; past that',
      ' * the eye struggles to find the start of the next line.',
      ' */',
      measure
        ? `.${prefix}-measure {\n${INDENT}max-width: var(--${publicName(measure, prefix)});\n}`
        : '',
      '',
      '/*',
      ' * Truncation. Package names on a card must use .uh-clamp-2 - one line loses',
      ' * too much of the name, three makes card heights ragged in a grid.',
      ' */',
      [1, 2, 3]
        .map((n) =>
          [
            `.${prefix}-clamp-${n} {`,
            `${INDENT}display: -webkit-box;`,
            `${INDENT}-webkit-box-orient: vertical;`,
            `${INDENT}-webkit-line-clamp: ${n};`,
            `${INDENT}line-clamp: ${n};`,
            `${INDENT}overflow: hidden;`,
            '}',
          ].join('\n'),
        )
        .join('\n\n'),
      '',
    ].join('\n');
  },
};

/**
 * `@font-face` rules generated from the font pipeline's manifest, so the
 * declarations can never drift from the files that `fonts:build` actually
 * produced.
 */
export const fontFaceFormat = {
  name: 'css/uh-font-face',
  format: async ({ file, options }) => {
    const header = await fileHeader({ file });
    const manifest = JSON.parse(await readFile(join(options.fontsRoot, 'manifest.json'), 'utf8'));

    const faces = manifest.families.map((family) => {
      const [min, max] = family.web.weightRange;
      return [
        `/* ${family.cssFamily} - subset: ${family.subset}, ${(family.web.bytes / 1024).toFixed(1)} kB */`,
        '@font-face {',
        `${INDENT}font-family: '${family.cssFamily}';`,
        `${INDENT}src: url('${options.fontPath}/${family.web.file}') format('woff2-variations');`,
        // A variable font advertises a range, so one file serves every weight.
        `${INDENT}font-weight: ${min} ${max};`,
        `${INDENT}font-style: normal;`,
        `${INDENT}font-display: swap;`,
        `${INDENT}unicode-range: ${family.unicodeRange};`,
        '}',
      ].join('\n');
    });

    const preload = manifest.families
      .filter((f) => f.preloadWeights.length)
      .map(
        (f) =>
          ` *   <link rel="preload" as="font" type="font/woff2" crossorigin\n` +
          ` *         href="${options.fontPath}/${f.web.file}">` +
          `   (covers weights ${f.preloadWeights.join(' and ')})`,
      );

    return [
      header.trimEnd(),
      '',
      '/*',
      ' * Self-hosted. These faces are deliberately NOT loaded from the Google Fonts',
      ' * CDN: self-hosting keeps visitor IPs out of a third party and pins the exact',
      ' * font version the design was signed off against.',
      ' *',
      ' * Both families are SIL Open Font License 1.1 - embedding in iOS and Android',
      ' * binaries is permitted. Ship the LICENSE files in assets/fonts/ with the apps.',
      ' *',
      ' * One variable file per family covers every weight, which is smaller than',
      ' * shipping the static cuts separately. Preload only what renders above the',
      ' * fold; the Arabic face is not preloaded because it appears below it:',
      ...preload,
      ' */',
      '',
      faces.join('\n\n'),
      '',
    ].join('\n');
  },
};

export const typographyFormats = [typographyUtilitiesFormat, fontFaceFormat];
