import { z } from 'zod';

// RSPO exports wrap some fields in Excel's leading-zero formula trick, e.g. `="021981013"`.
// Which columns get wrapped varies between exports, so every field is unwrapped, not just
// the ones observed so far.
const EXCEL_FORMULA_PATTERN = /^="(.*)"$/;

export function unwrapExcelFormula(value: string): string {
  const match = EXCEL_FORMULA_PATTERN.exec(value);
  return match?.[1] ?? value;
}

function unwrapRecord(record: Record<string, string>): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(record)) {
    result[key] = unwrapExcelFormula(value ?? '');
  }
  return result;
}

export const REQUIRED_HEADERS = [
  'Numer RSPO',
  'Nazwa',
  'Typ',
  'Województwo',
  'Kod terytorialny miejscowość',
  'Numer budynku',
  'Kod pocztowy',
  'Miejsce w strukturze',
] as const;

export function findMissingHeaders(headers: string[]): string[] {
  const headerSet = new Set(headers);
  return REQUIRED_HEADERS.filter((header) => !headerSet.has(header));
}

export interface RspoImportRow {
  rspoNumber: string;
  regon: string;
  name: string;
  type: string;
  voivodeshipCode: string;
  countyCode: string;
  municipalityCode: string;
  cityCode: string;
  streetCode: string;
  voivodeship: string;
  county: string;
  municipality: string;
  city: string;
  street: string;
  buildingNumber: string;
  apartmentNumber: string;
  address: string;
  postalCode: string;
  postOffice: string;
  publicStatus: string;
  studentCategory: string;
  specificity: string;
  structurePosition: string;
  parentRspoNumber: string;
  parentType: string;
  parentName: string;
  studentCount: string;
  raw: Record<string, string>;
}

export function buildAddress(record: Record<string, string>): string {
  const street = record['Ulica'] ?? '';
  const city = record['Miejscowość'] ?? '';
  const buildingNumber = record['Numer budynku'] ?? '';
  const apartmentNumber = record['Numer lokalu'] ?? '';
  const number = apartmentNumber.trim() ? `${buildingNumber}/${apartmentNumber}` : buildingNumber;
  const premise = [street || city, number].filter((value) => value.trim()).join(' ');

  const postalCode = record['Kod pocztowy'] ?? '';
  const postOffice = record['Poczta'] || city;
  const postalLocality = [postalCode, postOffice].filter((value) => value.trim()).join(' ');

  return [premise, postalLocality]
    .filter((value, index, values) => value.trim() && values.indexOf(value) === index)
    .join(', ');
}

export function mapRspoRecord(rawRecord: Record<string, string>): RspoImportRow {
  const record = unwrapRecord(rawRecord);

  return {
    rspoNumber: record['Numer RSPO'] ?? '',
    regon: record['REGON'] ?? '',
    name: record['Nazwa'] ?? '',
    type: record['Typ'] ?? '',
    voivodeshipCode: record['Kod terytorialny województwo'] ?? '',
    countyCode: record['Kod terytorialny powiat'] ?? '',
    municipalityCode: record['Kod terytorialny gmina'] ?? '',
    cityCode: record['Kod terytorialny miejscowość'] ?? '',
    streetCode: record['Kod terytorialny ulica'] ?? '',
    voivodeship: record['Województwo'] ?? '',
    county: record['Powiat'] ?? '',
    municipality: record['Gmina'] ?? '',
    city: record['Miejscowość'] ?? '',
    street: record['Ulica'] ?? '',
    buildingNumber: record['Numer budynku'] ?? '',
    apartmentNumber: record['Numer lokalu'] ?? '',
    address: buildAddress(record),
    postalCode: record['Kod pocztowy'] ?? '',
    postOffice: record['Poczta'] ?? '',
    publicStatus: record['Publiczność status'] ?? '',
    studentCategory: record['Kategoria uczniów'] ?? '',
    specificity: record['Specyfika placówki'] ?? '',
    structurePosition: record['Miejsce w strukturze'] ?? '',
    parentRspoNumber: record['RSPO podmiotu nadrzędnego'] ?? '',
    parentType: record['Typ podmiotu nadrzędnego'] ?? '',
    parentName: record['Nazwa podmiotu nadrzędnego'] ?? '',
    studentCount: record['Liczba uczniów'] ?? '',
    raw: record,
  };
}

