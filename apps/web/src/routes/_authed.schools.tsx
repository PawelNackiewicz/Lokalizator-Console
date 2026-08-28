import type { School } from '@lokalizator/shared-types';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SchoolList, SchoolListSkeleton } from '@/features/schools/school-list';
import { SchoolsMap } from '@/features/schools/schools-map';
import { schoolsQueryOptions } from '@/features/schools/schools.queries';

export const Route = createFileRoute('/_authed/schools')({
  // Prefetch rather than `ensureQueryData`, so a failure is handled by the component
  // with a visible alert instead of dropping the whole route into errorComponent.
  loader: ({ context }) => {
    void context.queryClient.prefetchQuery(schoolsQueryOptions);
  },
  component: SchoolsPage,
});

function SchoolsPage() {
  const { data: schools, isPending, isError, error } = useQuery(schoolsQueryOptions);
  const [selected, setSelected] = useState<School | null>(null);

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertTriangle aria-hidden />
        <AlertTitle>Nie udało się pobrać listy szkół</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid h-full gap-4 lg:grid-cols-[minmax(320px,380px)_1fr]">
      <Card className="flex min-h-0 flex-col gap-0 overflow-hidden py-0">
        <CardHeader className="border-b py-4">
          <CardTitle className="text-base">Szkoły</CardTitle>
          <CardDescription>
            {isPending ? 'Wczytywanie…' : `${schools.length} placówek na mapie Polski`}
          </CardDescription>
        </CardHeader>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isPending ? (
            <SchoolListSkeleton />
          ) : (
            <SchoolList
              schools={schools}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          )}
        </div>
      </Card>

      <Card className="h-[24rem] overflow-hidden p-0 lg:h-auto">
        <SchoolsMap schools={schools ?? []} selected={selected} onSelect={setSelected} />
      </Card>
    </div>
  );
}
