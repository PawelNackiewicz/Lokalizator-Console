import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  loginInputSchema,
  type AuthUser,
  type AuthUserResponse,
  type LoginInput,
} from '@lokalizator/shared-types';
import type { Response } from 'express';

import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { Env } from '../config/env.schema';
import { AuthService } from './auth.service';
import { buildAuthCookieOptions, buildAuthCookieSetOptions } from './cookie';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  private get cookieName(): string {
    return this.config.get('AUTH_COOKIE_NAME', { infer: true });
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body(new ZodValidationPipe(loginInputSchema)) credentials: LoginInput,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthUserResponse> {
    const user = await this.authService.validateCredentials(credentials);
    const token = await this.authService.issueAccessToken(user);

    response.cookie(
      this.cookieName,
      token,
      buildAuthCookieSetOptions(
        this.config.get('NODE_ENV', { infer: true }),
        this.config.get('JWT_EXPIRES_IN', { infer: true }),
      ),
    );

    return { user };
  }

  /**
   * Publiczny celowo: wylogowanie ma działać (i czyścić ciasteczko) także wtedy,
   * gdy token już wygasł. Operacja jest idempotentna.
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(
      this.cookieName,
      buildAuthCookieOptions(this.config.get('NODE_ENV', { infer: true })),
    );
  }

  @Get('me')
  me(@CurrentUser() user: AuthUser): AuthUserResponse {
    return { user };
  }
}
