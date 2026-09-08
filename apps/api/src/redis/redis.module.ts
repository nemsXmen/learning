import { Global, Logger, Module } from '@nestjs/common';
import { Redis } from 'ioredis';
import { env } from '../config/env';
import { REDIS } from './redis.tokens';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      useFactory: () => {
        const client = new Redis(env.REDIS_URL, {
          maxRetriesPerRequest: 1,
          // Fail fast instead of queueing: the health check must answer, not hang.
          enableOfflineQueue: false,
        });
        // Without a listener, a connection error becomes an unhandled error event
        // and takes the process down. Redis being unreachable is a degraded state,
        // not a crash.
        const logger = new Logger('Redis');
        client.on('error', (error: Error) => logger.warn(error.message));
        return client;
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
