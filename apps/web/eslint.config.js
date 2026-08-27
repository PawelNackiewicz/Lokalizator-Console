import { reactConfig } from '@lokalizator/eslint-config/react';

export default [
  { ignores: ['dist', 'src/routeTree.gen.ts'] },
  ...reactConfig,
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      // Route files export `Route` next to the component — that is the shape the
      // TanStack Router API requires, not a Fast Refresh mistake.
      'react-refresh/only-export-components': 'off',
      // `throw redirect(...)` is how TanStack Router aborts navigation; the object
      // it returns extends `Response`, not `Error`.
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [{ from: 'package', package: '@tanstack/router-core', name: ['Redirect'] }],
        },
      ],
    },
  },
  {
    // Components copied from shadcn/ui intentionally export cva variants next to
    // the component itself — their shape is kept as-is.
    files: ['src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
];