export type RspoRowStatus = 'valid' | 'warning' | 'error';

export interface ValidatedRspoRow extends RspoImportRow {
  rowNumber: number;
  status: RspoRowStatus;
  fieldMessages: Partial<Record<keyof RspoImportRow, string>>;
}

const ERROR_FIELDS: (keyof RspoImportRow)[] = [
  'rspoNumber',
  'name',
  'type',
  'city',
  'buildingNumber',
];

const POSTAL_CODE_PATTERN = /^\d{2}-\d{3}$/;

export const rspoImportRowSchema = z
  .object({
    rspoNumber: z.string(),
    regon: z.string(),
    name: z.string(),
    type: z.string(),
    voivodeshipCode: z.string(),
    countyCode: z.string(),
    municipalityCode: z.string(),
    cityCode: z.string(),
    streetCode: z.string(),
    voivodeship: z.string(),
    county: z.string(),
    municipality: z.string(),
    city: z.string(),
    street: z.string(),
    buildingNumber: z.string(),
    apartmentNumber: z.string(),
    address: z.string(),
    postalCode: z.string(),
    postOffice: z.string(),
    publicStatus: z.string(),
    studentCategory: z.string(),
    specificity: z.string(),
    structurePosition: z.string(),
    parentRspoNumber: z.string(),
    parentType: z.string(),
    parentName: z.string(),
    studentCount: z.string(),
    raw: z.record(z.string(), z.string()),
  })
  .superRefine((row, ctx) => {
    if (!row.rspoNumber || !Number.isFinite(Number(row.rspoNumber))) {
      ctx.addIssue({ code: 'custom', path: ['rspoNumber'], message: 'Brak numeru RSPO' });
    }
    if (!row.name.trim()) {
      ctx.addIssue({ code: 'custom', path: ['name'], message: 'Brak nazwy szkoły' });
    }
    if (!row.type.trim()) {
      ctx.addIssue({ code: 'custom', path: ['type'], message: 'Brak typu szkoły' });
    }
    if (!row.city.trim()) {
      ctx.addIssue({ code: 'custom', path: ['city'], message: 'Brak miejscowości' });
    }
    if (!row.buildingNumber.trim()) {
      ctx.addIssue({ code: 'custom', path: ['buildingNumber'], message: 'Brak numeru budynku' });
    }
    if (row.postalCode && !POSTAL_CODE_PATTERN.test(row.postalCode)) {
      ctx.addIssue({ code: 'custom', path: ['postalCode'], message: 'Nieprawidłowy kod pocztowy' });
    }
    if (!row.publicStatus.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['publicStatus'],
        message: 'Brak statusu publiczności',
      });
    }
    if (!row.structurePosition.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['structurePosition'],
        message: 'Brak miejsca w strukturze',
      });
    }
    if (row.structurePosition !== 'samodzielna' && !row.parentRspoNumber.trim()) {
      ctx.addIssue({
        code: 'custom',
        path: ['parentRspoNumber'],
        message: 'Brak numeru RSPO podmiotu nadrzędnego',
      });
    }
    if (row.studentCount) {
      const studentCount = Number(row.studentCount);
      if (!Number.isFinite(studentCount) || studentCount < 0) {
        ctx.addIssue({
          code: 'custom',
          path: ['studentCount'],
          message: 'Nieprawidłowa liczba uczniów',
        });
      }
    }
  });

