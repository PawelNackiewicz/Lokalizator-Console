import { createFileRoute, redirect } from '@tanstack/react-router';

/** Korzeń sekcji chronionej nie ma własnej treści — kierujemy na moduł szkół. */
export const Route = createFileRoute('/_authed/')({
  beforeLoad: () => {
    throw redirect({ to: '/schools' });
  },
});
