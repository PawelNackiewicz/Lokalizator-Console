import { Link, createFileRoute } from '@tanstack/react-router';
import {
  AlertCircle,
  ArrowLeft,
  FileSpreadsheet,
  Loader2,
  RotateCcw,
  Save,
  UploadCloud,
} from 'lucide-react';
import { useState } from 'react';

import { PageHeader } from '@/components/page-header';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CsvImportTable } from '@/features/schools/csv-import/csv-import-table';
import { useCsvImport } from '@/features/schools/csv-import/use-csv-import';

export const Route = createFileRoute('/_authed/schools_/import_/csv')({
  component: SchoolsImportCsvPage,
});

function SchoolsImportCsvPage() {
  const [file, setFile] = useState<File | null>(null);
  const { status, fileName, errorMessage, locations, summary, parseFile, reset } = useCsvImport();

  function handleReset() {
    setFile(null);
    reset();
  }

  if (status === 'parsed' && summary) {
    return (
      <div className="flex h-full min-h-0 flex-col gap-4">
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

        {summary.valid === 0 && (
          <Alert variant="destructive">
            <AlertCircle aria-hidden />
            <AlertTitle>Import nieudany</AlertTitle>
            <AlertDescription>
              Żaden wiersz nie przeszedł walidacji — sprawdź, czy to prawidłowy eksport RSPO.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">{fileName}</p>
            <p className="text-muted-foreground text-sm">
              Rozpoznano {summary.totalLocations} fizycznych lokalizacji dla {summary.totalUnits}{' '}
              jednostek RSPO: {summary.valid} poprawnych, {summary.warning} z ostrzeżeniami,{' '}
              {summary.error} z błędami.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Button disabled>
                <Save aria-hidden />
                Zapisz
              </Button>
              <Badge variant="secondary">Wkrótce</Badge>
            </div>
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw aria-hidden />
              Wybierz inny plik
            </Button>
          </div>
        </div>

        {locations.length > 0 && <CsvImportTable locations={locations} />}
      </div>
    );
  }

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
          {status === 'error' && errorMessage && (
            <Alert variant="destructive">
              <AlertCircle aria-hidden />
              <AlertTitle>Nie udało się zaimportować pliku</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

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

          <Button
            disabled={!file || status === 'parsing'}
            onClick={() => file && parseFile(file)}
            className="self-start"
          >
            {status === 'parsing' ? (
              <Loader2 className="animate-spin" aria-hidden />
            ) : (
              <UploadCloud aria-hidden />
            )}
            Importuj
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
