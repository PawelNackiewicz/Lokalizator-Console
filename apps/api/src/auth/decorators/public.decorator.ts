import { SetMetadata, type CustomDecorator } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'auth:isPublic';

/**
 * Wyłącza globalny `JwtCookieGuard` dla danego handlera lub kontrolera.
 * Domyślnie WSZYSTKO jest chronione — publiczne endpointy trzeba oznaczyć jawnie.
 */
export const Public = (): CustomDecorator => SetMetadata(IS_PUBLIC_KEY, true);
