import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

import type * as schema from './schema';

export const DRIZZLE = Symbol('DRIZZLE');

/** Raw postgres.js client — exposed only so the pool can be closed on shutdown. */
export const PG_CLIENT = Symbol('PG_CLIENT');

export type Database = PostgresJsDatabase<typeof schema>;
