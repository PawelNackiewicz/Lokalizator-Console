import { resolve } from 'node:path';

import { ConfigModule } from '@nestjs/config';

import { validateEnv } from './env.schema';

/**
 * Całe monorepo korzysta z jednego pliku `.env` w rootcie repo — ten sam,
 * który czyta docker-compose. Dzięki temu DATABASE_URL i POSTGRES_* nie mogą
 * się rozjechać między bazą a aplikacją.
 */
export const EnvModule = ConfigModule.forRoot({
  isGlobal: true,
  cache: true,
  envFilePath: [resolve(process.cwd(), '../../.env'), resolve(process.cwd(), '.env')],
  validate: validateEnv,
});
