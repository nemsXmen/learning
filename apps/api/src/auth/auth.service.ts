import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { RegisterInput } from '@app/validation';
import { env } from '../config/env';
import { MailService } from '../mail/mail.service';
import { CryptoService } from './crypto.service';
import { EmailTokenService, expiryInWords } from './email-token.service';
import { RefreshTokenReuse, TokenService, type IssuedTokens } from './token.service';
import { UserEntity } from './auth.entities';

export interface PublicUser {
  id: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  timezone: string;
  goal: string;
  dailyMinutesTarget: number;
  createdAt: Date;
}

export interface Session extends IssuedTokens {
  user: PublicUser;
}

export function toPublicUser(user: UserEntity): PublicUser {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    emailVerified: user.emailVerifiedAt !== null,
    timezone: user.timezone,
    goal: user.goal,
    dailyMinutesTarget: user.dailyMinutesTarget,
    createdAt: user.createdAt,
  };
}

/**
 * A hash of a password nobody has. Verified against when the account does not
 * exist, so a wrong email and a wrong password cost the same time and cannot be
 * told apart (docs/rules.md #33).
 */
const DUMMY_HASH =
  '$argon2id$v=19$m=19456,t=2,p=1$c29tZXNhbHR2YWx1ZQ$b2xkZHVtbXloYXNodmFsdWVoZXJlMTIzNA';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(UserEntity) private readonly users: Repository<UserEntity>,
    private readonly crypto: CryptoService,
    private readonly tokens: TokenService,
    private readonly emailTokens: EmailTokenService,
    private readonly mail: MailService,
  ) {}

  async register(input: RegisterInput): Promise<Session> {
    const existing = await this.users.findOne({ where: { email: input.email } });
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'Un compte existe déjà avec cette adresse.',
      });
    }

    const user = await this.users.save(
      this.users.create({
        email: input.email,
        passwordHash: await this.crypto.hashPassword(input.password),
        displayName: input.displayName,
        goal: input.goal,
        dailyMinutesTarget: input.dailyMinutesTarget,
        timezone: input.timezone,
        emailVerifiedAt: null,
      }),
    );

    // Queued, never awaited: SMTP being slow must not slow a registration.
    await this.sendVerificationEmail(user);

    const issued = await this.tokens.issue(user);
    return { ...issued, user: toPublicUser(user) };
  }

  async login(email: string, password: string): Promise<Session> {
    const user = await this.users.findOne({ where: { email } });

    // Always run a verification, even without a user, so the timing matches.
    const valid = await this.crypto.verifyPassword(user?.passwordHash ?? DUMMY_HASH, password);

    if (!user || !valid) {
      throw new UnauthorizedException({
        code: 'INVALID_CREDENTIALS',
        message: 'Adresse ou mot de passe incorrect.',
      });
    }

    const issued = await this.tokens.issue(user);
    return { ...issued, user: toPublicUser(user) };
  }

  async refresh(refreshToken: string): Promise<IssuedTokens> {
    try {
      const rotated = await this.tokens.rotate(refreshToken);
      if (!rotated) {
        throw new UnauthorizedException({
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Session expirée.',
        });
      }
      return rotated.tokens;
    } catch (error) {
      if (error instanceof RefreshTokenReuse) {
        this.logger.warn(`Jeton rejoué : famille ${error.familyId} révoquée`);
        throw new UnauthorizedException({
          code: 'INVALID_REFRESH_TOKEN',
          message: 'Session expirée.',
        });
      }
      throw error;
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokens.revoke(refreshToken);
  }

  async me(userId: string): Promise<PublicUser> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({ code: 'UNAUTHENTICATED', message: 'Compte introuvable.' });
    }
    return toPublicUser(user);
  }

  /* ---------------------------------------------------------------------- */
  /* Email verification                                                      */
  /* ---------------------------------------------------------------------- */

  async verifyEmail(token: string): Promise<PublicUser> {
    const userId = await this.emailTokens.consume(token, 'VERIFY_EMAIL');
    if (!userId) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Ce lien est invalide ou a expiré.',
      });
    }

    await this.users.update({ id: userId }, { emailVerifiedAt: new Date() });
    return this.me(userId);
  }

  /** Always succeeds from the caller's point of view, verified or not. */
  async resendVerification(userId: string): Promise<void> {
    const user = await this.users.findOne({ where: { id: userId } });
    if (!user || user.emailVerifiedAt !== null) return;
    await this.sendVerificationEmail(user);
  }

  /* ---------------------------------------------------------------------- */
  /* Password reset                                                          */
  /* ---------------------------------------------------------------------- */

  /**
   * Returns nothing whether or not the address exists: the response must not
   * reveal who has an account (docs/rules.md #33).
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.users.findOne({ where: { email } });
    if (!user) return;

    const token = await this.emailTokens.issue(user.id, 'RESET_PASSWORD');
    await this.mail.enqueue({
      template: 'reset-password',
      to: user.email,
      variables: {
        displayName: user.displayName,
        link: `${env.APP_URL}/reset-password?token=${encodeURIComponent(token)}`,
        expiresIn: expiryInWords('RESET_PASSWORD'),
      },
    });
  }

  async resetPassword(token: string, password: string): Promise<void> {
    const userId = await this.emailTokens.consume(token, 'RESET_PASSWORD');
    if (!userId) {
      throw new UnauthorizedException({
        code: 'INVALID_TOKEN',
        message: 'Ce lien est invalide ou a expiré.',
      });
    }

    const user = await this.users.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException({ code: 'INVALID_TOKEN', message: 'Ce lien est invalide.' });
    }

    await this.users.update(
      { id: userId },
      { passwordHash: await this.crypto.hashPassword(password) },
    );
    // Changing a password ends every session, everywhere.
    await this.tokens.revokeAllForUser(userId);

    await this.mail.enqueue({
      template: 'password-changed',
      to: user.email,
      variables: { displayName: user.displayName },
    });
  }

  private async sendVerificationEmail(user: UserEntity): Promise<void> {
    const token = await this.emailTokens.issue(user.id, 'VERIFY_EMAIL');
    await this.mail.enqueue({
      template: 'verify-email',
      to: user.email,
      variables: {
        displayName: user.displayName,
        link: `${env.APP_URL}/verify-email?token=${encodeURIComponent(token)}`,
        expiresIn: expiryInWords('VERIFY_EMAIL'),
      },
    });
  }
}
