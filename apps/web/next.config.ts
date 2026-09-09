import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';
import type { NextConfig } from 'next';

// One .env at the repository root for both apps; Next only looks in its own
// directory, so load it explicitly rather than duplicating secrets.
loadDotenv({ path: resolve(process.cwd(), '../../.env') });

const config: NextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source, not a build step.
  transpilePackages: ['@app/ui', '@app/validation', '@app/types'],
  poweredByHeader: false,
};

export default config;
