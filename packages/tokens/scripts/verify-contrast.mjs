#!/usr/bin/env node
/**
 * Re-checks every accessibility contract against the BUILT stylesheet.
 *
 * The token descriptions quote ratios computed at generation time. This reads
 * the other end of the pipeline - the emitted custom properties, with every
 * var() chain resolved per theme - so a broken reference or a mis-pointed
 * semantic token is caught rather than trusted.
 *
 * Run: pnpm --filter @umrahhaji/tokens test
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const cssPath = join(packageRoot, 'build', 'css', 'variables.css');

/* ------------------------------------------------------------ WCAG maths */

const channel = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};

function luminance(hex) {
  const h = hex.trim().replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrast(a, b) {
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* ------------------------------------------------------ stylesheet parsing */

/** Extract the body of the first block whose selector matches. */
function block(css, selector) {
  const start = css.indexOf(selector);
  if (start === -1) throw new Error(`selector not found: ${selector}`);
  let depth = 0;
  let i = css.indexOf('{', start);
  const open = i;
  for (; i < css.length; i += 1) {
    if (css[i] === '{') depth += 1;
    else if (css[i] === '}' && (depth -= 1) === 0) break;
  }
  return css.slice(open, i);
}

const declarations = (text) =>
  Object.fromEntries(
    [...text.matchAll(/(--uh-[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()]),
  );

function resolver(table) {
  return function resolve(name, seen = new Set()) {
    if (!(name in table)) throw new Error(`unknown custom property: ${name}`);
    if (seen.has(name)) throw new Error(`reference cycle at ${name}`);
    const value = table[name];
    const ref = /^var\((--uh-[a-z0-9-]+)\)$/.exec(value);
    return ref ? resolve(ref[1], new Set(seen).add(name)) : value;
  };
}

/* ---------------------------------------------------------------- contracts */

const FEEDBACK = ['success', 'warning', 'error', 'info'];
const STATUS = [
  'pending',
  'paid',
  'confirmed',
  'in-progress',
  'completed',
  'cancelled',
  'refunded',
];
const ACTIONS = ['primary', 'secondary', 'neutral', 'danger'];
const TEXT_ROLES = ['primary', 'secondary', 'tertiary', 'brand', 'accent', 'link', 'link-hover'];

/** WCAG 1.4.3 for text, 1.4.11 for UI components. */
const TEXT_MIN = 4.5;
const UI_MIN = 3;

async function main() {
  const css = await readFile(cssPath, 'utf8');
  const light = declarations(block(css, ':root {'));
  const dark = { ...light, ...declarations(block(css, "[data-theme='dark'] {")) };

  const failures = [];
  let checks = 0;

  for (const [mode, table] of [
    ['light', light],
    ['dark', dark],
  ]) {
    const get = resolver(table);
    const page = mode === 'light' ? '--uh-color-bg-surface' : '--uh-color-bg-canvas';
    // A form control sits on the card surface in both themes.
    const field = '--uh-color-bg-surface';

    const check = (fg, bg, min, label) => {
      checks += 1;
      const ratio = contrast(get(fg), get(bg));
      if (ratio < min) {
        failures.push(
          `${mode}: ${label} = ${ratio.toFixed(2)}:1 (need ${min}) [${get(fg)} on ${get(bg)}]`,
        );
      }
    };

    for (const role of TEXT_ROLES) {
      check(`--uh-color-text-${role}`, page, TEXT_MIN, `text.${role} on page`);
    }
    check('--uh-color-border-strong', page, UI_MIN, 'border.strong on page');
    check('--uh-color-border-focus', page, UI_MIN, 'border.focus on page');
    check('--uh-color-border-focus', field, UI_MIN, 'border.focus on field surface');

    for (const group of ACTIONS) {
      for (const state of ['default', 'hover', 'active']) {
        check(
          `--uh-color-action-${group}-label`,
          `--uh-color-action-${group}-${state}`,
          TEXT_MIN,
          `action.${group}.label on ${state}`,
        );
      }
    }

    for (const [group, roles] of [
      ['feedback', FEEDBACK],
      ['status', STATUS],
    ]) {
      for (const role of roles) {
        const base = `--uh-color-${group}-${role}`;
        check(`${base}-text`, `${base}-bg`, TEXT_MIN, `${group}.${role}: text on bg`);
        check(`${base}-on-solid`, `${base}-solid`, TEXT_MIN, `${group}.${role}: on-solid on solid`);
        check(`${base}-text`, page, TEXT_MIN, `${group}.${role}: text on page`);
      }
    }

    /*
     * Neutral text on a tinted feedback surface. Only primary and secondary are
     * contracted: text.tertiary is 4.76:1 on white but 4.37:1 on info-bg, so a
     * colour verified against bg.surface does not automatically survive being
     * moved onto a tint. Use the role's own `text` token on its own `bg`.
     */
    for (const role of FEEDBACK) {
      for (const text of ['primary', 'secondary']) {
        check(
          `--uh-color-text-${text}`,
          `--uh-color-feedback-${role}-bg`,
          TEXT_MIN,
          `text.${text} on feedback.${role}.bg`,
        );
      }
    }

    /*
     * The same trap on the brand tints. The calendar draws its range band with
     * bg.brand-subtle and leaves the day numbers in neutral text, so those two
     * pairings are load-bearing and must be contracted rather than assumed.
     * bg.muted carries disabled surfaces the same way.
     */
    for (const surface of ['bg-brand-subtle', 'bg-accent-subtle', 'bg-muted', 'bg-highlight']) {
      for (const text of ['primary', 'secondary']) {
        check(
          `--uh-color-text-${text}`,
          `--uh-color-${surface}`,
          TEXT_MIN,
          `text.${text} on ${surface.replace('bg-', 'bg.')}`,
        );
      }
    }

    // Only feedback roles carry an accessible control boundary.
    for (const role of FEEDBACK) {
      check(
        `--uh-color-feedback-${role}-border-strong`,
        field,
        UI_MIN,
        `feedback.${role}.border-strong on field surface`,
      );
    }
  }

  /* The rule the whole palette exists to protect. */
  const get = resolver(light);
  const orange = get('--uh-color-orange-500');
  checks += 1;
  if (contrast('#FFFFFF', orange) >= TEXT_MIN) {
    failures.push(`white on orange-500 unexpectedly passes - the prohibition is no longer real`);
  }

  /* The brand values must survive the pipeline byte for byte. */
  for (const [name, expected] of [
    ['--uh-color-teal-500', '#14958A'],
    ['--uh-color-orange-500', '#F17824'],
    ['--uh-color-neutral-950', '#0B1220'],
  ]) {
    checks += 1;
    const actual = get(name).toUpperCase();
    if (actual !== expected) failures.push(`${name} = ${actual}, expected ${expected}`);
  }

  console.log(`Contrast contracts: ${checks} checked across both themes.`);
  if (failures.length) {
    console.log('');
    for (const failure of failures) console.log(`  FAIL  ${failure}`);
    console.log(`\n${failures.length} contract(s) broken.`);
    process.exitCode = 1;
    return;
  }
  console.log('  All contracts hold.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
