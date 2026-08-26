#!/usr/bin/env node
/**
 * Font asset pipeline. Run occasionally, not on every build:
 *
 *   pnpm --filter @umrahhaji/tokens fonts:build
 *
 * It reads the upstream variable fonts in `assets/fonts/source/` and writes
 * subset web fonts, static mobile fonts, and a manifest. Those outputs are
 * COMMITTED, so `pnpm build` and CI never need this tool.
 *
 * Requires fontTools:  pip install 'fonttools[woff]' brotli
 *
 * fontTools is used rather than a JS subsetter because it is the only option
 * that lets us pin the exact OpenType features to keep. `tnum` is not in its
 * default keep-list, and losing it would silently break every price column.
 *
 * Two steps per output, because subsetting cannot instance:
 *   fontTools.varLib.instancer  pins or narrows the wght axis
 *   fontTools.subset            trims glyphs, features and tables
 */
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { families } from './fonts.config.mjs';

const run = promisify(execFile);
const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fontsRoot = join(packageRoot, 'assets', 'fonts');
const sourceDir = join(fontsRoot, 'source');
const webDir = join(fontsRoot, 'web');
const mobileDir = join(fontsRoot, 'mobile');

const kb = (bytes) => `${(bytes / 1024).toFixed(1)} kB`;

const PYTHON = process.env.PYTHON ?? 'python3';

async function ensureFontTools() {
  try {
    await run(PYTHON, ['-c', 'import fontTools, brotli']);
  } catch {
    throw new Error(
      `${PYTHON} is missing fontTools/brotli. Install them with:\n` +
        '  pip install "fonttools[woff]" brotli\n' +
        'or point this script at another interpreter with PYTHON=/path/to/python3',
    );
  }
}

/**
 * Pin the weight axis to a single value (`--static`), or narrow it to a range
 * while keeping the font variable.
 * @param {string} input
 * @param {string} output
 * @param {number | [number, number]} wght
 */
async function instance(input, output, wght) {
  const location = Array.isArray(wght) ? `wght=${wght[0]}:${wght[1]}` : `wght=${wght}`;
  const args = ['-m', 'fontTools.varLib.instancer', input, location, '-o', output];
  // A pinned instance becomes a genuine static font with corrected name records,
  // which is what iOS and Android expect from a bundled .ttf.
  if (!Array.isArray(wght)) args.push('--static', '--update-name-table');
  await run(PYTHON, args);
}

/**
 * @param {object} opts
 * @param {string} opts.input      source font path
 * @param {string} opts.output     destination path
 * @param {string} opts.flavor     'woff2' | '' (empty keeps TrueType)
 * @param {string} opts.unicodes   unicode range spec
 * @param {string[]} opts.features layout features to keep
 */
async function subset({ input, output, flavor, unicodes, features }) {
  const args = [
    '-m',
    'fontTools.subset',
    input,
    `--output-file=${output}`,
    `--unicodes=${unicodes}`,
    `--layout-features+=${features.join(',')}`,
    '--notdef-outline',
    '--name-IDs=*',
    '--drop-tables+=DSIG',
  ];
  if (flavor) args.push(`--flavor=${flavor}`);
  await run(PYTHON, args);
  return (await stat(output)).size;
}

async function main() {
  await ensureFontTools();
  const work = await mkdtemp(join(tmpdir(), 'uh-fonts-'));
  await rm(webDir, { recursive: true, force: true });
  await rm(mobileDir, { recursive: true, force: true });
  await mkdir(webDir, { recursive: true });
  await mkdir(mobileDir, { recursive: true });

  const manifest = { families: [] };
  const report = [];

  for (const family of families) {
    const input = join(sourceDir, family.source);
    const original = (await stat(input)).size;

    // Web: one variable woff2 per family covers every weight in the range.
    const webFile = `${family.id}-variable.woff2`;
    const narrowed = join(work, `${family.id}-narrowed.ttf`);
    await instance(input, narrowed, family.variableRange);
    const webSize = await subset({
      input: narrowed,
      output: join(webDir, webFile),
      flavor: 'woff2',
      unicodes: family.unicodeRange,
      features: family.features,
    });

    // Mobile: static TrueType instances, one per named weight.
    const statics = [];
    for (const { weight, name } of family.staticWeights) {
      const file = `${family.id}-${name.toLowerCase()}.ttf`;
      const pinned = join(work, `${family.id}-${weight}.ttf`);
      await instance(input, pinned, weight);
      const size = await subset({
        input: pinned,
        output: join(mobileDir, file),
        flavor: '',
        unicodes: family.unicodeRange,
        features: family.features,
      });
      statics.push({ weight, name, file, bytes: size });
    }

    const staticTotal = statics.reduce((sum, s) => sum + s.bytes, 0);
    report.push({
      family: family.cssFamily,
      original,
      webSize,
      staticTotal,
      staticCount: statics.length,
      subsetLabel: family.subsetLabel,
    });

    manifest.families.push({
      id: family.id,
      cssFamily: family.cssFamily,
      license: family.license,
      unicodeRange: family.unicodeRange,
      subset: family.subsetLabel,
      preloadWeights: family.preloadWeights,
      web: { file: webFile, format: 'woff2', weightRange: family.variableRange, bytes: webSize },
      mobile: statics,
    });
  }

  await writeFile(join(fontsRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  console.log('\n[fonts] Subset complete.\n');
  for (const r of report) {
    const saved = (1 - r.webSize / r.original) * 100;
    console.log(`  ${r.family}  (subset: ${r.subsetLabel})`);
    console.log(`    upstream variable ttf   ${kb(r.original).padStart(9)}`);
    console.log(
      `    web variable woff2      ${kb(r.webSize).padStart(9)}   ${saved.toFixed(1)}% smaller`,
    );
    console.log(
      `    mobile static ttf x${r.staticCount}    ${kb(r.staticTotal).padStart(9)}   (bundled, not downloaded)`,
    );
  }
  await rm(work, { recursive: true, force: true });
  const files = (await readdir(webDir)).length + (await readdir(mobileDir)).length;
  console.log(`\n  ${files} files written to assets/fonts/{web,mobile}/`);
  console.log('  manifest.json updated - commit these outputs.\n');
}

main().catch((error) => {
  console.error('[fonts] Build failed.');
  console.error(error.message ?? error);
  process.exitCode = 1;
});
