import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS } from '../redis/redis.tokens';

export interface RateLimit {
  /** Requests allowed inside the window. */
  max: number;
  windowSeconds: number;
}

/** Per IP and per account, because either alone is trivially worked around. */
export const RATE_LIMITS = {
  login: { max: 10, windowSeconds: 300 },
  register: { max: 5, windowSeconds: 3600 },
  refresh: { max: 60, windowSeconds: 300 },
  forgotPassword: { max: 3, windowSeconds: 3600 },
  resendVerification: { max: 3, windowSeconds: 3600 },
} as const satisfies Record<string, RateLimit>;

export type RateLimitName = keyof typeof RATE_LIMITS;

@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(@Inject(REDIS) private readonly redis: Redis) {}

  /**
   * Throws 429 with `Retry-After` once the window is exhausted. A Redis outage
   * lets the request through: refusing every login because a cache is down would
   * be a worse failure than a missing limit.
   */
  async consume(name: RateLimitName, discriminator: string): Promise<void> {
    const limit = RATE_LIMITS[name];
    const key = `ratelimit:${name}:${discriminator}`;

    let count: number;
    let ttl: number;
    try {
      count = await this.redis.incr(key);
      if (count === 1) await this.redis.expire(key, limit.windowSeconds);
      ttl = await this.redis.ttl(key);
    } catch (error) {
      this.logger.warn(`Limitation indisponible pour ${key} : ${(error as Error).message}`);
      return;
    }

    if (count > limit.max) {
      const retryAfter = ttl > 0 ? ttl : limit.windowSeconds;
      throw new HttpException(
        {
          code: 'RATE_LIMITED',
          message: `Trop de tentatives. Réessaie dans ${retryAfter} secondes.`,
          retryAfter,
        },
        HttpStatus.TOO_MANY_REQUESTS,
        { description: String(retryAfter) },
      );
    }
  }

  /** Clears a counter after a legitimate success, so one typo is not punished. */
  async reset(name: RateLimitName, discriminator: string): Promise<void> {
    try {
      await this.redis.del(`ratelimit:${name}:${discriminator}`);
    } catch {
      // Nothing to do: the counter simply expires on its own.
    }
  }
}
