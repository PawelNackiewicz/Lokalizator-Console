import { describe, expect, it } from 'vitest';

import { durationToMs } from './duration';

describe('durationToMs', () => {
  it('przelicza obsługiwane jednostki na milisekundy', () => {
    expect(durationToMs('30s')).toBe(30_000);
    expect(durationToMs('15m')).toBe(900_000);
    expect(durationToMs('8h')).toBe(28_800_000);
    expect(durationToMs('7d')).toBe(604_800_000);
  });

  it('odrzuca nieobsługiwany format', () => {
    expect(() => durationToMs('8 hours')).toThrow(/Nieobsługiwany format/);
    expect(() => durationToMs('8w')).toThrow(/Nieobsługiwany format/);
    expect(() => durationToMs('')).toThrow(/Nieobsługiwany format/);
  });
});
