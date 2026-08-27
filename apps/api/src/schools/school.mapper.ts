import type { School } from '@lokalizator/shared-types';

import type { SchoolRow } from '../db/schema';

/**
 * Database row -> API contract.
 *
 * Two conversions have to happen here:
 *  - `numeric` arrives from the driver as a string (Postgres does not guarantee
 *    it fits in a double), while the API contract declares a number,
 *  - `timestamptz` arrives as a Date, and JSON has no date type -> ISO-8601.
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
