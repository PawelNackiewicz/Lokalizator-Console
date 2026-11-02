import type { School } from '@lokalizator/shared-types';
import { describe, expect, it } from 'vitest';

import { sortSchools } from './school-sort';

function school(name: string, rating: number): School {
  return {
    id: name,
    name,
    rating,
    address: 'ul. Testowa 1',
    latitude: 52,
    longitude: 21,
  } as School;
}

const names = (schools: School[]) => schools.map((s) => s.name);

describe('sortSchools', () => {
  const input = [school('Beta', 4), school('Alfa', 4), school('Gamma', 5), school('Delta', 3)];

  it('sorts by name ascending and descending', () => {
    expect(names(sortSchools(input, 'name-asc'))).toEqual(['Alfa', 'Beta', 'Delta', 'Gamma']);
    expect(names(sortSchools(input, 'name-desc'))).toEqual(['Gamma', 'Delta', 'Beta', 'Alfa']);
  });

  it('sorts by rating and breaks ties by name A-Z', () => {
    expect(names(sortSchools(input, 'rating-desc'))).toEqual(['Gamma', 'Alfa', 'Beta', 'Delta']);
    expect(names(sortSchools(input, 'rating-asc'))).toEqual(['Delta', 'Alfa', 'Beta', 'Gamma']);
  });

  it('uses Polish collation for diacritics', () => {
    const polish = [school('Żak', 1), school('Zeta', 1), school('Łódź', 1), school('Lima', 1)];
    expect(names(sortSchools(polish, 'name-asc'))).toEqual(['Lima', 'Łódź', 'Zeta', 'Żak']);
  });

  it('does not mutate the input array', () => {
    const copy = [...input];
    sortSchools(input, 'name-desc');
    expect(input).toEqual(copy);
  });
});
