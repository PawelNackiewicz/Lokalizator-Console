import { loginInputSchema, type LoginInput } from '@lokalizator/shared-types';
import { createFileRoute, redirect, useRouter } from '@tanstack/react-router';
import { Loader2, LogIn } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { z } from 'zod';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { fetchCurrentUser, useLoginMutation } from '@/features/auth/auth.queries';
import { ApiError } from '@/lib/api-client';

const DEFAULT_REDIRECT = '/schools';

const searchSchema = z.object({
  /** Where to return after signing in — set by the `_authed` route guard. */
  redirect: z.string().optional(),
});

export const Route = createFileRoute('/login')({
  validateSearch: searchSchema,
  beforeLoad: async ({ context }) => {
    // A signed-in user has no reason to see the form.
    if (await fetchCurrentUser(context.queryClient)) {
      throw redirect({ to: DEFAULT_REDIRECT });
    }
  },
  component: LoginPage,
});

type FieldErrors = Partial<Record<keyof LoginInput, string[]>>;

function LoginPage() {
  const router = useRouter();
  const { redirect: redirectTo } = Route.useSearch();
  const login = useLoginMutation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // The same schema validates the request on the API side, so messages stay in sync.
    const parsed = loginInputSchema.safeParse({ username, password });

    if (!parsed.success) {
      setFieldErrors(z.flattenError(parsed.error).fieldErrors);
      return;
    }

    setFieldErrors({});

    try {
      await login.mutateAsync(parsed.data);
    } catch {
      // The message already lives in `login.error` and is rendered in the alert.
      return;
    }

    // Re-runs the route guards against the new session state before navigating.
    await router.invalidate();
    // `history.push` takes a raw href, so it handles any return path stored in
    // ?redirect= without fighting the `to` types.
    router.history.push(redirectTo ?? DEFAULT_REDIRECT);
  }

  const requestError = login.error instanceof ApiError ? login.error : null;

  return (
    <main className="bg-muted/40 flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Lokalizator</CardTitle>
          <CardDescription>Zaloguj się, aby przeglądać szkoły.</CardDescription>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="flex flex-col gap-5"
            noValidate
          >
            {requestError && (
              <Alert variant="destructive">
                <AlertTitle>Logowanie nie powiodło się</AlertTitle>
                <AlertDescription>{requestError.message}</AlertDescription>
              </Alert>
            )}

            <div className="flex flex-col gap-2">
              <Label htmlFor="username">Login</Label>
              <Input
                id="username"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                aria-invalid={Boolean(fieldErrors.username)}
                aria-describedby={fieldErrors.username ? 'username-error' : undefined}
              />
              {fieldErrors.username && (
                <p id="username-error" className="text-destructive text-xs">
                  {fieldErrors.username.join(', ')}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
              />
              {fieldErrors.password && (
                <p id="password-error" className="text-destructive text-xs">
                  {fieldErrors.password.join(', ')}
                </p>
              )}
            </div>

            <Button type="submit" disabled={login.isPending}>
              {login.isPending ? (
                <Loader2 className="animate-spin" aria-hidden />
              ) : (
                <LogIn aria-hidden />
              )}
              Zaloguj się
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
