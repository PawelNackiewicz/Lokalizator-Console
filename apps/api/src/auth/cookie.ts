import type { CookieOptions } from 'express';

import { durationToMs } from '../config/duration';
import type { Env } from '../config/env.schema';

/**
 * Wspólne atrybuty ciasteczka sesyjnego.
 *
 * - `httpOnly`  — token jest niedostępny dla JS, więc XSS go nie wykradnie.
 * - `secure`    — tylko HTTPS; w dev wyłączone, bo localhost chodzi po http.
 * - `sameSite: 'lax'` — front (`:5173`) i API (`:3000`) to ten sam site
 *   (SameSite patrzy na domenę rejestrowalną, nie na port), więc `lax` wystarcza
 *   i jednocześnie blokuje CSRF przy żądaniach cross-site typu POST.
 *   `strict` zerwałoby powrót do aplikacji z zewnętrznego linku.
 *
 * UWAGA: `clearCookie` usunie ciasteczko tylko wtedy, gdy dostanie te same
 * atrybuty (path/sameSite/secure) — dlatego jest to jedno źródło prawdy.
 */
export function buildAuthCookieOptions(nodeEnv: Env['NODE_ENV']): CookieOptions {
  return {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

/** Opcje przy ustawianiu ciasteczka — `maxAge` zrównany z czasem życia JWT. */
export function buildAuthCookieSetOptions(
  nodeEnv: Env['NODE_ENV'],
  expiresIn: Env['JWT_EXPIRES_IN'],
): CookieOptions {
  return {
    ...buildAuthCookieOptions(nodeEnv),
    maxAge: durationToMs(expiresIn),
  };
}
