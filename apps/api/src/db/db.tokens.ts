import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import type * as schema from './schema';

/** Token DI dla instancji Drizzle. */
export const DRIZZLE = Symbol('DRIZZLE');

/** Token DI dla surowego klienta postgres.js (potrzebny do zamknięcia puli). */
export const PG_CLIENT = Symbol('PG_CLIENT');

/** Typ wstrzykiwany przez `@Inject(DRIZZLE)`. */
export type Database = PostgresJsDatabase<typeof schema>;
