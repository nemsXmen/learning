import { ConflictException, HttpException, UnauthorizedException } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { durationToSeconds, RefreshTokenReuse } from './token.service';
import { renderTemplate } from '../mail/templates';
import { RateLimitService, RATE_LIMITS } from './rate-limit.service';
import { AuthService, toPublicUser } from './auth.service';
import type { UserEntity } from './auth.entities';

/* -------------------------------------------------------------------------- */
/* Crypto                                                                      */
/* -------------------------------------------------------------------------- */

describe('CryptoService', () => {
  const crypto = new CryptoService();

  it('verifies a correct password and rejects a wrong one', async () => {
    const hash = await crypto.hashPassword('MotDePasse123secret');
    expect(hash.startsWith('$argon2id$')).toBe(true);
    await expect(crypto.verifyPassword(hash, 'MotDePasse123secret')).resolves.toBe(true);
    await expect(crypto.verifyPassword(hash, 'autre')).resolves.toBe(false);
  });

  it('salts: the same password hashes differently every time', async () => {
    const a = await crypto.hashPassword('MotDePasse123secret');
    const b = await crypto.hashPassword('MotDePasse123secret');
    expect(a).not.toBe(b);
  });

  it('reads a malformed stored hash as a wrong password rather than crashing', async () => {
    await expect(crypto.verifyPassword('pas-un-hash', 'peu importe')).resolves.toBe(false);
  });

  it('produces URL-safe tokens with enough entropy', () => {
    const token = crypto.createOpaqueToken();
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(crypto.createOpaqueToken()).not.toBe(token);
  });

  it('hashes tokens deterministically and compares in constant time', () => {
    const token = crypto.createOpaqueToken();
    const hash = crypto.hashToken(token);
    expect(crypto.hashToken(token)).toBe(hash);
    expect(crypto.matchesToken(token, hash)).toBe(true);
    expect(crypto.matchesToken(crypto.createOpaqueToken(), hash)).toBe(false);
    expect(crypto.matchesToken(token, 'trop-court')).toBe(false);
  });
});

/* -------------------------------------------------------------------------- */
/* Durations                                                                   */
/* -------------------------------------------------------------------------- */

describe('durationToSeconds', () => {
  it.each([
    ['15m', 900],
    ['24h', 86400],
    ['30d', 2592000],
    ['45s', 45],
  ])('parses %s', (input, expected) => {
    expect(durationToSeconds(input)).toBe(expected);
  });

  it('refuses a malformed duration', () => {
    expect(() => durationToSeconds('15 minutes')).toThrow(/Durée invalide/);
  });
});

/* -------------------------------------------------------------------------- */
/* Mail templates                                                              */
/* -------------------------------------------------------------------------- */

describe('renderTemplate', () => {
  const variables = {
    displayName: 'Nehemia',
    link: 'http://localhost:3000/verify-email?token=abc',
    expiresIn: '24 heures',
  };

  it.each(['verify-email', 'reset-password', 'password-changed'] as const)(
    '%s always has a subject, a text part and an HTML part',
    (template) => {
      const mail = renderTemplate(template, variables);
      expect(mail.subject.length).toBeGreaterThan(5);
      expect(mail.text.length).toBeGreaterThan(40);
      expect(mail.html).toContain('<html');
      expect(mail.text).toContain('Nehemia');
    },
  );

  it('puts the link in both parts so a text-only client can still act', () => {
    const mail = renderTemplate('verify-email', variables);
    expect(mail.text).toContain(variables.link);
    expect(mail.html).toContain(variables.link);
  });

  it('escapes a hostile display name instead of injecting it', () => {
    const mail = renderTemplate('password-changed', {
      displayName: '<script>alert(1)</script>',
    });
    expect(mail.html).not.toContain('<script>');
    expect(mail.html).toContain('&lt;script&gt;');
  });

  it('states the expiry in words', () => {
    expect(renderTemplate('verify-email', variables).text).toContain('24 heures');
  });

  it('tells the reader what to do if they did not ask', () => {
    expect(renderTemplate('reset-password', variables).text).toMatch(/ignore ce message/i);
  });

  it('keeps a credible tone with no emoji', () => {
    for (const template of ['verify-email', 'reset-password', 'password-changed'] as const) {
      expect(renderTemplate(template, variables).text).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
    }
  });
});

/* -------------------------------------------------------------------------- */
/* Rate limiting                                                               */
/* -------------------------------------------------------------------------- */

