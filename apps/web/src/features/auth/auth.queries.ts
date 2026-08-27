import type { AuthUser, AuthUserResponse, LoginInput } from '@lokalizator/shared-types';
import { queryOptions, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { apiFetch, ApiError } from '@/lib/api-client';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

/**
 * Jedyne źródło prawdy o stanie zalogowania. Token jest httpOnly, więc front
 * nie może go odczytać — zamiast tego pyta API, kim jest.
 *
 * `retry: false`, bo 401 to poprawna odpowiedź (użytkownik niezalogowany),
 * a nie błąd sieci wart ponawiania.
 */
export const meQueryOptions = queryOptions({
  queryKey: authKeys.me,
  queryFn: () => apiFetch<AuthUserResponse>('/auth/me'),
  retry: false,
  staleTime: 5 * 60 * 1000,
});

/**
 * Używane w `beforeLoad` tras. Zwraca użytkownika albo `null` przy 401.
 * Każdy inny błąd (np. API nie odpowiada) leci dalej — nie chcemy udawać,
 * że użytkownik jest wylogowany, gdy tak naprawdę padła sieć.
 */
export async function fetchCurrentUser(queryClient: QueryClient): Promise<AuthUser | null> {
  try {
    const { user } = await queryClient.ensureQueryData(meQueryOptions);
    return user;
  } catch (error) {
    if (error instanceof ApiError && error.isUnauthorized) {
      return null;
    }
    throw error;
  }
}

export function useLoginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginInput) =>
      apiFetch<AuthUserResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }),
    onSuccess: (data) => {
      // Nadpisujemy cache od razu, żeby guard trasy nie musiał robić rundy do API.
      queryClient.setQueryData(authKeys.me, data);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    // `onSettled`, bo lokalny stan czyścimy nawet gdy żądanie padnie —
    // ciasteczko i tak jest już nieużyteczne z punktu widzenia użytkownika.
    onSettled: () => {
      queryClient.clear();
    },
  });
}
