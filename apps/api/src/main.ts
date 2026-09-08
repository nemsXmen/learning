import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });

  // Exact-origin allowlist: the browser never calls this API directly, only the
  // Next.js server does (docs/rules.md #21).
  app.enableCors({ origin: env.WEB_ORIGIN, credentials: true });
  app.enableShutdownHooks();

  await app.listen(env.PORT);
  new Logger('bootstrap').log(`API à l'écoute sur http://localhost:${env.PORT}`);
}

bootstrap().catch((error: unknown) => {
  // Configuration errors are thrown by config/env before Nest builds anything.
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
