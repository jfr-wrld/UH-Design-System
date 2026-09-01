#!/usr/bin/env node
/**
 * lint:ds - the guard that keeps a design system honest without a person
 * reviewing every PR by hand.
 *
 * Portable by design: run it inside this monorepo (it finds packages/ui and
 * packages/tokens on its own) OR drop it into any consuming app's repo and
 * point it at that app's own source with `--dir`. An app repo has no
 * packages/tokens to run contrast checks against, and no components that
 * are meant to ship a .stories.tsx of their own - those two checks degrade
 * to a skipped note instead of a hard failure when their prerequisites
 * are not found, so the same script is useful in both places without a
 * config file to keep in sync between them.
 *
 * Usage:
 *   node scripts/lint-ds.mjs                  scan the whole repo from cwd
 *   node scripts/lint-ds.mjs --dir apps/web    scan one directory
 *   node scripts/lint-ds.mjs --json            machine-readable, for CI
 *
 * Exit code is 1 if anything failed, 0 otherwise - wire this into CI as a
 * required check, and into a pre-commit hook for fast local feedback.
 */
import { readFile, readdir, stat } from 'node:fs/promises';
import { join, relative, extname, dirname, basename } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

const args = process.argv.slice(2);
const jsonOutput = args.includes('--json');
const dirFlagIndex = args.indexOf('--dir');
const scanRoot = dirFlagIndex >= 0 ? args[dirFlagIndex + 1] : process.cwd();

const SKIP_DIRS = new Set([
  'node_modules',
  'dist',
  'build',
  'storybook-static',
  '.git',
  '.next',
  '.turbo',
  'coverage',
  '.changeset',
]);

const SOURCE_EXT = new Set(['.ts', '.tsx', '.js', '.jsx']);
const STYLE_EXT = new Set(['.css']);

async function walk(dir, out = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name) || entry.name.startsWith('.')) continue;
      await walk(join(dir, entry.name), out);
    } else {
      out.push(join(dir, entry.name));
    }
  }
  return out;
}

/** One finding: a rule id, a human message, and the file/line it lives at. */
function finding(rule, file, line, message) {
  return { rule, file: relative(scanRoot, file), line, message };
}

const findings = [];
let filesScanned = 0;

/*
 * Token-literal checks. These intentionally do NOT exempt the design
 * system's own token-definition files (packages/tokens) - those hold hex
 * values by design, so this rule set is meant to run over consuming
 * component/style code, not the token source itself. Point --dir at
 * packages/ui/src or an app's own src/ to scan the code that should never
 * contain a literal.
 */
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g;
/*
 * The lookahead sits directly after the colon, with no `\s*` in between it
 * and the property name: a quantifier placed before a lookahead is free to
 * backtrack to zero width to make the assertion pass, which silently turns
 * "not followed by var(" into "there exists SOME split of the whitespace
 * that isn't followed by var(" - true for literally every `var(...)` value,
 * since backtracking to 0 leaves the space itself in front of "var(". Each
 * lookahead below absorbs the optional whitespace itself instead, so there
 * is nothing left for the engine to backtrack around.
 */
/*
 * `z-index: 0;`/`z-index: 1;` are exempted: a bare 0 or 1 shows up as a
 * local micro-stacking order between two children of the same component
 * (see Card.css - the hit-area under the content, the content above it),
 * not a page-level layer that belongs on the shared --uh-z-index-* scale.
 * `box-shadow: 0 0 0 <token> <token>` is exempted too - the ring-around-an-
 * element technique (see Avatar.css), where the offsets are geometry, not
 * a design value, and both real values (width, color) are already tokens.
 */
