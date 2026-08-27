import { hash } from 'bcryptjs';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { z } from 'zod';

import { SEED_SCHOOLS } from './seed-data/schools';
import * as schema from './schema';
import { schools, users } from './schema';

// Skrypt uruchamiany jest z apps/api, a .env leży w rootcie repo.
config({ path: ['../../.env', '.env'], quiet: true });

const BCRYPT_ROUNDS = 12;

/**
 * Seed ma własny schemat ENV — dane admina są potrzebne wyłącznie tutaj
 * i celowo NIE są częścią konfiguracji aplikacji (nie chcemy hasła w runtime API).
 */
const seedEnvSchema = z.object({
  DATABASE_URL: z.url('DATABASE_URL musi być poprawnym URL-em'),
  SEED_ADMIN_USER: z.string().trim().min(1).max(64).default('admin'),
  SEED_ADMIN_PASSWORD: z.string().min(1).max(128).default('admin'),
});

async function main(): Promise<void> {
  const env = seedEnvSchema.parse(process.env);
  // `--reset` czyści tabelę szkół przed wstawieniem — przydatne przy zmianie danych startowych.
  const reset = process.argv.includes('--reset');

  const client = postgres(env.DATABASE_URL, { max: 1 });
  const db = drizzle(client, { schema });

  try {
    // --- Użytkownik administracyjny ------------------------------------------
    const passwordHash = await hash(env.SEED_ADMIN_PASSWORD, BCRYPT_ROUNDS);

    await db
      .insert(users)
      .values({ username: env.SEED_ADMIN_USER, passwordHash })
      .onConflictDoUpdate({ target: users.username, set: { passwordHash } });

    console.log(`✔ Użytkownik "${env.SEED_ADMIN_USER}" gotowy (hasło z SEED_ADMIN_PASSWORD).`);

    // --- Szkoły ---------------------------------------------------------------
    if (reset) {
      await db.delete(schools);
      console.log('… wyczyszczono tabelę schools (--reset).');
    }

    const [existing] = await db.select({ count: sql<number>`count(*)::int` }).from(schools);

    if ((existing?.count ?? 0) > 0) {
      console.log(
        `✔ Tabela schools zawiera już ${existing?.count ?? 0} rekordów — pomijam. ` +
          'Użyj `pnpm db:seed --reset`, aby nadpisać.',
      );
      return;
    }

    await db.insert(schools).values(SEED_SCHOOLS);
    console.log(`✔ Wstawiono ${SEED_SCHOOLS.length} szkół.`);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  console.error('✖ Seed nie powiódł się:');
  console.error(error);
  process.exitCode = 1;
});
