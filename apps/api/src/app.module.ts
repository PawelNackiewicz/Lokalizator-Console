import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { EnvModule } from './config/env.module';
import { DbModule } from './db/db.module';
import { SchoolsModule } from './schools/schools.module';

@Module({
  imports: [EnvModule, DbModule, AuthModule, SchoolsModule],
  controllers: [AppController],
})
export class AppModule {}
