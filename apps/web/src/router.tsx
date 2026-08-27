import { QueryClient } from '@tanstack/react-query';
import { createRouter } from '@tanstack/react-router';

import { routeTree } from './routeTree.gen';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // 401 nie jest błędem wartym ponawiania — obsługują go guardy tras.
      retry: false,
      staleTime: 30 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export const router = createRouter({
  routeTree,
  // QueryClient jest dostępny w `beforeLoad`/`loader` każdej trasy.
  context: { queryClient },
  defaultPreload: 'intent',
  scrollRestoration: true,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
