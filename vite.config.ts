/// <reference types="vitest/config" />
import { join, resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

import { peerDependencies } from './package.json';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({ rollupTypes: true }), // Output .d.ts files
  ],
  build: {
    minify: false,
    lib: {
      entry: resolve(__dirname, join('lib', 'index.ts')),
      fileName: 'index',
      cssFileName: 'style',
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      // Exclude peer dependencies from the bundle to reduce bundle size AND to
      // avoid duplicating Firebase's global state, which breaks everything
      external: [
        'react/jsx-runtime',
        ...Object.keys(peerDependencies),
        /^@firebase\//,
        /^firebase\//,
      ],
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './lib/test/setup.ts',
    coverage: {
      all: false,
      enabled: true,
    },
  },
});
