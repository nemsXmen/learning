import { Global, Inject, Logger, Module, type OnModuleDestroy } from '@nestjs/common';
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
export class RedisModule implements OnModuleDestroy {
  constructor(@Inject(REDIS) private readonly client: Redis) {}

  /**
   * A socket built by a factory is one Nest cannot close on its own. Without
   * this, `app.close()` returned but the process stayed alive on the open
   * ioredis handle — which is why `mastery:replay` printed its report and then
   * hung until it was killed.
   */
  async onModuleDestroy(): Promise<void> {
    // `quit` waits for the server to acknowledge; if the connection is already
    // gone, drop it rather than leaving the handle behind.
    await this.client.quit().catch(() => {
      this.client.disconnect();
    });
  }
}