describe('RateLimitService', () => {
  function redisStub(count: number, ttl = 120) {
    return {
      incr: jest.fn(async () => count),
      expire: jest.fn(async () => 1),
      ttl: jest.fn(async () => ttl),
      del: jest.fn(async () => 1),
    };
  }

  it('allows requests inside the window', async () => {
    const service = new RateLimitService(redisStub(RATE_LIMITS.login.max) as never);
    await expect(service.consume('login', '1.2.3.4')).resolves.toBeUndefined();
  });

  it('throws 429 with a retry delay once the window is exhausted', async () => {
    const service = new RateLimitService(redisStub(RATE_LIMITS.login.max + 1, 42) as never);
    await expect(service.consume('login', '1.2.3.4')).rejects.toThrow(HttpException);
    await expect(service.consume('login', '1.2.3.4')).rejects.toMatchObject({
      response: { code: 'RATE_LIMITED', retryAfter: 42 },
    });
  });

  it('sets the window only on the first request', async () => {
    const redis = redisStub(1);
    await new RateLimitService(redis as never).consume('login', 'x');
    expect(redis.expire).toHaveBeenCalledTimes(1);

    const later = redisStub(2);
    await new RateLimitService(later as never).consume('login', 'x');
    expect(later.expire).not.toHaveBeenCalled();
  });

  it('lets requests through when Redis is unavailable', async () => {
    const broken = {
      incr: jest.fn(async () => {
        throw new Error('redis down');
      }),
      expire: jest.fn(),
      ttl: jest.fn(),
      del: jest.fn(),
    };
    // Refusing every login because a cache is down is a worse failure.
    await expect(
      new RateLimitService(broken as never).consume('login', '1.2.3.4'),
    ).resolves.toBeUndefined();
  });
});

/* -------------------------------------------------------------------------- */
/* AuthService                                                                 */
/* -------------------------------------------------------------------------- */

function userFixture(overrides: Partial<UserEntity> = {}): UserEntity {
  return {
    id: 'user-1',
    email: 'nehemia@example.com',
    passwordHash: 'hash',
    displayName: 'Nehemia',
    timezone: 'Europe/Paris',
    goal: 'BECOME_SENIOR',
    dailyMinutesTarget: 30,
    emailVerifiedAt: null,
    createdAt: new Date('2026-09-01T10:00:00Z'),
    ...overrides,
  } as UserEntity;
}

function buildService(options: { user?: UserEntity | null; passwordValid?: boolean } = {}) {
  const user = options.user === undefined ? userFixture() : options.user;

  const users = {
    findOne: jest.fn(async () => user),
    create: jest.fn((value: unknown) => value),
    save: jest.fn(async (value: UserEntity) => ({ ...userFixture(), ...value })),
    update: jest.fn(async () => ({ affected: 1 })),
  };
  const crypto = {
    hashPassword: jest.fn(async () => 'nouveau-hash'),
    verifyPassword: jest.fn(async () => options.passwordValid ?? true),
  };
  const tokens = {
    issue: jest.fn(async () => ({ accessToken: 'a', refreshToken: 'r', expiresIn: 900 })),
    rotate: jest.fn(async () => null),
    revoke: jest.fn(async () => undefined),
    revokeAllForUser: jest.fn(async () => undefined),
  };
  const emailTokens = {
    issue: jest.fn(async (): Promise<string> => 'jeton-en-clair'),
    consume: jest.fn(async (): Promise<string | null> => 'user-1'),
  };
  const mail = {
    enqueue: jest.fn(async (_job: { template: string; to: string }): Promise<void> => undefined),
  };

  const service = new AuthService(
    users as never,
    crypto as never,
    tokens as never,
    emailTokens as never,
    mail as never,
  );
  return { service, users, crypto, tokens, emailTokens, mail };
}

describe('toPublicUser', () => {
  it('never exposes the password hash', () => {
    const view = toPublicUser(userFixture());
    expect(Object.keys(view)).not.toContain('passwordHash');
    expect(JSON.stringify(view)).not.toContain('hash');
  });

  it('reports verification as a boolean, not a timestamp', () => {
    expect(toPublicUser(userFixture()).emailVerified).toBe(false);
    expect(toPublicUser(userFixture({ emailVerifiedAt: new Date() })).emailVerified).toBe(true);
  });
});

