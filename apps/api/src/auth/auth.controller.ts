import { Body, Controller, Get, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import {
  authUserResponseSchema,
  loginInputSchema,
  type AuthUser,
  type AuthUserResponse,
  type LoginInput,
} from '@lokalizator/shared-types';
import type { Response } from 'express';

import { unauthorizedErrorSchema, validationErrorSchema } from '../common/swagger/error-schemas';
import { zodSchema } from '../common/swagger/zod-schema';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import type { Env } from '../config/env.schema';
import { AuthService } from './auth.service';
import { buildAuthCookieOptions, buildAuthCookieSetOptions } from './cookie';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
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
  @ApiOperation({ summary: 'Logs the user in and sets the session httpOnly cookie' })
  @ApiBody({ schema: zodSchema(loginInputSchema) })
  @ApiOkResponse({ schema: zodSchema(authUserResponseSchema) })
  @ApiBadRequestResponse({ schema: validationErrorSchema })
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
   * Public on purpose: logging out must work (and clear the cookie) even once the
   * token has expired. The operation is idempotent.
   */
  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Clears the session cookie — idempotent, works without a session too' })
  @ApiNoContentResponse()
  logout(@Res({ passthrough: true }) response: Response): void {
    response.clearCookie(
      this.cookieName,
      buildAuthCookieOptions(this.config.get('NODE_ENV', { infer: true })),
    );
  }

  @Get('me')
  @ApiOperation({ summary: 'Returns the currently logged-in user' })
  @ApiCookieAuth()
  @ApiOkResponse({ schema: zodSchema(authUserResponseSchema) })
  @ApiUnauthorizedResponse({ schema: unauthorizedErrorSchema })
  me(@CurrentUser() user: AuthUser): AuthUserResponse {
    return { user };
  }
}
