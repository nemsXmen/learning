import { describe, expect, it } from 'vitest';
import { apiEnvSchema, parseEnv, webEnvSchema } from './env';

const validApiEnv = {
  DATABASE_URL: 'postgres://learn:learn@localhost:5432/learning',
  REDIS_URL: 'redis://localhost:6379',
  JWT_ACCESS_SECRET: 'a'.repeat(32),
  JWT_REFRESH_SECRET: 'b'.repeat(32),
  WEB_ORIGIN: 'http://localhost:3000',
  APP_URL: 'http://localhost:3000',
  SMTP_HOST: 'localhost',
  SMTP_PORT: '1025',
  MAIL_FROM: 'Atelier <no-reply@example.com>',
};

describe('apiEnvSchema', () => {
  it('accepts a complete environment and applies defaults', () => {
    const env = parseEnv(apiEnvSchema, validApiEnv);
    expect(env.PORT).toBe(3001);
    expect(env.JWT_ACCESS_TTL).toBe('15m');
    expect(env.SMTP_SECURE).toBe(false);
    expect(env.NODE_ENV).toBe('development');
  });

  it.each(Object.keys(validApiEnv))('names %s when it is missing', (missing) => {
    const source = { ...validApiEnv } as Record<string, unknown>;
    delete source[missing];
    expect(() => parseEnv(apiEnvSchema, source)).toThrowError(new RegExp(missing));
  });

  it('defaults CONTENT_DIR: the runtime reads the bundled graph, not the tree', () => {
    expect(parseEnv(apiEnvSchema, validApiEnv).CONTENT_DIR).toBe('../../content');
    expect(parseEnv(apiEnvSchema, { ...validApiEnv, CONTENT_DIR: '/srv/content' }).CONTENT_DIR).toBe(
      '/srv/content',
    );
  });

  it('rejects a short JWT secret rather than silently accepting it', () => {
    expect(() => parseEnv(apiEnvSchema, { ...validApiEnv, JWT_ACCESS_SECRET: 'short' })).toThrowError(
      /JWT_ACCESS_SECRET/,
    );
  });

  it('rejects a malformed duration', () => {
    expect(() => parseEnv(apiEnvSchema, { ...validApiEnv, JWT_ACCESS_TTL: '15 minutes' })).toThrowError(
      /JWT_ACCESS_TTL/,
    );
  });

  it('coerces SMTP_SECURE from the string environment', () => {
    expect(parseEnv(apiEnvSchema, { ...validApiEnv, SMTP_SECURE: 'true' }).SMTP_SECURE).toBe(true);
    expect(parseEnv(apiEnvSchema, { ...validApiEnv, SMTP_SECURE: '0' }).SMTP_SECURE).toBe(false);
  });

  it('reports every offending variable in one message', () => {
    expect(() => parseEnv(apiEnvSchema, {})).toThrowError(/DATABASE_URL[\s\S]*REDIS_URL/);
  });
});

describe('webEnvSchema', () => {
  it('requires the API base URL', () => {
    expect(() => parseEnv(webEnvSchema, {})).toThrowError(/API_BASE_URL/);
    expect(parseEnv(webEnvSchema, { API_BASE_URL: 'http://localhost:3001' }).SESSION_COOKIE_SECURE).toBe(
      false,
    );
  });
});
