import { z } from 'zod';

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/**
 * A school in the shape the API returns it (JSON).
 * `rating` is a number with one decimal place (numeric(2,1) in the database),
 * `createdAt` is an ISO-8601 string — JSON has no date type.
 */
export const schoolSchema = z.object({
  id: z.uuid(),
  name: z.string(),
  address: z.string(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  rating: z.number().min(RATING_MIN).max(RATING_MAX),
  createdAt: z.iso.datetime(),
});

export type School = z.infer<typeof schoolSchema>;

export const schoolListSchema = z.array(schoolSchema);

/** Validation of the `GET /schools/:id` path parameter. */
export const schoolIdParamSchema = z.object({
  id: z.uuid('Nieprawidłowy identyfikator szkoły'),
});

export type SchoolIdParam = z.infer<typeof schoolIdParamSchema>;
