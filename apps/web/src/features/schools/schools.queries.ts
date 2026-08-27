import type { School } from '@lokalizator/shared-types';
import { queryOptions } from '@tanstack/react-query';

import { apiFetch } from '@/lib/api-client';

export const schoolKeys = {
  all: ['schools'] as const,
  list: () => [...schoolKeys.all, 'list'] as const,
  detail: (id: string) => [...schoolKeys.all, 'detail', id] as const,
};

export const schoolsQueryOptions = queryOptions({
  queryKey: schoolKeys.list(),
  queryFn: () => apiFetch<School[]>('/schools'),
});

export const schoolQueryOptions = (id: string) =>
  queryOptions({
    queryKey: schoolKeys.detail(id),
    queryFn: () => apiFetch<School>(`/schools/${id}`),
  });
