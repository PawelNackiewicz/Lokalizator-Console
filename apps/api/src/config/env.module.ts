import { resolve } from 'node:path';

import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './env.schema';

/**
 * The whole monorepo uses a single `.env` at the repo root — the same one
 * docker-compose reads, so DATABASE_URL and POSTGRES_* cannot drift apart
 * between the database and the app.
 */
export const EnvModule = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  envFilePath: [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')],
  validate: validateEnv,
});
