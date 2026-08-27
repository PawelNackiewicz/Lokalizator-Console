import js from '@eslint/js';
import prettier from 'eslint-config-prettier';
import tseslint from 'typescript-eslint';

/**
 * Wspólna baza dla całego monorepo: reguły JS/TS + wyłączenie reguł
 * kolidujących z Prettierem. Linting jest type-aware (`projectService`),
 * więc każdy pakiet musi mieć poprawny tsconfig.json w swoim rootcie.
 *
 * @type {import('typescript-eslint').ConfigArray}
 */
export const baseConfig = tseslint.config(
  {
    ignores: ['**/dist/**', '**/build/**', '**/node_modules/**', '**/.turbo/**', '**/coverage/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd(),
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'smart'],
    },
  },
  {
    // Pliki konfiguracyjne żyją poza `tsconfig.json` aplikacji.
    files: ['**/*.config.{js,mjs,cjs}', '**/eslint.config.js'],
    extends: [tseslint.configs.disableTypeChecked],
    rules: { 'no-console': 'off' },
  },
  prettier,
);

export default baseConfig;
