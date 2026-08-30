import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useVirtualizer } from '@tanstack/react-virtual';
import { AlertCircle, AlertTriangle, CheckCircle2, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

import type { RspoPoiLocation, RspoRowStatus } from './rspo-csv';

const ROW_HEIGHT_PX = 56;

function locationMessage(location: RspoPoiLocation): string {
  return location.units
    .flatMap((unit) =>
      Object.values(unit.fieldMessages).map((message) => `RSPO ${unit.rspoNumber}: ${message}`),
    )
    .join('; ');
}

function StatusIcon({ status }: { status: RspoRowStatus }) {
  if (status === 'error') {
    return <AlertCircle className="text-destructive size-4" aria-hidden />;
  }
  if (status === 'warning') {
    return <AlertTriangle className="size-4 text-amber-500" aria-hidden />;
  }
  return <CheckCircle2 className="text-muted-foreground/40 size-4" aria-hidden />;
}

function shortList(values: string[], limit = 2): string {
  if (values.length <= limit) return values.join(', ');
  return `${values.slice(0, limit).join(', ')} +${values.length - limit}`;
}

function publicStatusLabel(statuses: string[]): string {
  if (statuses.length > 1) return 'Mieszany';
  if (statuses[0] === 'publiczna') return 'Publiczna';
  if (statuses[0]?.startsWith('niepubliczna')) return 'Niepubliczna';
  return statuses[0] ?? 'Brak';
}

const studentCountFormatter = new Intl.NumberFormat('pl-PL');

const columnHelper = createColumnHelper<RspoPoiLocation>();

const columns = [
  columnHelper.display({
    id: 'status',
    header: '',
    cell: ({ row }) => (
      <span title={locationMessage(row.original) || undefined} className="inline-flex">
        <StatusIcon status={row.original.status} />
      </span>
    ),
  }),
  columnHelper.accessor((location) => location.rspoNumbers.join(' '), {
    id: 'rspoNumbers',
    header: 'RSPO',
    cell: ({ row }) => {
      const { rspoNumbers } = row.original;
      return (
        <span className="font-mono text-xs" title={rspoNumbers.join(', ')}>
          {rspoNumbers[0]}
          {rspoNumbers.length > 1 && (
            <span className="text-muted-foreground"> +{rspoNumbers.length - 1}</span>
          )}
        </span>
      );
    },
  }),
  columnHelper.accessor(
    (location) => [location.name, ...location.units.map((unit) => unit.name)].join(' '),
    {
      id: 'name',
      header: 'Nazwa',
      cell: ({ row }) => (
        <div
          className="max-w-72 min-w-52"
          title={row.original.units.map((unit) => unit.name).join('\n')}
        >
          <p className="truncate font-medium">{row.original.name}</p>
          {row.original.units.length > 1 && (
            <p className="text-muted-foreground text-xs">
              {row.original.units.length} jednostek w tej lokalizacji
            </p>
          )}
        </div>
      ),
    },
  ),
  columnHelper.accessor((location) => location.types.join(' '), {
    id: 'types',
    header: 'Typ',
    cell: ({ row }) => (
      <span className="block max-w-60 truncate" title={row.original.types.join(', ')}>
        {shortList(row.original.types)}
      </span>
    ),
  }),
  columnHelper.accessor('address', {
    header: 'Pełny adres',
    cell: ({ getValue }) => (
      <span className="block max-w-72 truncate" title={getValue()}>
        {getValue()}
      </span>
    ),
  }),
  columnHelper.accessor((location) => location.publicStatuses.join(' '), {
    id: 'publicStatuses',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="outline" title={row.original.publicStatuses.join(', ')}>
        {publicStatusLabel(row.original.publicStatuses)}
      </Badge>
    ),
  }),
  columnHelper.accessor('structureLabel', { header: 'Struktura' }),
  columnHelper.accessor((location) => String(location.studentCount), {
    id: 'studentCount',
    header: 'Uczniowie',
    cell: ({ row }) => studentCountFormatter.format(row.original.studentCount),
  }),
];

interface CsvImportTableProps {
  locations: RspoPoiLocation[];
}

export function CsvImportTable({ locations }: CsvImportTableProps) {
  const [showOnlyProblems, setShowOnlyProblems] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const data = useMemo(
    () =>
      showOnlyProblems ? locations.filter((location) => location.status !== 'valid') : locations,
    [locations, showOnlyProblems],
  );

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter: searchQuery },
    onGlobalFilterChange: setSearchQuery,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId: (location) => location.id,
  });

  const tableRows = table.getRowModel().rows;

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: tableRows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_PX,
    overscan: 10,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const firstVirtualRow = virtualRows[0];
  const lastVirtualRow = virtualRows[virtualRows.length - 1];
  const paddingTop = firstVirtualRow?.start ?? 0;
  const paddingBottom = lastVirtualRow ? virtualizer.getTotalSize() - lastVirtualRow.end : 0;

  useEffect(() => {
    virtualizer.scrollToOffset(0);
  }, [searchQuery, showOnlyProblems, virtualizer]);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Search
            className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
            aria-hidden
          />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Szukaj po nazwie, adresie lub RSPO..."
            aria-label="Szukaj w tabeli"
            className="pr-9 pl-9"
          />
          {searchQuery && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
              onClick={() => setSearchQuery('')}
              aria-label="Wyczyść wyszukiwanie"
              title="Wyczyść wyszukiwanie"
            >
              <X aria-hidden />
            </Button>
          )}
        </div>

        <Button
          type="button"
          variant={showOnlyProblems ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowOnlyProblems((value) => !value)}
        >
          Pokaż tylko wiersze z problemami
        </Button>

        {(searchQuery || showOnlyProblems) && (
          <span className="text-muted-foreground ml-auto text-sm" aria-live="polite">
            Wyniki: {tableRows.length} z {locations.length}
          </span>
        )}
      </div>

      <div ref={scrollContainerRef} className="min-h-0 flex-1 overflow-auto rounded-md border">
        <Table className="min-w-[1120px]">
          <TableHeader className="bg-background sticky top-0 z-10">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {tableRows.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-muted-foreground h-24 text-center"
                >
                  Brak wierszy pasujących do wyszukiwania.
                </TableCell>
              </TableRow>
            )}
            {paddingTop > 0 && (
              <tr>
                <td style={{ height: paddingTop }} colSpan={columns.length} />
              </tr>
            )}
            {virtualRows.map((virtualRow) => {
              const row = tableRows[virtualRow.index];
              if (!row) return null;

              return (
                <TableRow
                  key={row.id}
                  className={cn(
                    'h-14',
                    row.original.status === 'error' && 'bg-destructive/5',
                    row.original.status === 'warning' && 'bg-amber-500/5',
                  )}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            {paddingBottom > 0 && (
              <tr>
                <td style={{ height: paddingBottom }} colSpan={columns.length} />
              </tr>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
