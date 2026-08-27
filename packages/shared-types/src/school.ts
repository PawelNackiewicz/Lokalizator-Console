import { z } from 'zod';

export const RATING_MIN = 1;
export const RATING_MAX = 5;

/**
 * Szkoła w postaci, w jakiej wychodzi z API (JSON).
 * `rating` jest liczbą z jednym miejscem po przecinku (w bazie numeric(2,1)),
 * `createdAt` jest stringiem ISO-8601 — JSON nie ma typu daty.
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

/** Walidacja parametru ścieżki `GET /schools/:id`. */
export const schoolIdParamSchema = z.object({
  id: z.uuid('Nieprawidłowy identyfikator szkoły'),
});

export type SchoolIdParam = z.infer<typeof schoolIdParamSchema>;
