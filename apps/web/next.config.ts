import type { NextConfig } from 'next';

const config: NextConfig = {
  reactStrictMode: true,
  // Workspace packages ship TypeScript source, not a build step.
  transpilePackages: ['@app/ui', '@app/validation', '@app/types'],
  poweredByHeader: false,
};

export default config;
