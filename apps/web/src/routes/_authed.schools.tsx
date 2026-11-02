import type { School } from '@lokalizator/shared-types';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { AlertTriangle } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { filterSchoolsByName } from '@/features/schools/filter-schools';
import { SchoolList, SchoolListSkeleton } from '@/features/schools/school-list';
import { DEFAULT_SCHOOL_SORT, sortSchools, type SchoolSort } from '@/features/schools/school-sort';
import { SchoolSortSelect } from '@/features/schools/school-sort-select';
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
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SchoolSort>(DEFAULT_SCHOOL_SORT);
  const visibleSchools = useMemo(
    () => sortSchools(filterSchoolsByName(schools ?? [], query), sort),
    [schools, query, sort],
  );

  function handleQueryChange(value: string) {
    setQuery(value);
    if (selected && !filterSchoolsByName([selected], value).length) {
      setSelected(null);
    }
  }

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
            {isPending ? 'Wczytywanie…' : `${visibleSchools.length} placówek na mapie Polski`}
          </CardDescription>
          <SchoolSortSelect
            value={sort}
            onChange={setSort}
            disabled={isPending || schools.length === 0}
          />
        </CardHeader>

        <div className="border-b px-6 py-3">
          <Label htmlFor="school-search" className="mb-2">
            Szukaj szkoły
          </Label>
          <Input
            id="school-search"
            type="search"
            value={query}
            onChange={(event) => handleQueryChange(event.target.value)}
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {isPending ? (
            <SchoolListSkeleton />
          ) : visibleSchools.length === 0 && schools.length > 0 ? (
            <p className="text-muted-foreground px-6 py-10 text-center text-sm">
              Brak szkół pasujących do wyszukiwania
            </p>
          ) : (
            <SchoolList
              schools={visibleSchools}
              selectedId={selected?.id ?? null}
              onSelect={setSelected}
            />
          )}
        </div>
      </Card>

      <Card className="h-[24rem] overflow-hidden p-0 lg:h-auto">
        <SchoolsMap schools={visibleSchools} selected={selected} onSelect={setSelected} />
      </Card>
    </div>
  );
}
