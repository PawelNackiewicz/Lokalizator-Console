import { UnauthorizedException, createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { AuthUser } from '@lokalizator/shared-types';

import type { AuthenticatedRequest } from '../authenticated-request';

/** Wstrzykuje użytkownika ustawionego przez `JwtCookieGuard`. */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthUser => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      // Nie powinno się zdarzyć: guard biegnie przed dekoratorem parametru.
      throw new UnauthorizedException('Brak aktywnej sesji');
    }

    return request.user;
  },
);
