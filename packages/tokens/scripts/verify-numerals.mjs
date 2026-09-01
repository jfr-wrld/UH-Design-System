#!/usr/bin/env node
/**
 * Guards the pricing typography.
 *
 * The platform shows prices in card grids and breakdown tables, so digits must
 * occupy identical width or the columns wobble. Plus Jakarta Sans is strongly
 * proportional by default - its `1` is roughly half the width of its `0` - so
 * everything depends on the `tnum` feature both existing and surviving the
 * subsetting step in build-fonts.mjs. `tnum` is not in fontTools' default
 * keep-list, which is exactly the kind of regression this catches.
 *
 * Only Plus Jakarta Sans is checked, not DM Sans: DM Sans (the functional/body
 * face) has no `tnum` feature at all upstream - confirmed against its own
 * GSUB table, not a subsetting regression - so no numeric role uses it, and
 * both `numeric.price-*` and `numeric.table` stay on Plus Jakarta Sans
 * instead. Re-add a check here if a numeric role ever moves to a different
 * face.
 *
 * Run: pnpm --filter @umrahhaji/tokens verify:numerals
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as fontkit from 'fontkit';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const fontsRoot = join(packageRoot, 'assets', 'fonts');

/** The exact samples the design brief asks about. */
const SAMPLES = ['RM 12,500', 'RM 9,800', 'RM 24,300'];
const DIGITS = [...'0123456789'];

const failures = [];
const notes = new Set();

const fail = (msg) => failures.push(msg);
const bar = (units, scale) => '#'.repeat(Math.max(1, Math.round(units / scale)));

function widthOf(font, text, features) {
  return font.layout(text, features).advanceWidth;
}

/** Advance of every glyph, plus each glyph's offset from the right edge. */
function columns(font, text, features) {
  const run = font.layout(text, features);
  const advances = run.glyphs.map((_, i) => run.positions[i].xAdvance);
  const total = advances.reduce((a, b) => a + b, 0);
  let x = 0;
  return run.glyphs.map((glyph, i) => {
    const fromRight = total - x - advances[i];
    x += advances[i];
    return { name: glyph.name, advance: advances[i], fromRight };
  });
}

async function checkLatin(file, label) {
  const font = fontkit.openSync(join(fontsRoot, file));
  console.log(`\n  ${label}`);
  console.log(`    ${file}  (${font.type}, ${font.unitsPerEm} upm)`);

  if (!font.availableFeatures.includes('tnum')) {
    fail(`${label}: 'tnum' is missing - subsetting dropped it, prices will not align.`);
    return;
  }
  if (!font.availableFeatures.includes('lnum')) {
    notes.add(
      "Plus Jakarta Sans has no 'lnum' feature. Its default figures are already lining " +
        "(there are no oldstyle figures at all), so 'lnum' is inert - harmless, but it does nothing.",
    );
  }

  // 1. Every digit must be the same width under tnum.
  const tabular = DIGITS.map((d) => widthOf(font, d.repeat(10), ['tnum']) / 10);
  const distinct = [...new Set(tabular)];
  const proportional = [...new Set(DIGITS.map((d) => widthOf(font, d.repeat(10), []) / 10))];

  if (distinct.length !== 1) {
    fail(
      `${label}: digits are NOT equal width under tnum - ` +
        `${distinct.length} distinct advances ${JSON.stringify(distinct.sort((a, b) => a - b))}.`,
    );
    return;
  }
  const digitWidth = distinct[0];
  console.log(
    `    tabular digit = ${digitWidth}u; without tnum there are ` +
      `${proportional.length} widths spanning ${Math.min(...proportional)}-${Math.max(...proportional)}u`,
  );

  // 2. Right-aligned rendering. Widths may differ only by whole digits.
  const widths = SAMPLES.map((s) => widthOf(font, s, ['tnum']));
  const field = Math.max(...widths);
  const scale = field / 44;
  for (const [i, sample] of SAMPLES.entries()) {
    const pad = ' '.repeat(Math.round((field - widths[i]) / scale));
    console.log(`      ${pad}${bar(widths[i], scale)}  ${sample.padStart(10)}  ${widths[i]}u`);
  }
  for (const w of widths) {
    const delta = field - w;
    if (delta % digitWidth !== 0) {
      fail(
        `${label}: a width difference of ${delta}u is not a whole number of ` +
          `${digitWidth}u digits, so right-aligned columns will not line up.`,
      );
    }
  }

  // 3. The shared trailing run must sit at identical offsets from the right edge.
  const suffix = ',500'.length;
  const offsets = SAMPLES.map((s) =>
    columns(font, s, ['tnum'])
      .slice(-suffix)
      .map((col) => col.fromRight),
  );
  const [first, ...rest] = offsets;
  if (rest.some((o) => JSON.stringify(o) !== JSON.stringify(first))) {
    fail(`${label}: trailing digits do not share right-edge offsets ${JSON.stringify(offsets)}.`);
  } else {
    console.log(
      `      trailing "${',500'}" sits at ${JSON.stringify(first)}u from the right in all three`,
    );
  }
}

async function checkArabic(file, label) {
  const font = fontkit.openSync(join(fontsRoot, file));
  const widths = [...new Set(DIGITS.map((d) => widthOf(font, d.repeat(10), []) / 10))];
  console.log(`\n  ${label}`);
  console.log(`    ${file}  (${font.type})`);
  console.log(
    `    digits are ${widths.length === 1 ? `already monospaced at ${widths[0]} units` : 'proportional'}`,
  );
  const latin = fontkit.openSync(join(fontsRoot, 'web/plus-jakarta-sans-variable.woff2'));
  const latinWidth = widthOf(latin, '0'.repeat(10), ['tnum']) / 10;
  if (widths.length === 1 && widths[0] !== latinWidth) {
    notes.add(
      `${label}: tabular digit is ${widths[0]}u against Plus Jakarta Sans' ${latinWidth}u. ` +
        `Never mix the two inside one numeric column - always render prices in Plus Jakarta Sans.`,
    );
  }
}

async function main() {
  const manifest = JSON.parse(await readFile(join(fontsRoot, 'manifest.json'), 'utf8'));
  const byId = Object.fromEntries(manifest.families.map((f) => [f.id, f]));

  console.log('Tabular numeral verification');
  console.log('='.repeat(60));

  const latin = byId['plus-jakarta-sans'];
  // fontkit cannot instance a variable WOFF2, so the web font is checked at its
  // default instance (400) and per-weight coverage comes from the static cuts -
  // which are instances of the same source, and are what mobile ships.
  await checkLatin(`web/${latin.web.file}`, 'Plus Jakarta Sans - web (variable, default 400)');
  for (const s of latin.mobile) {
    await checkLatin(`mobile/${s.file}`, `Plus Jakarta Sans - static ${s.name} (${s.weight})`);
  }

  const arabic = byId['noto-naskh-arabic'];
  await checkArabic(`web/${arabic.web.file}`, 'Noto Naskh Arabic - web (variable)');

  console.log(`\n${'='.repeat(60)}`);
  for (const note of notes) console.log(`  NOTE  ${note}`);
  if (failures.length) {
    console.log('');
    for (const f of failures) console.log(`  FAIL  ${f}`);
    console.log(`\n${failures.length} failure(s).`);
    process.exitCode = 1;
    return;
  }
  console.log('\n  All numeral checks passed - price columns are safe.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
