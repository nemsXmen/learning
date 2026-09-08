import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import { apiEnvSchema, parseEnv, type ApiEnv } from '@app/validation';

loadDotenv({ path: resolve(process.cwd(), '../../.env') });

/**
 * Parsed once at import time. A missing variable throws here, before Nest builds
 * anything, so the process never starts half-configured
 * (features/01-platform-foundation/CONTRACT.md).
 */
export const env: ApiEnv = parseEnv(apiEnvSchema, process.env);

export const CONTENT_DIR = resolve(process.cwd(), env.CONTENT_DIR);
