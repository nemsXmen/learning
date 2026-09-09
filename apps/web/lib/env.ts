import 'server-only';
import { parseEnv, webEnvSchema, type WebEnv } from '@app/validation';

/**
 * Server-only, and parsed on first use rather than at import: a route handler
 * that never runs during `next build` must not require configuration to build.
 * No value here may be prefixed NEXT_PUBLIC_ (docs/rules.md #21, #28).
 */
let cached: WebEnv | null = null;

export function getEnv(): WebEnv {
  cached ??= parseEnv(webEnvSchema, process.env);
  return cached;
}
