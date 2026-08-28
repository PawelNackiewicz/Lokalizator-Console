import { Link, createFileRoute } from '@tanstack/react-router';
import { ArrowLeft, FileSpreadsheet, UploadCloud } from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const Route = createFileRoute('/_authed/schools_/import_/csv')({
  component: SchoolsImportCsvPage,
});

function SchoolsImportCsvPage() {
  const [file, setFile] = useState<File | null>(null);

  return (
    <div className="flex h-full flex-col gap-4">
      <PageHeader
        title="Import CSV"
        description="Wgraj plik CSV z danymi szkół do zaimportowania."
        actions={
          <Button asChild variant="outline" size="sm">
            <Link to="/schools/import">
              <ArrowLeft aria-hidden />
              Wstecz
            </Link>
          </Button>
        }
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="text-muted-foreground size-5" aria-hidden />
            Plik CSV
          </CardTitle>
          <CardDescription>Obsługiwany format: .csv, kodowanie UTF-8.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="csv-file">Plik</Label>
            <Input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            />
            {file && (
              <p className="text-muted-foreground text-xs">
                Wybrano: {file.name} ({Math.ceil(file.size / 1024)} KB)
              </p>
            )}
          </div>

          <Button disabled className="self-start">
            <UploadCloud aria-hidden />
            Importuj
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
