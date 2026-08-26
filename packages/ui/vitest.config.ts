import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const rootDir = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: [resolve(rootDir, 'src/test/setup.ts')],
    // Component CSS is compiled separately by Tailwind; jsdom has no layout
    // engine, so loading it here would cost time and prove nothing.
    css: false,
    restoreMocks: true,
  },
});