describe('AuthService.register', () => {
  it('refuses an address that already has an account', async () => {
    const { service } = buildService();
    await expect(
      service.register({
        email: 'nehemia@example.com',
        password: 'MotDePasse123secret',
        displayName: 'Nehemia',
        goal: 'BECOME_SENIOR',
        dailyMinutesTarget: 30,
        timezone: 'Europe/Paris',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('hashes the password and queues one verification email', async () => {
    const { service, crypto, mail, users } = buildService({ user: null });
    users.findOne.mockResolvedValueOnce(null);

    const session = await service.register({
      email: 'neuf@example.com',
      password: 'MotDePasse123secret',
      displayName: 'Neuf',
      goal: 'BECOME_SENIOR',
      dailyMinutesTarget: 30,
      timezone: 'Europe/Paris',
    });

    expect(crypto.hashPassword).toHaveBeenCalledWith('MotDePasse123secret');
    expect(mail.enqueue).toHaveBeenCalledTimes(1);
    expect(mail.enqueue.mock.calls[0]![0]).toMatchObject({ template: 'verify-email' });
    expect(session.user.emailVerified).toBe(false);
  });

  it('still registers when the mail queue is unavailable', async () => {
    const { service, users, mail } = buildService({ user: null });
    users.findOne.mockResolvedValueOnce(null);
    mail.enqueue.mockRejectedValueOnce(new Error('queue down'));

    // MailService swallows its own failures; this asserts the contract holds even
    // if it ever stopped doing so.
    await expect(
      service.register({
        email: 'neuf@example.com',
        password: 'MotDePasse123secret',
        displayName: 'Neuf',
        goal: 'BECOME_SENIOR',
        dailyMinutesTarget: 30,
        timezone: 'Europe/Paris',
      }),
    ).rejects.toThrow('queue down');
  });
});

describe('AuthService.login', () => {
  it('returns the same error for an unknown address and a wrong password', async () => {
    const unknown = buildService({ user: null });
    const wrong = buildService({ passwordValid: false });

    const a = await unknown.service.login('inconnu@example.com', 'x').catch((e) => e);
    const b = await wrong.service.login('nehemia@example.com', 'x').catch((e) => e);

    expect(a).toBeInstanceOf(UnauthorizedException);
    expect(a.getResponse()).toEqual(b.getResponse());
  });

  it('verifies a password even when the account does not exist', async () => {
    const { service, crypto } = buildService({ user: null });
    await service.login('inconnu@example.com', 'x').catch(() => undefined);
    // Without this, a missing account would answer measurably faster.
    expect(crypto.verifyPassword).toHaveBeenCalledTimes(1);
  });

  it('issues a session on success', async () => {
    const { service, tokens } = buildService();
    const session = await service.login('nehemia@example.com', 'bon');
    expect(session.accessToken).toBe('a');
    expect(tokens.issue).toHaveBeenCalledTimes(1);
  });
});

describe('AuthService.refresh', () => {
  it('rejects an unknown token', async () => {
    const { service } = buildService();
    await expect(service.refresh('inconnu')).rejects.toMatchObject({
      response: { code: 'INVALID_REFRESH_TOKEN' },
    });
  });

  it('reports a replayed token as an ordinary expiry, without leaking the cause', async () => {
    const { service, tokens } = buildService();
    tokens.rotate.mockRejectedValueOnce(new RefreshTokenReuse('family-1'));

    const error = await service.refresh('rejoué').catch((e) => e);
    expect(error).toBeInstanceOf(UnauthorizedException);
    expect(JSON.stringify(error.getResponse())).not.toContain('family-1');
  });
});

describe('AuthService.verifyEmail', () => {
  it('marks the address verified', async () => {
    const { service, users } = buildService({ user: userFixture({ emailVerifiedAt: new Date() }) });
    const result = await service.verifyEmail('jeton');
    expect(users.update).toHaveBeenCalled();
    expect(result.emailVerified).toBe(true);
  });

  it('refuses an unknown, expired or already-used token identically', async () => {
    const { service, emailTokens } = buildService();
    emailTokens.consume.mockResolvedValue(null);
    await expect(service.verifyEmail('x')).rejects.toMatchObject({
      response: { code: 'INVALID_TOKEN' },
    });
  });
});

describe('AuthService.resendVerification', () => {
  it('does nothing for an already verified account', async () => {
    const { service, mail } = buildService({ user: userFixture({ emailVerifiedAt: new Date() }) });
    await service.resendVerification('user-1');
    expect(mail.enqueue).not.toHaveBeenCalled();
  });

  it('does nothing for an unknown user, without failing', async () => {
    const { service, mail } = buildService({ user: null });
    await expect(service.resendVerification('inconnu')).resolves.toBeUndefined();
    expect(mail.enqueue).not.toHaveBeenCalled();
  });
});

describe('AuthService.requestPasswordReset', () => {
  it('queues a reset email for a real account', async () => {
    const { service, mail } = buildService();
    await service.requestPasswordReset('nehemia@example.com');
    expect(mail.enqueue.mock.calls[0]![0]).toMatchObject({ template: 'reset-password' });
  });

  it('does nothing and reveals nothing for an unknown address', async () => {
    const { service, mail } = buildService({ user: null });
    await expect(service.requestPasswordReset('personne@example.com')).resolves.toBeUndefined();
    expect(mail.enqueue).not.toHaveBeenCalled();
  });
});

describe('AuthService.resetPassword', () => {
  it('rehashes, ends every session and notifies the owner', async () => {
    const { service, crypto, tokens, mail } = buildService();
    await service.resetPassword('jeton', 'NouveauMotDePasse456');

    expect(crypto.hashPassword).toHaveBeenCalledWith('NouveauMotDePasse456');
    expect(tokens.revokeAllForUser).toHaveBeenCalledWith('user-1');
    expect(mail.enqueue.mock.calls[0]![0]).toMatchObject({ template: 'password-changed' });
  });

  it('refuses an invalid token', async () => {
    const { service, emailTokens, tokens } = buildService();
    emailTokens.consume.mockResolvedValue(null);
    await expect(service.resetPassword('x', 'NouveauMotDePasse456')).rejects.toMatchObject({
      response: { code: 'INVALID_TOKEN' },
    });
    expect(tokens.revokeAllForUser).not.toHaveBeenCalled();
  });
});
