import { SetMetadata, type CustomDecorator } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/**
 * Disables the global `JwtCookieGuard` for a handler or controller.
 * EVERYTHING is protected by default — public endpoints must be marked explicitly.
 */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
