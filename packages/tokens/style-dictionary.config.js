/**
 * Style Dictionary configuration for the UmrahHaji design system.
 *
 * `src/tokens.json` is the single source of truth. Three platforms come out of
 * it: themed CSS custom properties, a Tailwind theme, and raw JSON.
 *
 * The transform list is written out by hand rather than using `transformGroup:
 * 'css'` on purpose - that group would rewrite px into rem (`size/rem`) and
 * reformat every hex value (`color/css`). The palette is specified exactly, so
 * values are emitted verbatim and only the *name* is transformed.
 *
 * @type {import('style-dictionary/types').Config}
 */
const config = {
  source: ['src/**/*.json'],
  platforms: {
    css: {
      transforms: ['name/uh'],
      prefix: 'uh',
      buildPath: 'build/css/',
      files: [
        {
          destination: 'variables.css',
          format: 'css/uh-themed',
          options: { outputReferences: true, fileHeader: 'uh/header' },
        },
        {
          destination: 'typography.css',
          format: 'css/uh-typography',
          options: { fileHeader: 'uh/header' },
        },
        {
          destination: 'fonts.css',
          format: 'css/uh-font-face',
          // `copy-fonts` drops the woff2 files into a `fonts/` directory beside
          // this stylesheet. Keeping the reference sibling-relative means it
          // survives being inlined into another package's bundle, as long as
          // that package copies the directory across too.
          options: {
            fileHeader: 'uh/header',
            fontPath: './fonts',
            fontsRoot: 'assets/fonts',
          },
        },
      ],
      actions: ['copy-fonts'],
    },

    tailwind: {
      transforms: ['name/uh'],
      prefix: 'uh',
      buildPath: 'build/tailwind/',
      files: [
        {
          destination: 'theme.css',
          format: 'css/uh-tailwind-theme',
          // Relative to build/tailwind/, pointing at the css platform's output.
          options: { fileHeader: 'uh/header', variablesImport: '../css/variables.css' },
        },
        {
          destination: 'tokens.js',
          format: 'javascript/uh-tailwind',
          options: { fileHeader: 'uh/header' },
        },
      ],
    },

    json: {
      transforms: ['name/uh'],
      prefix: 'uh',
      buildPath: 'build/json/',
      files: [
        {
          destination: 'tokens.json',
          format: 'json/nested',
          options: { fileHeader: 'uh/header' },
        },
        {
          destination: 'tokens.flat.json',
          format: 'json/flat',
          options: { fileHeader: 'uh/header' },
        },
      ],
    },
  },
};

export default config;
