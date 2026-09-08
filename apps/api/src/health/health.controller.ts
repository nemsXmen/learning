import { Controller, Get, Inject, ServiceUnavailableException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Redis } from 'ioredis';
import { REDIS } from '../redis/redis.tokens';

type DependencyState = 'up' | 'down';

/**
 * Reports the state of each dependency rather than a bare "ok": an outage must
 * name what is failing (features/01-platform-foundation/CONTRACT.md).
 */
@Controller('health')
export class HealthController {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @Inject(REDIS) private readonly redis: Redis,
  ) {}

  @Get()
  async check(): Promise<{ status: 'ok'; db: DependencyState; redis: DependencyState }> {
    const [db, redis] = await Promise.all([this.checkDatabase(), this.checkRedis()]);

    if (db === 'down' || redis === 'down') {
      throw new ServiceUnavailableException({ status: 'degraded', db, redis });
    }
    return { status: 'ok', db, redis };
  }

  private async checkDatabase(): Promise<DependencyState> {
    try {
      await this.dataSource.query('select 1');
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async checkRedis(): Promise<DependencyState> {
    try {
      await this.redis.ping();
      return 'up';
    } catch {
      return 'down';
    }
  }
}
