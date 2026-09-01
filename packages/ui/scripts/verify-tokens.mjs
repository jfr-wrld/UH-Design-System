#!/usr/bin/env node
/**
 * Fails if any component stylesheet contains a literal design value.
 *
 * Phase 3 rule 1: every value comes from a token. This makes that checkable
 * rather than aspirational - a stray `#107A71` or `12px` fails CI instead of
 * quietly drifting away from the token layer.
 *
 * Comments are stripped first, so prose may still cite concrete values (and
 * should - "orange-600 would drop that pairing to 3.87:1" is worth writing down).
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const srcRoot = join(packageRoot, 'src');

/** Literal values that must come from a token instead. */
const FORBIDDEN = [
  { name: 'hex colour', re: /#[0-9a-fA-F]{3,8}\b/g },
  { name: 'px length', re: /(?<![\w-])\d*\.?\d+px\b/g },
  { name: 'rem length', re: /(?<![\w-])\d*\.?\d+rem\b/g },
  { name: 'em length', re: /(?<![\w-])\d*\.?\d+em\b/g },
  { name: 'duration', re: /(?<![\w-])\d*\.?\d+m?s\b/g },
  { name: 'rgb()/hsl() colour', re: /\b(?:rgba?|hsla?)\(/g },
];

/**
 * Values that are structural rather than design decisions: a full turn, a
 * half-offset, a zero. These carry no brand meaning and have no token.
 *
 * `@container (min-width: 350px)` is a different kind of exception: it IS
 * a design value (350 = `size.modal.sm`'s 400px minus the modal panel's
 * own padding and border), but a container-query condition is evaluated
 * before custom properties resolve, so a `var()` reference is invalid CSS
 * there and silently drops the whole rule (confirmed against this
 * package's own build). See Modal.css's own comment on the same line for
 * the full story, including why it is 350 and not 400 - if
 * `size.modal.sm` ever changes, this line has to change with it by hand.
 */
const ALLOWED_LINES = [
  /rotate\(360deg\)/,
  /translateY\(-50%\)/,
  /inset\(50%\)/,
  /@container \(min-width: 350px\)/,
];

async function cssFiles(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true, recursive: true })) {
    if (entry.isFile() && entry.name.endsWith('.css')) {
      found.push(join(entry.parentPath ?? entry.path, entry.name));
    }
  }
  return found;
}

/** Blank out comments but keep line numbering intact. */
const stripComments = (css) =>
  css.replace(/\/\*[\s\S]*?\*\//g, (match) => match.replace(/[^\n]/g, ' '));

async function main() {
  const files = await cssFiles(srcRoot);
  const failures = [];

  for (const file of files) {
    const source = stripComments(await readFile(file, 'utf8'));
    source.split('\n').forEach((line, index) => {
      if (ALLOWED_LINES.some((allowed) => allowed.test(line))) return;
      for (const { name, re } of FORBIDDEN) {
        for (const match of line.matchAll(re)) {
          failures.push(
            `${relative(packageRoot, file)}:${index + 1}  ${name} "${match[0]}"\n` +
              `    ${line.trim()}`,
          );
        }
      }
    });
  }

  console.log(`Checked ${files.length} stylesheet(s) for hardcoded design values.`);
  if (failures.length) {
    console.log('');
    for (const failure of failures) console.log(`  FAIL  ${failure}`);
    console.log(`\n${failures.length} literal value(s) found. Use a token instead.`);
    process.exitCode = 1;
    return;
  }
  console.log('  All values resolve to tokens.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
