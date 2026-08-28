import type { AuthUser, AuthUserResponse, LoginInput } from '@lokalizator/shared-types';
import { queryOptions, useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';

import { apiFetch, ApiError } from '@/lib/api-client';

export const authKeys = {
  me: ['auth', 'me'] as const,
};

/**
 * Single source of truth for the signed-in state. The token is httpOnly, so the
 * web app cannot read it — it asks the API who it is instead.
 *
 * `retry: false`, because a 401 is a valid answer (nobody is signed in), not a
 * network error worth retrying.
 */
export const meQueryOptions = queryOptions({
  queryKey: authKeys.me,
  queryFn: () => apiFetch<AuthUserResponse>('/auth/me'),
  retry: false,
  staleTime: 5 * 60 * 1000,
});

/**
 * Used in route `beforeLoad`. Returns the user, or `null` on a 401. Any other
 * error propagates — a network failure must not be mistaken for a signed-out user.
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
      // Prime the cache right away so the route guard skips a round trip to the API.
      queryClient.setQueryData(authKeys.me, data);
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiFetch<void>('/auth/logout', { method: 'POST' }),
    // `onSettled`: local state is cleared even if the request fails — from the
    // user's point of view the cookie is already useless.
    onSettled: () => {
      queryClient.clear();
    },
  });
}
