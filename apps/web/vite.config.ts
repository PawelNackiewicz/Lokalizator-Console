import { fileURLToPath } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

/** The whole monorepo shares one .env at the repo root. */
const envDir = fileURLToPath(new URL('../..', import.meta.url));

export default defineConfig(({ mode }) => {
  // Third argument '' = load every variable, not just VITE_*. WEB_PORT is needed
  // to configure the dev server; only VITE_-prefixed ones reach the bundle.
  const env = loadEnv(mode, envDir, '');

  return {
    envDir,
    plugins: [
      // Must come BEFORE the React plugin — it generates routeTree.gen.ts from src/routes/.
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
      // Without this Vite would silently pick another port and CORS/WEB_ORIGIN would drift.
      strictPort: true,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          // Dependencies change less often than app code — separate chunks let the
          // browser keep them cached across deployments.
          manualChunks: {
            tanstack: ['@tanstack/react-router', '@tanstack/react-query'],
            leaflet: ['leaflet', 'react-leaflet'],
          },
        },
      },
    },
  };
});
