import { z } from 'zod';

/**
 * Environment is parsed at boot. A missing or malformed variable exits non-zero
 * naming the variable — the process never starts half-configured
 * (features/01-platform-foundation/CONTRACT.md).
 */

const duration = z
  .string()
  .regex(/^\d+(ms|s|m|h|d)$/, 'Attendu une durée comme 15m, 24h, 30d');

const bool = z
  .union([z.boolean(), z.enum(['true', 'false', '1', '0', ''])])
  .transform((v) => v === true || v === 'true' || v === '1');

export const apiEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),

  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32, 'Au moins 32 caractères'),
  JWT_REFRESH_SECRET: z.string().min(32, 'Au moins 32 caractères'),
  JWT_ACCESS_TTL: duration.default('15m'),
  JWT_REFRESH_TTL: duration.default('30d'),

  // Authoring and bundling only. The API reads the generated module at runtime,
  // so a deployment does not have to know where the repository lives.
  CONTENT_DIR: z.string().min(1).default('../../content'),
  WEB_ORIGIN: z.string().url(),
  APP_URL: z.string().url(),

  SMTP_HOST: z.string().min(1),
  SMTP_PORT: z.coerce.number().int().positive(),
  SMTP_SECURE: bool.default(false),
  SMTP_USER: z.string().default(''),
  SMTP_PASSWORD: z.string().default(''),
  MAIL_FROM: z.string().min(3),
  EMAIL_VERIFICATION_TTL: duration.default('24h'),
  PASSWORD_RESET_TTL: duration.default('60m'),
});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

export const webEnvSchema = z.object({
  API_BASE_URL: z.string().url(),
  SESSION_COOKIE_SECURE: bool.default(false),
});

export type WebEnv = z.infer<typeof webEnvSchema>;

/**
 * Parses `source` or throws an error listing every offending variable by name.
 * Callers exit the process — a partially configured service is worse than a
 * refused start.
 */
export function parseEnv<T extends z.ZodTypeAny>(schema: T, source: unknown): z.infer<T> {
  const result = schema.safeParse(source);
  if (result.success) return result.data;

  const lines = result.error.issues.map((issue) => {
    const name = issue.path.join('.') || '(racine)';
    return `  ${name}: ${issue.message}`;
  });
  throw new Error(`Configuration invalide :\n${lines.join('\n')}`);
}
