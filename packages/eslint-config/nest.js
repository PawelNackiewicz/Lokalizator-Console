import globals from 'globals';
import tseslint from 'typescript-eslint';

import { baseConfig } from './base.js';

/**
 * Konfiguracja dla aplikacji NestJS (apps/api).
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const nestConfig = tseslint.config(...baseConfig, {
  files: ['**/*.ts'],
  languageOptions: {
    globals: globals.node,
    sourceType: 'commonjs',
  },
  rules: {
    // Dekoratory Nest (@Injectable, @Controller) same w sobie nie niosą typów,
    // a metadane parametrów bywają widziane jako "unsafe" — te reguły generują
    // wtedy szum bez realnej wartości.
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // Skrypty CLI (migrate/seed) muszą raportować postęp na stdout.
    'no-console': 'off',
  },
});

export default nestConfig;
