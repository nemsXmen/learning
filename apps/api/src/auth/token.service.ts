import { randomUUID } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, LessThan, Repository } from 'typeorm';
import { env } from '../config/env';
import { CryptoService } from './crypto.service';
import { RefreshTokenEntity, UserEntity } from './auth.entities';

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

/**
 * Two tabs can refresh within milliseconds of each other. Inside this window a
 * replayed token is a race, not a theft: the losing call gets 401 and its sibling
 * has already stored fresh cookies, so the session survives. Past it, a replay is
 * a leak and the whole family burns.
 */
export const REFRESH_REUSE_GRACE_SECONDS = 10;

/** Parses `15m`, `30d` and friends into seconds. */
export function durationToSeconds(value: string): number {
  const match = /^(\d+)(ms|s|m|h|d)$/.exec(value);
  if (!match) throw new Error(`Durée invalide : ${value}`);
  const factor: Record<string, number> = { ms: 0.001, s: 1, m: 60, h: 3600, d: 86400 };
  return Math.round(Number(match[1]) * (factor[match[2] as string] ?? 1));
}

export class RefreshTokenReuse extends Error {
  constructor(readonly familyId: string) {
    super('Jeton de rafraîchissement déjà utilisé');
    this.name = 'RefreshTokenReuse';
  }
}

/**
 * Access tokens are short-lived JWTs; refresh tokens are opaque, single use and
 * rotated. Only hashes are stored, so reading the table hands out no sessions.
 */
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly crypto: CryptoService,
    @InjectRepository(RefreshTokenEntity)
    private readonly refreshTokens: Repository<RefreshTokenEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
  ) {}

  async issue(user: UserEntity, familyId: string = randomUUID()): Promise<IssuedTokens> {
    const expiresIn = durationToSeconds(env.JWT_ACCESS_TTL);

    const accessToken = await this.jwt.signAsync(
      { sub: user.id, email: user.email },
      { secret: env.JWT_ACCESS_SECRET, expiresIn },
    );

    const refreshToken = this.crypto.createOpaqueToken();
    await this.refreshTokens.insert({
      userId: user.id,
      tokenHash: this.crypto.hashToken(refreshToken),
      expiresAt: new Date(Date.now() + durationToSeconds(env.JWT_REFRESH_TTL) * 1000),
      familyId,
      revokedAt: null,
      replacedById: null,
    });

    return { accessToken, refreshToken, expiresIn };
  }

  /**
   * Rotates the presented token. The revocation is a conditional UPDATE, so two
   * simultaneous calls cannot both mint a new pair — the second affects no row.
   */
  async rotate(presented: string): Promise<{ tokens: IssuedTokens; user: UserEntity } | null> {
    const tokenHash = this.crypto.hashToken(presented);
    const stored = await this.refreshTokens.findOne({ where: { tokenHash } });
    if (!stored) return null;

    if (stored.revokedAt !== null) {
      const ageSeconds = (Date.now() - stored.revokedAt.getTime()) / 1000;
      if (ageSeconds > REFRESH_REUSE_GRACE_SECONDS) {
        await this.revokeFamily(stored.familyId);
        throw new RefreshTokenReuse(stored.familyId);
      }
      return null;
    }

    if (stored.expiresAt.getTime() <= Date.now()) return null;

    // Whoever flips this row first owns the rotation.
    const claimed = await this.refreshTokens.update(
      { id: stored.id, revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
    if (claimed.affected === 0) return null;

    const user = await this.users.findOne({ where: { id: stored.userId } });
    if (!user) return null;

    const tokens = await this.issue(user, stored.familyId);
    return { tokens, user };
  }

  async revoke(presented: string): Promise<void> {
    await this.refreshTokens.update(
      { tokenHash: this.crypto.hashToken(presented), revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  async revokeFamily(familyId: string): Promise<void> {
    await this.refreshTokens.update(
      { familyId: familyId as RefreshTokenEntity['familyId'], revokedAt: IsNull() },
      { revokedAt: new Date() },
    );
  }

  /** After a password reset: every session, everywhere, ends. */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.refreshTokens.update({ userId, revokedAt: IsNull() }, { revokedAt: new Date() });
  }

  async purgeExpired(): Promise<number> {
    const result = await this.refreshTokens.delete({ expiresAt: LessThan(new Date()) });
    return result.affected ?? 0;
  }
}
