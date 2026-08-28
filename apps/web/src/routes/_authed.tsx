import { Link, Outlet, createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { LogOut, School } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { fetchCurrentUser, useLogoutMutation } from '@/features/auth/auth.queries';

/**
 * This pathless route (`_authed`) guards the entire protected section: anything
 * that should require a session only needs to be nested underneath it.
 */
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context, location }) => {
    const user = await fetchCurrentUser(context.queryClient);

    if (!user) {
      throw redirect({ to: '/login', search: { redirect: location.href } });
    }

    // Goes into the route context — children read the user without their own query.
    return { user };
  },
  component: AuthedLayout,
});

function AuthedLayout() {
  const { user } = Route.useRouteContext();
  const router = useRouter();
  const logout = useLogoutMutation();

  async function handleLogout() {
    // `mutateAsync` settles only after `onSettled`, so the cache is already cleared
    // by the time we navigate.
    await logout.mutateAsync().catch(() => undefined);
    await router.navigate({ to: '/login' });
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="bg-background flex h-14 shrink-0 items-center gap-6 border-b px-4 lg:px-6">
        <Link to="/schools" className="flex items-center gap-2 font-semibold">
          <School className="size-5" aria-hidden />
          Lokalizator
        </Link>

        <nav className="flex items-center gap-1" aria-label="Nawigacja główna">
          <Link
            to="/schools"
            className="text-muted-foreground hover:text-foreground data-[status=active]:text-foreground rounded-md px-3 py-1.5 text-sm font-medium transition-colors data-[status=active]:bg-accent"
          >
            Szkoły
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-muted-foreground hidden text-sm sm:inline">{user.username}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void handleLogout()}
            disabled={logout.isPending}
          >
            <LogOut aria-hidden />
            Wyloguj
          </Button>
        </div>
      </header>

      <main className="min-h-0 flex-1 p-4 lg:p-6">
        <Outlet />
      </main>
    </div>
  );
}
