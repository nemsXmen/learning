import 'server-only';
import { parseEnv, webEnvSchema, type WebEnv } from '@app/validation';

/**
 * Server-only. No value here may ever be prefixed NEXT_PUBLIC_ — the browser
 * talks to Next.js, never to the API (docs/rules.md #21, #28).
 */
export const env: WebEnv = parseEnv(webEnvSchema, process.env);
