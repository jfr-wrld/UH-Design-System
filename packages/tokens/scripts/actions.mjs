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
    await mkdir(target, { recursive: true });
    for (const file of await readdir(webFonts)) {
      await cp(join(webFonts, file), join(target, file));
    }
  },
  undo: async (_dictionary, platform) => {
    await rm(join(platform.buildPath, 'fonts'), { recursive: true, force: true });
  },
};
