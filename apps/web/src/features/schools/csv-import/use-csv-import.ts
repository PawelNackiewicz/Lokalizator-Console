import Papa from 'papaparse';
import { useCallback, useState } from 'react';

import {
  findMissingHeaders,
  groupRowsByLocation,
  mapRspoRecord,
  validateRows,
  type RspoPoiLocation,
  type ValidatedRspoRow,
} from './rspo-csv';

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export type CsvImportStatus = 'idle' | 'parsing' | 'parsed' | 'error';

export interface CsvImportSummary {
  totalUnits: number;
  totalLocations: number;
  valid: number;
  warning: number;
  error: number;
}

interface CsvImportState {
  status: CsvImportStatus;
  fileName: string | null;
  errorMessage: string | null;
  locations: RspoPoiLocation[];
  summary: CsvImportSummary | null;
}

const IDLE_STATE: CsvImportState = {
  status: 'idle',
  fileName: null,
  errorMessage: null,
  locations: [],
  summary: null,
};

function summarize(rows: ValidatedRspoRow[], locations: RspoPoiLocation[]): CsvImportSummary {
  const summary: CsvImportSummary = {
    totalUnits: rows.length,
    totalLocations: locations.length,
    valid: 0,
    warning: 0,
    error: 0,
  };
  for (const row of rows) {
    summary[row.status] += 1;
  }
  return summary;
}

export function useCsvImport() {
  const [state, setState] = useState<CsvImportState>(IDLE_STATE);

  const parseFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setState({
        ...IDLE_STATE,
        status: 'error',
        fileName: file.name,
        errorMessage: 'Nieobsługiwany typ pliku. Wybierz plik z rozszerzeniem .csv.',
      });
      return;
    }

    if (file.size === 0) {
      setState({
        ...IDLE_STATE,
        status: 'error',
        fileName: file.name,
        errorMessage: 'Plik jest pusty.',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setState({
        ...IDLE_STATE,
        status: 'error',
        fileName: file.name,
        errorMessage: 'Plik jest zbyt duży (limit: 50 MB).',
      });
      return;
    }

    setState({ ...IDLE_STATE, status: 'parsing', fileName: file.name });

    Papa.parse<Record<string, string>>(file, {
      header: true,
      delimiter: ';',
      skipEmptyLines: true,
      worker: true,
      complete: (results) => {
        const missingHeaders = findMissingHeaders(results.meta.fields ?? []);
        if (missingHeaders.length > 0) {
          setState({
            ...IDLE_STATE,
            status: 'error',
            fileName: file.name,
            errorMessage: `Plik nie wygląda na eksport RSPO — brakuje kolumn: ${missingHeaders.join(', ')}.`,
          });
          return;
        }

        const rows = validateRows(results.data.map(mapRspoRecord));
        const locations = groupRowsByLocation(rows);
        setState({
          status: 'parsed',
          fileName: file.name,
          errorMessage: null,
          locations,
          summary: summarize(rows, locations),
        });
      },
      error: (error) => {
        setState({
          ...IDLE_STATE,
          status: 'error',
          fileName: file.name,
          errorMessage: `Nie udało się odczytać pliku: ${error.message}.`,
        });
      },
    });
  }, []);

  const reset = useCallback(() => setState(IDLE_STATE), []);

  return { ...state, parseFile, reset };
}
