import { reactConfig } from '@lokalizator/eslint-config/react';

export default [
  { ignores: ['dist', 'src/routeTree.gen.ts'] },
  ...reactConfig,
  {
    files: ['src/routes/**/*.tsx'],
    rules: {
      // Pliki tras eksportują `Route` obok komponentu — to wymagany kształt
      // API TanStack Routera, nie błąd Fast Refresh.
      'react-refresh/only-export-components': 'off',
      // `throw redirect(...)` to mechanizm przerywania nawigacji w TanStack
      // Routerze; zwracany obiekt dziedziczy po `Response`, nie po `Error`.
      '@typescript-eslint/only-throw-error': [
        'error',
        {
          allow: [{ from: 'package', package: '@tanstack/router-core', name: ['Redirect'] }],
        },
      ],
    },
  },
  {
    // Komponenty skopiowane z shadcn/ui celowo eksportują warianty cva
    // obok samego komponentu — nie modyfikujemy ich kształtu.
    files: ['src/components/ui/**/*.tsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
];
