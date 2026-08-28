import type { CookieOptions } from 'express';

import { durationToMs } from '../config/duration';
import type { Env } from '../config/env.schema';

/**
 * Shared attributes of the session cookie.
 *
 * - `httpOnly` — the token is out of reach of JS, so XSS cannot steal it.
 * - `secure` — HTTPS only; off in dev because localhost runs over http.
 * - `sameSite: 'lax'` — the web app (`:5173`) and the API (`:3000`) are the same
 *   site (SameSite looks at the registrable domain, not the port), so `lax` is
 *   enough and still blocks CSRF on cross-site POSTs. `strict` would break
 *   returning to the app from an external link.
 *
 * NOTE: `clearCookie` only removes the cookie when given the same attributes
 * (path/sameSite/secure), which is why this is the single source of truth.
 */
export function buildAuthCookieOptions(nodeEnv: Env['NODE_ENV']): CookieOptions {
  return {
    httpOnly: true,
    secure: nodeEnv === 'production',
    sameSite: 'lax',
    path: '/',
  };
}

/** Options used when setting the cookie — `maxAge` matches the JWT lifetime. */
export function buildAuthCookieSetOptions(
  nodeEnv: Env['NODE_ENV'],
  expiresIn: Env['JWT_EXPIRES_IN'],
): CookieOptions {
  return {
    ...buildAuthCookieOptions(nodeEnv),
    maxAge: durationToMs(expiresIn),
  };
}
