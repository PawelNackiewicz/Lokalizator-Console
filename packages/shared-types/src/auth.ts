import { z } from 'zod';

/**
 * Kontrakt logowania. Ten sam schemat waliduje request po stronie API
 * (ZodValidationPipe) i formularz po stronie web — dzięki temu komunikaty
 * i ograniczenia nie rozjeżdżają się między warstwami.
 */
export const loginInputSchema = z.object({
  username: z.string().trim().min(1, 'Login jest wymagany').max(64, 'Login jest za długi'),
  password: z.string().min(1, 'Hasło jest wymagane').max(128, 'Hasło jest za długie'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

/** Reprezentacja zalogowanego użytkownika zwracana przez API. Bez hasła. */
export const authUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

/** Odpowiedź `POST /auth/login` oraz `GET /auth/me`. */
export const authUserResponseSchema = z.object({
  user: authUserSchema,
});

export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;

/** Payload zapisany w JWT. `sub` = users.id. */
export const jwtPayloadSchema = z.object({
  sub: z.uuid(),
  username: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