const Z_INDEX_RE = /z-index:(?!\s*var\(|\s*0;|\s*1;)\s*[^;]+;/g;
const BOX_SHADOW_RE = /box-shadow:(?!\s*var\(|\s*none\b|\s*0 0 0 var\()\s*[^;]+;/g;
const BORDER_RADIUS_RE = /border-radius:(?!\s*var\(|\s*0\b|\s*inherit\b)\s*[^;]+;/g;
const TO_LOCALE_STRING_RE = /\.toLocaleString\(/g;
const TO_FIXED_RE = /\.toFixed\(/g;
/*
 * `prefers-reduced-motion`/`prefers-color-scheme`/`prefers-contrast` are OS
 * accessibility preferences, not layout breakpoints - there is no "shared
 * breakpoint constant" that could replace them, and a JS hook would be
 * strictly worse here (it cannot see the OS preference before first paint
 * the way CSS can). The ban is for viewport-width breakpoints specifically.
 */
const MEDIA_QUERY_RE = /@media\s*\((?!\s*prefers-)/g;

function lineOf(content, index) {
  return content.slice(0, index).split('\n').length;
}

/*
 * Strips comments before any token/format check runs, so a hex value or a
 * `.toFixed(` cited in prose (this codebase's own CSS is full of contrast-
 * ratio comments quoting exact hex pairs) never reads as a violation. Naive
 * on purpose - it does not understand strings or regex literals containing
 * `/*`/`//`, which could theoretically eat real code, but every check here
 * only cares about matches that remain after stripping, and a false
 * negative (missing a violation hidden inside an unusual string literal) is
 * the safe failure direction for a lint rule, not a false positive.
 */
function stripComments(content, isStyle) {
  let out = content.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  if (!isStyle) {
    out = out.replace(/(^|[^:])\/\/.*$/gm, (m, prefix) => prefix + '');
  }
  return out;
}

async function checkFile(file) {
  const ext = extname(file);
  if (!SOURCE_EXT.has(ext) && !STYLE_EXT.has(ext)) return;
  if (file.endsWith('.stories.tsx') || file.endsWith('.stories.ts')) return;
  if (file.endsWith('.test.tsx') || file.endsWith('.test.ts')) return;
  if (file.endsWith('.d.ts')) return;

  const rawContent = await readFile(file, 'utf8');
  filesScanned += 1;
  const content = stripComments(rawContent, STYLE_EXT.has(ext));

  /*
   * SocialButton/icons.tsx is the one deliberate exception to "never a
   * hex literal": Facebook/Twitter/LinkedIn/Discord/WhatsApp blue-ish and
   * the four Google brand colours are real, external, legally-fixed brand
   * identifiers, not a design choice this system's own palette could
   * express - there is no --uh-color-facebook the same way there is no
   * --uh-color-google-red. Every other component still owns none of this;
   * see that file's own top-of-file comment for the fuller reasoning.
   */
  const skipHexCheck = file.endsWith('SocialButton/icons.tsx');
  if (!skipHexCheck) {
    for (const m of content.matchAll(HEX_RE)) {
      findings.push(
        finding(
          'no-hex-literal',
          file,
          lineOf(content, m.index),
          `Hardcoded color ${m[0]} - use a token.`,
        ),
      );
    }
  }
  if (STYLE_EXT.has(ext)) {
    for (const m of content.matchAll(Z_INDEX_RE)) {
      findings.push(
        finding(
          'no-raw-z-index',
          file,
          lineOf(content, m.index),
          `Raw z-index - use var(--uh-z-index-*).`,
        ),
      );
    }
    for (const m of content.matchAll(BOX_SHADOW_RE)) {
      findings.push(
        finding(
          'no-raw-box-shadow',
          file,
          lineOf(content, m.index),
          `Raw box-shadow - use var(--uh-elevation-*).`,
        ),
      );
    }
    for (const m of content.matchAll(BORDER_RADIUS_RE)) {
      findings.push(
        finding(
          'no-raw-border-radius',
          file,
          lineOf(content, m.index),
          `Raw border-radius - use var(--uh-radius-*).`,
        ),
      );
    }
    for (const m of content.matchAll(MEDIA_QUERY_RE)) {
      findings.push(
        finding(
          'no-manual-media-query',
          file,
          lineOf(content, m.index),
          `Manual @media - use the useMediaQuery hook and the shared breakpoint constants instead, ` +
            `so responsive behaviour stays JS-driven and testable rather than duplicated per stylesheet.`,
        ),
      );
    }
  }
  if (SOURCE_EXT.has(ext)) {
    for (const m of content.matchAll(TO_LOCALE_STRING_RE)) {
      findings.push(
        finding(
          'no-manual-number-format',
          file,
          lineOf(content, m.index),
          `.toLocaleString() - use the design system's Intl-based formatter (formatMoney/formatCount/` +
            `formatDistance) instead of formatting a number by hand.`,
        ),
      );
    }
    for (const m of content.matchAll(TO_FIXED_RE)) {
      findings.push(
        finding(
          'no-manual-number-format',
          file,
          lineOf(content, m.index),
          `.toFixed() - use the design system's Intl-based formatter instead of formatting a number by hand.`,
        ),
      );
    }
  }
}

/*
 * Component-story coverage. Only meaningful for a design-system-shaped
 * folder: ComponentName/ComponentName.tsx next to a matching .stories.tsx.
 * A consuming app's own feature components are not held to this - it is
 * the DS repo's own contract with itself, not something to impose on every
 * downstream app. Detected structurally (component dir name matches its
 * main file name) rather than hardcoded to packages/ui, so it still works
 * if a consumer keeps their own small internal component library the same
 * way.
 */
async function checkComponentStories(allFiles) {
  const componentDirs = new Map();
  for (const file of allFiles) {
    const ext = extname(file);
    if (ext !== '.tsx') continue;
    if (file.includes('.stories.') || file.includes('.test.')) continue;
    const dir = dirname(file);
    const dirName = basename(dir);
    const fileName = basename(file, '.tsx');
    if (fileName !== dirName) continue; // not the "ComponentName/ComponentName.tsx" shape
    if (!/^[A-Z]/.test(fileName)) continue; // not a component (not PascalCase)
    componentDirs.set(dir, { file, fileName });
  }

  if (componentDirs.size === 0) {
    return { checked: 0, skipped: true };
  }

  for (const [dir, { file, fileName }] of componentDirs) {
    const storiesFile = join(dir, `${fileName}.stories.tsx`);
    let hasStories = false;
    let storyCount = 0;
    try {
      const storiesContent = await readFile(storiesFile, 'utf8');
      hasStories = true;
      storyCount = (storiesContent.match(/^export const [A-Za-z]+: Story/gm) ?? []).length;
    } catch {
      // hasStories stays false - no .stories.tsx sibling to read.
    }

    if (!hasStories) {
      findings.push(
        finding(
          'component-missing-stories',
          file,
          1,
          `${fileName} has no ${fileName}.stories.tsx.`,
        ),
      );
      continue;
    }

    const content = await readFile(file, 'utf8');
    const looksInteractive = /onClick=|onChange=|onKeyDown=|role="button"|<button|<input/i.test(
      content,
    );
    if (looksInteractive && storyCount < 2) {
      findings.push(
        finding(
          'interactive-component-thin-stories',
          file,
          1,
          `${fileName} looks interactive but its stories file only exports ${storyCount} ` +
            `stor${storyCount === 1 ? 'y' : 'ies'} - a real state matrix (default/hover/focus/disabled/etc.) ` +
            `is expected for anything the pilgrim can click or type into.`,
        ),
      );
    }
  }

  return { checked: componentDirs.size, skipped: false };
}

/*
 * Contrast test. Shells out to the token package's own verify-contrast.mjs
 * if this looks like the design system repo itself; skipped with a note
 * anywhere else, since an app repo has no token source to check contrast
 * contracts against - it consumes the DS's already-verified colors.
 */
async function checkContrast() {
  const candidate = join(scanRoot, 'packages', 'tokens', 'scripts', 'verify-contrast.mjs');
  try {
    await stat(candidate);
  } catch {
    return {
      ran: false,
      reason: 'packages/tokens/scripts/verify-contrast.mjs not found - skipped.',
    };
  }
  try {
    await run(process.execPath, [candidate], { cwd: dirname(dirname(candidate)) });
    return { ran: true, passed: true };
  } catch (error) {
    findings.push({
      rule: 'contrast-contract',
      file: relative(scanRoot, candidate),
      line: null,
      message: `Contrast verification failed: ${(error.stdout || error.message || '').toString().trim().slice(-500)}`,
    });
    return { ran: true, passed: false };
  }
}

async function main() {
  const allFiles = await walk(scanRoot);

  for (const file of allFiles) {
    await checkFile(file);
  }

  const storyCoverage = await checkComponentStories(allFiles);
  const contrast = await checkContrast();

  if (jsonOutput) {
    console.log(
      JSON.stringify({ scanRoot, filesScanned, findings, storyCoverage, contrast }, null, 2),
    );
  } else {
    console.log(
      `lint:ds - scanned ${filesScanned} files under ${relative(process.cwd(), scanRoot) || '.'}\n`,
    );

    if (findings.length === 0) {
      console.log('  All checks passed.');
    } else {
      const byRule = new Map();
      for (const f of findings) {
        if (!byRule.has(f.rule)) byRule.set(f.rule, []);
        byRule.get(f.rule).push(f);
      }
      for (const [rule, items] of byRule) {
        console.log(`  ${rule} (${items.length}):`);
        for (const item of items.slice(0, 20)) {
          const loc = item.line ? `${item.file}:${item.line}` : item.file;
          console.log(`    ${loc} - ${item.message}`);
        }
        if (items.length > 20) console.log(`    ... and ${items.length - 20} more`);
      }
    }

    console.log(
      `\n  component-story coverage: ${storyCoverage.skipped ? 'skipped (no ComponentName/ComponentName.tsx shape found)' : `${storyCoverage.checked} component(s) checked`}`,
    );
    console.log(
      `  contrast contract: ${contrast.ran ? (contrast.passed ? 'passed' : 'FAILED') : contrast.reason}`,
    );
  }

  if (findings.length > 0) {
    process.exitCode = 1;
  }
}

main();
