const UNIT_TO_MS = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
} as const;

type Unit = keyof typeof UNIT_TO_MS;

const DURATION_PATTERN = /^(\d+)([smhd])$/;

/**
 * Converts a `8h` / `30m` / `7d` duration into milliseconds. The same string feeds
 * both the JWT (`expiresIn`) and the cookie (`maxAge`), so the session and the
 * token expire at exactly the same moment.
 */
export function durationToMs(duration: string): number {
  const match = DURATION_PATTERN.exec(duration);
  const amount = match?.[1];
  const unit = match?.[2];

  if (amount === undefined || unit === undefined) {
    throw new Error(`Nieobsługiwany format czasu: "${duration}". Oczekiwano np. "8h".`);
  }

  return Number(amount) * UNIT_TO_MS[unit as Unit];
}
