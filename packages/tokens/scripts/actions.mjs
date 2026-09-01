import { cp, mkdir, readdir, rm } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const webFonts = join(packageRoot, 'assets', 'fonts', 'web');

/**
 * Copies the subset web fonts into a `fonts/` directory beside the generated
 * stylesheets, matching the `./fonts/...` URLs in fonts.css.
 *
 * The binaries themselves are produced by `pnpm fonts:build` and committed;
 * this only moves them into the build output.
 */
export const copyFontsAction = {
  name: 'copy-fonts',
  do: async (_dictionary, platform) => {
    const target = join(platform.buildPath, 'fonts');
    /*
     * Cleaned before copying, not just created - a plain `mkdir` on an
     * already-existing `target` left a stale `manrope-variable.woff2`
     * sitting here (and, on a later `pnpm --filter @umrahhaji/ui build`,
     * fed straight into `cp -R ../tokens/build/css/fonts ./dist/fonts`,
     * which itself copies the whole source *directory* into an
     * already-existing destination rather than replacing it, nesting a
     * second `fonts/` folder inside) after the family it belonged to was
     * removed from fonts.config.mjs entirely - a leftover binary this
     * platform's own fonts.css no longer references, shipped for no
     * reason. Found swapping Manrope out for DM Sans.
     */
    await rm(target, { recursive: true, force: true });
    await mkdir(target, { recursive: true });
    for (const file of await readdir(webFonts)) {
      await cp(join(webFonts, file), join(target, file));
    }
  },
  undo: async (_dictionary, platform) => {
    await rm(join(platform.buildPath, 'fonts'), { recursive: true, force: true });
  },
};
