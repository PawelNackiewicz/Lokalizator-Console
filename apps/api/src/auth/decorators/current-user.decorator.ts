import { UnauthorizedException, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@lokalizator/shared-types';

import type { AuthenticatedRequest } from '../authenticated-request';

/** Injects the user set by `JwtCookieGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      // Should not happen: the guard runs before the param decorator.
      throw new UnauthorizedException('Brak aktywnej sesji');
    }

    return request.user;
  },
);
