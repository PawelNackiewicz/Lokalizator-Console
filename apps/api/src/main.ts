import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import type { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // Guard czyta token z ciasteczka, więc parser musi być przed routingiem.
  app.use(cookieParser());

  // CORS z credentials wymaga dokładnego origin — wildcard jest odrzucany
  // przez przeglądarkę, gdy `credentials: true`.
  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
  });

  // Pozwala zamknąć pulę połączeń Postgresa przy SIGTERM/SIGINT.
  app.enableShutdownHooks();

  const port = config.get('API_PORT', { infer: true });
  await app.listen(port);

  Logger.log(`API nasłuchuje na http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
