import { z } from 'zod';

/** Format accepted by `@nestjs/jwt` (expiresIn) — e.g. `8h`, `30m`, `7d`. */
const durationSchema = z
  .string()
  .regex(/^\d+[smhd]$/, 'Oczekiwano czasu w formacie <liczba><s|m|h|d>, np. "8h"');

/**
 * Single source of truth for the backend's environment variables. The app refuses
 * to boot if any of them is invalid — a config error should surface at startup,
 * not on the first request.
 */
export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  API_PORT: z.coerce.number().int().positive().max(65535).default(3000),

  /** Exact web app origin — CORS with credentials rejects wildcards. */
  WEB_ORIGIN: z.url().default('http://localhost:5173'),

  DATABASE_URL: z.url(
    'DATABASE_URL musi być poprawnym URL-em, np. postgres://user:pass@host:5432/db',
  ),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET musi mieć co najmniej 32 znaki'),
  JWT_EXPIRES_IN: durationSchema.default('8h'),

  AUTH_COOKIE_NAME: z.string().min(1).default('lokalizator_token'),
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validator wired into `ConfigModule.forRoot({ validate })`. Throws a readable
 * error listing every missing or invalid variable at once.
 */
export function validateEnv(raw: Record<string, unknown>): Env {
  const result = envSchema.safeParse(raw);

  if (!result.success) {
    const details = Object.entries(z.flattenError(result.error).fieldErrors)
      .map(([key, messages]) => `  - ${key}: ${(messages ?? []).join('; ')}`)
      .join('\n');

    throw new Error(`Niepoprawna konfiguracja środowiska (.env):\n${details}`);
  }

  return result.data;
}
