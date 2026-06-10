import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  // rawBody: Stripe webhook signatures verify over the exact bytes received.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.setGlobalPrefix('v1');
  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
    credentials: true,
  });
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  Logger.log(`ZENITH API listening on :${port} (prefix /v1)`, 'Bootstrap');
}

void bootstrap();
