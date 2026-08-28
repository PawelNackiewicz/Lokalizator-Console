import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit runs from apps/api, but .env lives at the repo root.
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
