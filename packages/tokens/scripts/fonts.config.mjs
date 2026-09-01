/**
 * Font pipeline manifest.
 *
 * Both families are SIL Open Font License 1.1, which permits embedding in iOS
 * and Android binaries. License texts sit next to the binaries in
 * `assets/fonts/`; ship them with the apps.
 *
 * Upstream sources are the variable fonts from github.com/google/fonts:
 *   ofl/dmsans/DMSans[opsz,wght].ttf
 *   ofl/plusjakartasans/PlusJakartaSans[wght].ttf
 *   ofl/notonaskharabic/NotoNaskhArabic[wght].ttf
 *
 * DM Sans ships two variable axes (`opsz` 9-40, `wght` 100-1000) upstream,
 * but this pipeline only ever instances a single `wght` axis per family (see
 * `instance()` in build-fonts.mjs). `DMSans-VF.ttf` in `assets/fonts/source/`
 * is therefore already a partial instance with `opsz` pinned to 14 - the
 * same optical size Google Fonts' own named instances (Regular, Medium,
 * Bold, ...) all use - leaving only `wght` free, before this manifest or
 * build-fonts.mjs ever sees it. Re-derive it the same way (fontTools
 * `varLib.instancer opsz=14`, then reset the name table's family/subfamily
 * records back to plain "DM Sans" - the pin otherwise renames them to
 * "DM Sans 14pt") if the upstream source is ever refreshed.
 */

/** Google Fonts' own `latin` subset range. */
const LATIN =
  'U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,' +
  'U+0304,U+0308,U+0329,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,' +
  'U+2212,U+2215,U+FEFF,U+FFFD';

/** Google Fonts' own `latin-ext` subset range. */
const LATIN_EXT =
  'U+0100-02AF,U+0304,U+0308,U+0329,U+1E00-1E9F,U+1EF2-1EFF,U+2020,' +
  'U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF';

/** Google Fonts' own `arabic` subset range. */
const ARABIC =
  'U+0600-06FF,U+0750-077F,U+0870-088E,U+0890-0891,U+0898-08E1,U+08E3-08FF,' +
  'U+FB50-FDFF,U+FE70-FEFF,U+102E0-102FB,U+10E60-10E7E,U+10EFD-10EFF,U+1EE00-1EEFF';

/**
 * Layout features to keep. `tnum` is the important one: pyftsubset does NOT
 * keep it by default, and dropping it would silently break every price column
 * in the product. `scripts/verify-numerals.mjs` guards against exactly that.
 */
const LATIN_FEATURES = [
  'ccmp',
  'locl',
  'mark',
  'mkmk',
  'kern',
  'liga',
  'clig',
  'calt',
  'rclt',
  'tnum',
  'lnum',
  'pnum',
  'frac',
  'numr',
  'dnom',
  'sups',
  'subs',
  'case',
  'ordn',
];

/** Arabic needs its joining forms or the script simply will not render. */
const ARABIC_FEATURES = [
  'ccmp',
  'locl',
  'mark',
  'mkmk',
  'kern',
  'liga',
  'dlig',
  'rlig',
  'calt',
  'init',
  'medi',
  'fina',
  'isol',
  'rtlm',
  'tnum',
];

export const families = [
  {
    id: 'dm-sans',
    cssFamily: 'DM Sans',
    source: 'DMSans-VF.ttf',
    license: 'LICENSE-DMSans.txt',
    /*
     * Latin + latin-ext, unlike Manrope's own old scoping here: this source
     * is the true unsplit upstream TTF from google/fonts (see the file
     * header), the same one Plus Jakarta Sans below is built from, so it
     * genuinely has latin-ext glyph coverage to subset from - Manrope's
     * latin-only range was a workaround for its @fontsource source file
     * lacking those glyphs entirely, not a deliberate scoping choice worth
     * carrying over to a source that does not share that limitation.
     */
    unicodeRange: `${LATIN},${LATIN_EXT}`,
    subsetLabel: 'latin + latin-ext',
    features: LATIN_FEATURES,
    axis: 'wght',
    variableRange: [200, 800],
    staticWeights: [
      { weight: 400, name: 'Regular' },
      { weight: 500, name: 'Medium' },
      { weight: 600, name: 'SemiBold' },
      { weight: 700, name: 'Bold' },
    ],
    preloadWeights: [400, 600],
  },
  {
    id: 'plus-jakarta-sans',
    cssFamily: 'Plus Jakarta Sans',
    source: 'PlusJakartaSans-VF.ttf',
    license: 'LICENSE-PlusJakartaSans.txt',
    unicodeRange: `${LATIN},${LATIN_EXT}`,
    subsetLabel: 'latin + latin-ext',
    features: LATIN_FEATURES,
    axis: 'wght',
    /** Range advertised by the variable web font. */
    variableRange: [200, 800],
    /** Static instances cut for iOS/Android bundles. */
    staticWeights: [
      { weight: 400, name: 'Regular' },
      { weight: 500, name: 'Medium' },
      { weight: 600, name: 'SemiBold' },
      { weight: 700, name: 'Bold' },
      { weight: 800, name: 'ExtraBold' },
    ],
    /** Weights used above the fold - these justify a <link rel=preload>. */
    preloadWeights: [400, 600],
  },
  {
    id: 'noto-naskh-arabic',
    cssFamily: 'Noto Naskh Arabic',
    source: 'NotoNaskhArabic-VF.ttf',
    license: 'LICENSE-NotoNaskhArabic.txt',
    unicodeRange: ARABIC,
    subsetLabel: 'arabic',
    features: ARABIC_FEATURES,
    axis: 'wght',
    variableRange: [400, 700],
    staticWeights: [
      { weight: 400, name: 'Regular' },
      { weight: 700, name: 'Bold' },
    ],
    preloadWeights: [],
  },
];
