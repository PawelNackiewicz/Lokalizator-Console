import globals from 'globals';
import tseslint from 'typescript-eslint';

import { baseConfig } from './base.js';

/**
 * Config for the NestJS app (apps/api).
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
    // Nest decorators (@Injectable, @Controller) carry no types of their own and
    // parameter metadata is often seen as "unsafe", so these rules produce noise
    // without real value here.
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    // CLI scripts (migrate/seed) have to report progress on stdout.
    'no-console': 'off',
  },
});

export default nestConfig;
