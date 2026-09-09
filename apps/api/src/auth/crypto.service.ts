import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Algorithm, hash, verify } from '@node-rs/argon2';

/**
 * Every one-way transformation in the auth module, in one place.
 *
 * Passwords use argon2id (docs/decisions.md). Opaque tokens use SHA-256: they are
 * 256 bits of entropy already, so stretching them buys nothing, and lookups must
 * stay fast enough to run on every refresh.
 */
@Injectable()
export class CryptoService {
  async hashPassword(plain: string): Promise<string> {
    return hash(plain, { algorithm: Algorithm.Argon2id });
  }

  async verifyPassword(passwordHash: string, plain: string): Promise<boolean> {
    try {
      return await verify(passwordHash, plain);
    } catch {
      // A malformed stored hash must read as "wrong password", never as a crash.
      return false;
    }
  }

  /** 32 random bytes, URL-safe: what goes in a cookie or an emailed link. */
  createOpaqueToken(): string {
    return randomBytes(32).toString('base64url');
  }

  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Constant-time compare, for the rare path that compares two digests. */
  matchesToken(token: string, expectedHash: string): boolean {
    const actual = Buffer.from(this.hashToken(token), 'hex');
    const expected = Buffer.from(expectedHash, 'hex');
    if (actual.length !== expected.length) return false;
    return timingSafeEqual(actual, expected);
  }
}
