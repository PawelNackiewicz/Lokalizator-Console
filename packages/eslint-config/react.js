import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import { baseConfig } from './base.js';

/**
 * Konfiguracja dla aplikacji React + Vite (apps/web).
 *
 * `configs.flat['recommended-latest']` to wariant flat-config wtyczki
 * react-hooks — klucz `configs['recommended-latest']` jest w formacie eslintrc
 * i ESLint 9 go odrzuca.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const reactConfig = tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    ...reactHooks.configs.flat['recommended-latest'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser,
    },
    plugins: {
      'react-refresh': reactRefresh,
    },
    rules: {
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
);

export default reactConfig;
