import type { School } from '@lokalizator/shared-types';
import { useQuery } from '@tanstack/react-query';
import { Link, createFileRoute } from '@tanstack/react-router';
import { AlertTriangle, List, Map as MapIcon, Plus } from 'lucide-react';
import { useState } from 'react';
import { z } from 'zod';

import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SchoolList, SchoolListSkeleton } from '@/features/schools/school-list';
import { SchoolsMap } from '@/features/schools/schools-map';
import { schoolsQueryOptions } from '@/features/schools/schools.queries';

const searchSchema = z.object({
  // Optional (defaulted below) rather than required, so a plain `<Link to="/schools">` elsewhere
  // doesn't have to pass a `search` value.
  view: z.enum(['list', 'map']).optional().catch(undefined),
});

export const Route = createFileRoute('/_authed/schools')({
  validateSearch: searchSchema,
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
  const { view = 'list' } = Route.useSearch();
  const navigate = Route.useNavigate();

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
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Szkoły"
        description={isPending ? 'Wczytywanie…' : `${schools.length} placówek na mapie Polski`}
        actions={
          <Button asChild size="sm">
            <Link to="/schools/import">
              <Plus aria-hidden />
              Dodaj dane
            </Link>
          </Button>
        }
      />

      <Card className="min-h-0 flex-1 gap-0 overflow-hidden p-0">
        <Tabs
          value={view}
          onValueChange={(value) =>
            void navigate({
              search: (prev) => ({ ...prev, view: value as 'list' | 'map' }),
              replace: true,
            })
          }
          className="flex min-h-0 flex-1 flex-col gap-0"
        >
          <div className="border-b p-3">
            <TabsList>
              <TabsTrigger value="list">
                <List aria-hidden />
                Lista
              </TabsTrigger>
              <TabsTrigger value="map">
                <MapIcon aria-hidden />
                Mapa
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Both panels stay mounted (forceMount + manual `hidden`) so switching tabs
              doesn't re-init the Leaflet map and lose its zoom/pan state. */}
          <TabsContent value="list" forceMount hidden={view !== 'list'} className="min-h-0 overflow-y-auto">
            {isPending ? (
              <SchoolListSkeleton />
            ) : (
              <SchoolList
                schools={schools}
                selectedId={selected?.id ?? null}
                onSelect={setSelected}
              />
            )}
          </TabsContent>

          <TabsContent value="map" forceMount hidden={view !== 'map'} className="min-h-0">
            <SchoolsMap
              schools={schools ?? []}
              selected={selected}
              onSelect={setSelected}
              active={view === 'map'}
            />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
