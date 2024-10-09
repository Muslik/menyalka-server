import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    alias: {
      '~': './src',
    },
    include: ['**/*.e2e-spec.ts'],
    globals: true,
    root: './',
  },
  resolve: {
    alias: {
      '~': './src',
    },
  },
  plugins: [swc.vite()],
});
