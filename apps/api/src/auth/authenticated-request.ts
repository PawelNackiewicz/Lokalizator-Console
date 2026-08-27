import type { AuthUser } from '@lokalizator/shared-types';
import type { Request } from 'express';

/**
 * `@types/express` typuje `cookies` jako `any`. Zawężamy to lokalnie,
 * żeby odczyt tokena był bezpieczny typologicznie.
 */
export interface AuthenticatedRequest extends Request {
  cookies: Record<string, string | undefined>;
  user?: AuthUser;
}
