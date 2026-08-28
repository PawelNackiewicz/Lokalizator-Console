import 'reflect-metadata';

import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

import { AppModule } from './app.module';
import type { Env } from './config/env.schema';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const config = app.get<ConfigService<Env, true>>(ConfigService);

  // The guard reads the token from the cookie, so the parser must run before routing.
  app.use(cookieParser());

  // CORS with credentials requires an exact origin — browsers reject a wildcard
  // when `credentials: true`.
  app.enableCors({
    origin: config.get('WEB_ORIGIN', { infer: true }),
    credentials: true,
  });

  // Lets the Postgres connection pool close on SIGTERM/SIGINT.
  app.enableShutdownHooks();

  // Not exposed in production — the schema shapes and auth flow are internal.
  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Lokalizator API')
      .setDescription('Console for browsing schools — JWT auth via an httpOnly cookie')
      .setVersion('0.1.0')
      .addCookieAuth(config.get('AUTH_COOKIE_NAME', { infer: true }), {
        type: 'apiKey',
        in: 'cookie',
      })
      .build();
    const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('docs', app, swaggerDocument);
  }

  const port = config.get('API_PORT', { infer: true });
  await app.listen(port);

  Logger.log(`API nasłuchuje na http://localhost:${port}`, 'Bootstrap');
}

void bootstrap();
