#!/usr/bin/env node
/**
 * Per-component bundle size report.
 *
 * Bundles a one-line virtual entry ("export { X } from '../dist/index.js'")
 * through esbuild with real tree-shaking and minification, for every named
 * export in the shipped ESM artifact - the same thing a consumer's own
 * bundler does when they write `import { Button } from '@umrahhaji/ui'`.
 * Measured against `dist/index.js`, not `src/`, because dist is what
 * actually ships; a source-level bundle can tree-shake differently than the
 * already-rolled-up artifact a real app resolves.
 *
 * `react`/`react-dom`/`@tailgrids/icons`/`recharts` are external (peer
 * dependencies, never bundled into a consumer's copy - see the `external`
 * comment in vite.config.ts for why) so the numbers below are this
 * library's own weight, not React's, the icon pack's, or the charting
 * library's.
 *
 * `define: { 'process.env.NODE_ENV': '"production"' }` is not optional.
 * Every component sets `X.displayName` guarded by
 * `if (process.env.NODE_ENV !== 'production')` (see any component's source
 * for why - an unconditional property write is a bundler-visible side
 * effect that pins the whole library file together otherwise, and this
 * script is exactly how that was first found: every component measured
 * identically at ~117 kB before the guard existed). A real app's production
 * build always replaces this constant through its own bundler; this define
 * reproduces that so the numbers below are what actually ships, not an
 * artifact of NODE_ENV being left as a live variable in an ad-hoc script.
 *
 * Usage:
 *   node scripts/bundle-size.mjs            human-readable table
 *   node scripts/bundle-size.mjs --json     machine-readable, for CI's >10% check
 */
import { build } from 'esbuild';
import { gzipSync } from 'node:zlib';
import { mkdtemp, rm, writeFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const distEntry = join(packageRoot, 'dist', 'index.js');

/*
 * Components only - the visual surface a consumer picks from. Hooks
 * (useControllableState, useFocusTrap, useScrollLock, useToast) and plain
 * utility functions (formatMoney, formatDateShort, parsePhone, ...) are
 * excluded: they are a handful of bytes each and reporting them beside a
 * 40-component table would bury the numbers that matter for a "did this
 * component regress" review. Kept as an explicit list rather than scraped
 * from the dist's exports, so a genuinely unusual export (a constant, a
 * label map) does not silently get measured as if it were a component.
 */
const COMPONENTS = [
  'Accordion',
  'AgencyCard',
  'Alert',
  'AspectRatio',
  'Avatar',
  'Badge',
  'BookingStatusTracker',
  'BottomSheet',
  'Breadcrumbs',
  'Button',
  'ButtonGroup',
  'Card',
  'Carousel',
  'Chart',
  'Checkbox',
  'Chip',
  'Collapsible',
  'Command',
  'CommandDialog',
  'Container',
  'CurrencyInput',
  'DateField',
  'DatePicker',
  'DateRangePicker',
  'Drawer',
  'Dropdown',
  'EmptyState',
  'ErrorState',
  'FileUpload',
  'FilterPanel',
  'Grid',
  'HotelCard',
  'Input',
  'ItineraryTimeline',
  'List',
  'Modal',
  'NativeSelect',
  'NumberStepper',
  'OTPInput',
  'Overlay',
  'PackageCard',
  'Pagination',
  'PhoneInput',
  'Popover',
  'PriceBreakdown',
  'PriceDisplay',
  'ProgressBar',
  'Radio',
  'Rating',
  'ReviewCard',
  'ScrollArea',
  'SearchCombobox',
  'Select',
  'Separator',
  'Skeleton',
  'Slider',
  'SocialButton',
  'Spinner',
  'Stack',
  'Switch',
  'Table',
  'Tabs',
  'TextArea',
  'TimeField',
  'TimePicker',
  'ToastProvider',
  'Tooltip',
];

/** Anything past this many minified+gzipped kB gets flagged in the report. */
const UNUSUAL_KB = 8;

function kb(bytes) {
  return bytes / 1024;
}

async function measure(name, workDir) {
  const entryFile = join(workDir, `${name}.entry.js`);
  await writeFile(entryFile, `export { ${name} } from ${JSON.stringify(distEntry)};\n`);

  const result = await build({
    entryPoints: [entryFile],
    bundle: true,
    minify: true,
    treeShaking: true,
    format: 'esm',
    platform: 'browser',
    write: false,
    external: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      '@tailgrids/icons',
      'recharts',
      '@base-ui/react/scroll-area',
      '@base-ui/react/slider',
    ],
    logLevel: 'silent',
    define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  });

  const code = result.outputFiles[0].contents;
  const minified = code.byteLength;
  const gzipped = gzipSync(code).byteLength;
  return { name, minified, gzipped };
}

async function main() {
  try {
    await stat(distEntry);
  } catch {
    console.error(`[bundle-size] ${distEntry} does not exist - run \`pnpm build\` first.`);
    process.exitCode = 1;
    return;
  }

  const workDir = await mkdtemp(join(tmpdir(), 'uh-bundle-size-'));
  const results = [];
  for (const name of COMPONENTS) {
    try {
      results.push(await measure(name, workDir));
    } catch (error) {
      console.error(`[bundle-size] Failed to bundle ${name}: ${error.message ?? error}`);
      process.exitCode = 1;
    }
  }
  await rm(workDir, { recursive: true, force: true });

  results.sort((a, b) => b.gzipped - a.gzipped);

  if (process.argv.includes('--json')) {
    console.log(JSON.stringify(results, null, 2));
    return;
  }

  const nameWidth = Math.max(...results.map((r) => r.name.length), 'Component'.length);
  console.log(
    `${'Component'.padEnd(nameWidth)}  ${'Minified'.padStart(10)}  ${'Gzipped'.padStart(9)}`,
  );
  console.log('-'.repeat(nameWidth + 24));
  for (const r of results) {
    const flag = kb(r.gzipped) > UNUSUAL_KB ? '  ⚠ unusually large' : '';
    console.log(
      `${r.name.padEnd(nameWidth)}  ${kb(r.minified).toFixed(1).padStart(8)} kB  ${kb(r.gzipped).toFixed(1).padStart(7)} kB${flag}`,
    );
  }

  const totalGzip = results.reduce((sum, r) => sum + r.gzipped, 0);
  const avgGzip = totalGzip / results.length;
  console.log('-'.repeat(nameWidth + 24));
  console.log(
    `${results.length} components - average ${kb(avgGzip).toFixed(1)} kB gzipped, ` +
      `largest ${results[0].name} at ${kb(results[0].gzipped).toFixed(1)} kB`,
  );
}

main();
