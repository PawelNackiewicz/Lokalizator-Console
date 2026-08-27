import type { School } from '@lokalizator/shared-types';

import type { SchoolRow } from '../db/schema';

/**
 * Wiersz z bazy -> kontrakt API.
 *
 * Dwie konwersje, które muszą się tu wydarzyć:
 *  - `numeric` przychodzi ze sterownika jako string (Postgres nie gwarantuje,
 *    że zmieści się w double), a kontrakt API deklaruje number,
 *  - `timestamptz` przychodzi jako Date, a JSON nie ma typu daty -> ISO-8601.
 */
export function toSchoolDto(row: SchoolRow): School {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    latitude: row.latitude,
    longitude: row.longitude,
    rating: Number(row.rating),
    createdAt: row.createdAt.toISOString(),
  };
}
