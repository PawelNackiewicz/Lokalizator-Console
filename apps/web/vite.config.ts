import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/** Cały monorepo dzieli jeden .env w rootcie repo. */
const envDir = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  // Trzeci argument '' = wczytaj wszystkie zmienne, nie tylko VITE_*.
  // Potrzebujemy WEB_PORT do konfiguracji dev servera; do bundla i tak trafią
  // wyłącznie zmienne z prefiksem VITE_.
  const env = loadEnv(mode, envDir, '');

  return {
    envDir,
    plugins: [
      // Musi być PRZED pluginem React — generuje routeTree.gen.ts z src/routes/.
      tanstackRouter({ target: 'react', autoCodeSplitting: true }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: Number(env.WEB_PORT ?? 5173),
      // Bez tego Vite po cichu wybrałby inny port, a CORS/WEB_ORIGIN by się rozjechał.
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          // Zależności zmieniają się rzadziej niż kod aplikacji — własne chunki
          // pozwalają przeglądarce zachować je w cache między wdrożeniami.
          manualChunks: {
            tanstack: ['@tanstack/react-router', '@tanstack/react-query'],
            leaflet: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
  };
});
