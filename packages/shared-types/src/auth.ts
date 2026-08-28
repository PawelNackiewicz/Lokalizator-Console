import { z } from 'zod';

/**
 * The login contract. The same schema validates the request on the API side
 * (ZodValidationPipe) and the form on the web side, so messages and constraints
 * cannot drift apart between layers.
 */
export const loginInputSchema = z.object({
  username: z.string().trim().min(1, 'Login jest wymagany').max(64, 'Login jest za długi'),
  password: z.string().min(1, 'Hasło jest wymagane').max(128, 'Hasło jest za długie'),
});

export type LoginInput = z.infer<typeof loginInputSchema>;

/** The signed-in user as returned by the API. No password. */
export const authUserSchema = z.object({
  id: z.uuid(),
  username: z.string(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

/** Response of `POST /auth/login` and `GET /auth/me`. */
export const authUserResponseSchema = z.object({
  user: authUserSchema,
});

export type AuthUserResponse = z.infer<typeof authUserResponseSchema>;

/** Payload stored in the JWT. `sub` = users.id. */
export const jwtPayloadSchema = z.object({
  sub: z.uuid(),
  username: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
