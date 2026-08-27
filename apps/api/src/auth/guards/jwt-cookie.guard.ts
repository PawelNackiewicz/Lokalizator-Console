import {
  Injectable,
  UnauthorizedException,
  type CanActivate,
  type ExecutionContext,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { jwtPayloadSchema } from '@lokalizator/shared-types';

import type { Env } from '../../config/env.schema';
import type { AuthenticatedRequest } from '../authenticated-request';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Registered globally (APP_GUARD): the token is read ONLY from the `httpOnly`
 * cookie, never from an `Authorization` header — the web app cannot access the
 * token, so it could not put it there anyway.
 */
@Injectable()
export class JwtCookieGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean | undefined>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic === true) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = request.cookies[this.config.get('AUTH_COOKIE_NAME', { infer: true })];

    if (!token) {
      throw new UnauthorizedException('Brak aktywnej sesji');
    }

    try {
      const claims = await this.jwtService.verifyAsync<Record<string, unknown>>(token);
      // The payload shape is checked with the same schema used to sign it.
      const payload = jwtPayloadSchema.parse(claims);
      request.user = { id: payload.sub, username: payload.username };
      return true;
    } catch {
      // Expired, forged or unexpectedly shaped — all treated the same.
      throw new UnauthorizedException('Sesja wygasła lub jest nieprawidłowa');
    }
  }
}
