import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    outDir: 'dist',
    emptyOutDir: false,
    sourcemap: true,
    lib: {
      entry: resolve(rootDir, 'src/index.ts'),
      // Both formats from one entry: ESM for bundlers that tree-shake (every
      // component stays import-separately-able because named exports plus
      // sideEffects: false in package.json is what tree-shaking actually
      // keys off, not which build format is loaded), CJS for anything that
      // still resolves packages via require() - a Jest config that hasn't
      // moved to ESM, an older Next.js version, a Node script.
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: {
      // @tailgrids/icons joins react/react-dom here for the same reason: it
      // is a real, independently-versioned multi-file package (each icon
      // its own module under dist/icons/, re-exported from one barrel), and
      // inlining it flattens all of it into this library's single
      // dist/index.js scope. Once flattened, every icon's module-level
      // function body becomes just another statement in one shared file,
      // and neither Rollup nor a consumer's later esbuild/webpack pass can
      // prove any of it has no side effects - so it (and everything
      // imported alongside it) gets kept regardless of which component
      // actually uses which icon. `pnpm bundle-size` is what caught this
      // originally (with the icon pack this project used before this one):
      // every component, including ones with no icon at all, measured
      // ~20 kB heavier the moment icons were inlined. Left external, a
      // consumer's own bundler resolves `@tailgrids/icons` fresh from
      // node_modules, where the real per-icon file boundaries are still
      // intact and tree-shake correctly. `recharts` and `@base-ui/react` are
      // external for the
      // identical reason - real, independently-versioned libraries, not
      // small per-component utilities - kept out of dist for the same
      // tree-shaking safety, even though only one component each uses
      // them today. `@base-ui/react` ships each primitive as its own
      // subpath (`/scroll-area`, `/slider`, ...), so every consumer of a
      // Base-UI-backed component is listed separately here rather than
      // externalizing the package root.
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        '@tailgrids/icons',
        'recharts',
        '@base-ui/react/scroll-area',
        '@base-ui/react/slider',
      ],
    },
  },
});
