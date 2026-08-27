import { schoolSchema } from '@lokalizator/shared-types';
import { describe, expect, it } from 'vitest';

import type { SchoolRow } from '../db/schema';
import { toSchoolDto } from './school.mapper';

const row: SchoolRow = {
  id: '3f1b0b0e-6a9e-4a2f-9a0d-1c2d3e4f5a6b',
  name: 'XIV Liceum Ogólnokształcące im. Stanisława Staszica',
  address: 'ul. Nowowiejska 37a, 00-665 Warszawa',
  latitude: 52.2205,
  longitude: 21.009,
  rating: '4.8',
  createdAt: new Date('2026-01-15T10:30:00.000Z'),
};

describe('toSchoolDto', () => {
  it('konwertuje numeric na number i datę na ISO-8601', () => {
    const dto = toSchoolDto(row);

    expect(dto.rating).toBe(4.8);
    expect(dto.createdAt).toBe('2026-01-15T10:30:00.000Z');
  });

  it('produkuje obiekt zgodny ze współdzielonym kontraktem', () => {
    expect(() => schoolSchema.parse(toSchoolDto(row))).not.toThrow();
  });
});
