import type { School } from '@lokalizator/shared-types';

// "ł" has no Unicode decomposition, so NFD alone would not match it with "l".
function normalize(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '').replace(/ł/gi, 'l').toLowerCase().trim();
}

export function filterSchoolsByName(schools: School[], query: string): School[] {
  const needle = normalize(query);

  if (needle === '') {
    return schools;
  }

  return schools.filter((school) => normalize(school.name).includes(needle));
}
