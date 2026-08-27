import { sql } from 'drizzle-orm';
import {
  check,
  doublePrecision,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

/**
 * Użytkownicy konsoli. Na tym etapie brak rejestracji i resetu hasła —
 * konta powstają wyłącznie przez `pnpm db:seed`.
 */
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  username: varchar('username', { length: 64 }).notNull().unique(),
  /** bcrypt hash — plaintext nie trafia do bazy nawet w seedzie. */
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const schools = pgTable(
  'schools',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    /** Pełny adres w jednym polu — wystarczające na MVP, patrz TODO w README. */
    address: varchar('address', { length: 512 }).notNull(),
    latitude: doublePrecision('latitude').notNull(),
    longitude: doublePrecision('longitude').notNull(),
    /** numeric(2,1) wymusza dokładnie jedno miejsce po przecinku (1.0 – 5.0). */
    rating: numeric('rating', { precision: 2, scale: 1 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check('schools_rating_range', sql`${table.rating} >= 1.0 AND ${table.rating} <= 5.0`),
    check('schools_latitude_range', sql`${table.latitude} >= -90 AND ${table.latitude} <= 90`),
    check('schools_longitude_range', sql`${table.longitude} >= -180 AND ${table.longitude} <= 180`),
  ],
);

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
export type SchoolRow = typeof schools.$inferSelect;
export type NewSchoolRow = typeof schools.$inferInsert;
