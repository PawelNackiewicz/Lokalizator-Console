import { Global, Inject, Module, type OnApplicationShutdown } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres, { type Sql } from 'postgres';

import type { Env } from '../config/env.schema';
import { DRIZZLE, PG_CLIENT } from './db.tokens';
import * as schema from './schema';

/**
 * Pojedyncza pula połączeń na proces. Moduł jest globalny, żeby feature'y
 * (`users`, `schools`) mogły wstrzyknąć `DRIZZLE` bez importowania go za każdym razem.
 */
@Global()
@Module({
  providers: [
    {
      provide: PG_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>): Sql =>
        postgres(config.get('DATABASE_URL', { infer: true }), { max: 10 }),
    },
    {
      provide: DRIZZLE,
      inject: [PG_CLIENT],
      useFactory: (client: Sql) => drizzle(client, { schema }),
    },
  ],
  exports: [DRIZZLE],
})
export class DbModule implements OnApplicationShutdown {
  constructor(@Inject(PG_CLIENT) private readonly client: Sql) {}

  async onApplicationShutdown(): Promise<void> {
    await this.client.end({ timeout: 5 });
  }
}
