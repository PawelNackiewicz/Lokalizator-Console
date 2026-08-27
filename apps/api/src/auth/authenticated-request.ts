import type { AuthUser } from '@lokalizator/shared-types';
import type { Request } from 'express';

/**
 * `@types/express` types `cookies` as `any`; narrowed here so reading the token
 * is type-safe.
 */
export interface AuthenticatedRequest extends Request {
  cookies: Record<string, string | undefined>;
  user?: AuthUser;
}
