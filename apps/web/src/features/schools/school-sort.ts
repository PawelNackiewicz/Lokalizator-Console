import type { School } from '@lokalizator/shared-types';

export const SCHOOL_SORT_OPTIONS = [
  { value: 'name-asc', label: 'Nazwa (A–Z)' },
  { value: 'name-desc', label: 'Nazwa (Z–A)' },
  { value: 'rating-desc', label: 'Ocena (od najwyższej)' },
  { value: 'rating-asc', label: 'Ocena (od najniższej)' },
] as const;

export type SchoolSort = (typeof SCHOOL_SORT_OPTIONS)[number]['value'];

export const DEFAULT_SCHOOL_SORT: SchoolSort = 'name-asc';

export function isSchoolSort(value: string): value is SchoolSort {
  return SCHOOL_SORT_OPTIONS.some((option) => option.value === value);
}

function compareByName(a: School, b: School): number {
  return a.name.localeCompare(b.name, 'pl');
}

const comparators: Record<SchoolSort, (a: School, b: School) => number> = {
  'name-asc': compareByName,
  'name-desc': (a, b) => compareByName(b, a),
  'rating-desc': (a, b) => b.rating - a.rating || compareByName(a, b),
  'rating-asc': (a, b) => a.rating - b.rating || compareByName(a, b),
};

export function sortSchools(schools: School[], sort: SchoolSort): School[] {
  return [...schools].sort(comparators[sort]);
}
