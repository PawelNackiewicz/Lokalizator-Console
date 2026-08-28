import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, ArrowRight, PencilLine, UploadCloud } from 'lucide-react';

import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authed/schools_/import')({
  component: SchoolsImportPage,
});

function SchoolsImportPage() {
  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Dodaj dane szkół"
        description="Wybierz, w jaki sposób chcesz dodać nowe placówki."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/schools">
              <ArrowLeft aria-hidden />
              Wróć do szkół
            </Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="gap-3 opacity-60">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <PencilLine className="text-muted-foreground size-5" aria-hidden />
              <Badge variant="secondary">Wkrótce</Badge>
            </div>
            <CardTitle>Dodaj ręcznie</CardTitle>
            <CardDescription>Wprowadź dane pojedynczej szkoły w formularzu.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-ring/60 relative gap-3 transition-colors">
          <Link
            to="/schools/import/csv"
            className="focus-visible:ring-ring/50 absolute inset-0 rounded-xl outline-none focus-visible:ring-[3px]"
            aria-label="Importuj plik CSV"
          />
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <UploadCloud className="text-muted-foreground size-5" aria-hidden />
              <ArrowRight className="text-muted-foreground size-4" aria-hidden />
            </div>
            <CardTitle>Importuj plik CSV</CardTitle>
            <CardDescription>Wgraj plik CSV, aby dodać wiele szkół naraz.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
