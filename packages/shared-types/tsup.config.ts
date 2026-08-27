import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  // Dual build: apps/api (NestJS) jest CommonJS, apps/web (Vite) jest ESM.
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  target: 'es2023',
});