export function validateRows(rows: RspoImportRow[]): ValidatedRspoRow[] {
  const rowNumbersByRspoNumber = new Map<string, number[]>();
  rows.forEach((row, index) => {
    if (!row.rspoNumber) return;
    const rowNumbers = rowNumbersByRspoNumber.get(row.rspoNumber) ?? [];
    rowNumbers.push(index + 1);
    rowNumbersByRspoNumber.set(row.rspoNumber, rowNumbers);
  });

  return rows.map((row, index) => {
    const rowNumber = index + 1;
    const fieldMessages: Partial<Record<keyof RspoImportRow, string>> = {};

    const result = rspoImportRowSchema.safeParse(row);
    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0];
        if (typeof field === 'string') {
          fieldMessages[field as keyof RspoImportRow] = issue.message;
        }
      }
    }

    const duplicateRowNumbers = rowNumbersByRspoNumber.get(row.rspoNumber);
    if (duplicateRowNumbers && duplicateRowNumbers.length > 1) {
      const otherRowNumber = duplicateRowNumbers.find((n) => n !== rowNumber);
      if (otherRowNumber !== undefined) {
        fieldMessages.rspoNumber = `Zduplikowany numer RSPO (też w wierszu ${otherRowNumber})`;
      }
    }

    const status: RspoRowStatus = ERROR_FIELDS.some((field) => field in fieldMessages)
      ? 'error'
      : Object.keys(fieldMessages).length > 0
        ? 'warning'
        : 'valid';

    return { ...row, rowNumber, status, fieldMessages };
  });
}

export interface RspoPoiLocation {
  id: string;
  name: string;
  address: string;
  rspoNumbers: string[];
  types: string[];
  publicStatuses: string[];
  structureLabel: string;
  studentCount: number;
  status: RspoRowStatus;
  units: ValidatedRspoRow[];
}

function normalizeLocationPart(value: string): string {
  return value.trim().toLocaleLowerCase('pl-PL').replace(/\s+/g, ' ');
}

function locationKey(row: ValidatedRspoRow): string {
  const city = row.cityCode || normalizeLocationPart(row.city);
  const street = row.streetCode || normalizeLocationPart(row.street);
  const building = normalizeLocationPart(row.buildingNumber).replace(/\s/g, '');

  if (!city || !building) {
    return `invalid:${row.rspoNumber || row.rowNumber}`;
  }

  return [city, street, building].join('|');
}

function uniqueValues(values: string[]): string[] {
  return [...new Set(values.filter((value) => value.trim()))];
}

function locationStatus(units: ValidatedRspoRow[]): RspoRowStatus {
  if (units.some((unit) => unit.status === 'error')) return 'error';
  if (units.some((unit) => unit.status === 'warning')) return 'warning';
  return 'valid';
}

function locationName(units: ValidatedRspoRow[]): string {
  if (units.length === 1) return units[0]?.name ?? '';

  const parentNames = uniqueValues(units.map((unit) => unit.parentName));
  if (parentNames.length === 1) return parentNames[0] ?? '';

  return units[0]?.name ?? '';
}

function structureLabel(units: ValidatedRspoRow[]): string {
  if (units.length > 1) return `Zespół · ${units.length} jednostek`;

  const position = units[0]?.structurePosition ?? '';
  if (position === 'szkoła/placówka wchodząca w skład jednostki złożonej') return 'W zespole';
  if (position === 'filia szkoły lub placówki') return 'Filia';
  if (position === 'samodzielna') return 'Samodzielna';
  return position;
}

export function groupRowsByLocation(rows: ValidatedRspoRow[]): RspoPoiLocation[] {
  const groups = new Map<string, ValidatedRspoRow[]>();

  for (const row of rows) {
    const key = locationKey(row);
    const units = groups.get(key) ?? [];
    units.push(row);
    groups.set(key, units);
  }

  return [...groups.entries()].map(([id, units]) => ({
    id,
    name: locationName(units),
    address: units[0]?.address ?? '',
    rspoNumbers: uniqueValues(units.map((unit) => unit.rspoNumber)),
    types: uniqueValues(units.map((unit) => unit.type)),
    publicStatuses: uniqueValues(units.map((unit) => unit.publicStatus)),
    structureLabel: structureLabel(units),
    studentCount: units.reduce((total, unit) => {
      const count = Number(unit.studentCount);
      return Number.isFinite(count) && count >= 0 ? total + count : total;
    }, 0),
    status: locationStatus(units),
    units,
  }));
}
