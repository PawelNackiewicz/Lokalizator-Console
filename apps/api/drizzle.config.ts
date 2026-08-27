import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit uruchamiany jest z katalogu apps/api, a .env leży w rootcie repo.
config({ path: ['../../.env', '.env'], quiet: true });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    'Brak DATABASE_URL. Skopiuj .env.example do .env w rootcie repo (cp .env.example .env).',
  );
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: { url: databaseUrl },
  strict: true,
  verbose: true,
});
