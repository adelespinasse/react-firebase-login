/// <reference types="vitest/config" />
import { join, resolve } from 'node:path';
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import banner from 'vite-plugin-banner';

import { dependencies, peerDependencies } from './package.json';

export default defineConfig({
  plugins: [
    react(),
    dts({ rollupTypes: true }), // Output .d.ts files
    banner(`// @aldel/react-firebase-login
// Copyright © 2025 Alan deLespinasse
// Dual license (See LICENSE.md for details):
// - Free use in applications with user-visible attribution
// - Paid license available without attribution`),
  ],
  build: {
    minify: true,
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
        ...Object.keys(dependencies),
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
