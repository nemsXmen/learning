import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { env } from '../config/env';
import { CryptoService } from './crypto.service';
import { EmailTokenEntity, type EmailTokenPurpose } from './auth.entities';
import { durationToSeconds } from './token.service';

const TTL: Record<EmailTokenPurpose, () => number> = {
  VERIFY_EMAIL: () => durationToSeconds(env.EMAIL_VERIFICATION_TTL),
  RESET_PASSWORD: () => durationToSeconds(env.PASSWORD_RESET_TTL),
};

/** Human wording for the emails, so the reader knows how long they have. */
export function expiryInWords(purpose: EmailTokenPurpose): string {
  const seconds = TTL[purpose]();
  if (seconds % 3600 === 0) {
    const hours = seconds / 3600;
    return hours === 1 ? '1 heure' : `${hours} heures`;
  }
  return `${Math.round(seconds / 60)} minutes`;
}

/**
 * Verification and reset tokens: single use, purpose-scoped and time limited.
 * Only the hash is stored — the plaintext exists in the emailed link and nowhere
 * else (docs/rules.md #32).
 */
@Injectable()
export class EmailTokenService {
  constructor(
    private readonly crypto: CryptoService,
    @InjectRepository(EmailTokenEntity)
    private readonly tokens: Repository<EmailTokenEntity>,
  ) {}

  /** Issuing invalidates the user's outstanding tokens for the same purpose. */
  async issue(userId: string, purpose: EmailTokenPurpose): Promise<string> {
    await this.tokens.update(
      { userId, purpose, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );

    const token = this.crypto.createOpaqueToken();
    await this.tokens.insert({
      userId,
      purpose,
      tokenHash: this.crypto.hashToken(token),
      expiresAt: new Date(Date.now() + TTL[purpose]() * 1000),
      consumedAt: null,
    });

    return token;
  }

  /**
   * Returns the user id, or null for an unknown, expired or already-used token —
   * the three cases are indistinguishable to the caller on purpose.
   */
  async consume(token: string, purpose: EmailTokenPurpose): Promise<string | null> {
    const tokenHash = this.crypto.hashToken(token);
    const stored = await this.tokens.findOne({ where: { tokenHash, purpose } });

    if (!stored || stored.consumedAt !== null) return null;
    if (stored.expiresAt.getTime() <= Date.now()) return null;

    // Conditional update: a token can only ever be consumed once.
    const claimed = await this.tokens.update(
      { id: stored.id, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );
    if (claimed.affected === 0) return null;

    return stored.userId;
  }
}
