#!/usr/bin/env node
/**
 * Fails CI when a component's gzipped size grows more than 10% against the
 * baseline committed at `bundle-size-baseline.json` (repo root, refreshed
 * as part of every release - see the v0.9.0 checklist and CHANGELOG entry
 * this file's own comment points back to).
 *
 * "Naik >10% tanpa alasan" - an increase past the threshold is not an
 * automatic fail if it is a DOCUMENTED one: list the component in
 * `bundle-size-exceptions.json` (repo root) with a one-line reason, and
 * this script downgrades that specific component from a failure to a
 * printed note. Deleting the exception line is how the next baseline
 * refresh re-arms the check for that component.
 *
 * Usage: node scripts/compare-bundle-size.mjs <baseline.json> <current.json>
 */
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const THRESHOLD_PCT = 10;

const [, , baselinePath, currentPath] = process.argv;
if (!baselinePath || !currentPath) {
  console.error('Usage: node scripts/compare-bundle-size.mjs <baseline.json> <current.json>');
  process.exit(2);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

async function readExceptions() {
  try {
    return await readJson(resolve(process.cwd(), 'bundle-size-exceptions.json'));
  } catch {
    return {};
  }
}

async function main() {
  const [baseline, current, exceptions] = await Promise.all([
    readJson(baselinePath),
    readJson(currentPath),
    readExceptions(),
  ]);

  const baselineByName = new Map(baseline.map((r) => [r.name, r]));
  let failed = false;
  const rows = [];

  for (const entry of current) {
    const before = baselineByName.get(entry.name);
    if (!before) {
      rows.push({
        name: entry.name,
        status: 'new',
        detail: `${(entry.gzipped / 1024).toFixed(1)} kB`,
      });
      continue;
    }
    const pct = ((entry.gzipped - before.gzipped) / before.gzipped) * 100;
    if (pct <= THRESHOLD_PCT) {
      if (pct > 0) {
        rows.push({ name: entry.name, status: 'ok', detail: `+${pct.toFixed(1)}%` });
      }
      continue;
    }
    const reason = exceptions[entry.name];
    if (reason) {
      rows.push({
        name: entry.name,
        status: 'accepted',
        detail: `+${pct.toFixed(1)}% - ${reason}`,
      });
    } else {
      rows.push({
        name: entry.name,
        status: 'FAIL',
        detail: `+${pct.toFixed(1)}% (threshold ${THRESHOLD_PCT}%)`,
      });
      failed = true;
    }
  }

  const removed = [...baselineByName.keys()].filter(
    (name) => !current.some((r) => r.name === name),
  );
  for (const name of removed) rows.push({ name, status: 'removed', detail: '' });

  if (rows.length === 0) {
    console.log('bundle-size: no changes against baseline.');
  } else {
    console.log('bundle-size diff against baseline:\n');
    for (const row of rows) {
      console.log(`  [${row.status.padEnd(9)}] ${row.name.padEnd(20)} ${row.detail}`);
    }
  }

  if (failed) {
    console.log(
      `\nOne or more components grew more than ${THRESHOLD_PCT}% without an entry in ` +
        `bundle-size-exceptions.json. Either bring the size back down, or add ` +
        `{ "ComponentName": "why" } to that file if the growth is deliberate and reviewed.`,
    );
    process.exitCode = 1;
  }
}

main();
