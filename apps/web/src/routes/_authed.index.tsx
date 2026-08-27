import { createFileRoute, redirect } from '@tanstack/react-router';

/** The root of the protected section has no content of its own — redirect to schools. */
export const Route = createFileRoute('/_authed/')({
  beforeLoad: () => {
    throw redirect({ to: '/schools' });
  },
});
