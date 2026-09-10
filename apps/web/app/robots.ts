import type { MetadataRoute } from 'next';
import { PROTECTED_PREFIXES } from '../lib/session';

/**
 * The private surfaces are the same list the middleware protects, imported rather
 * than retyped: a route added there cannot be forgotten here (CDC §61).
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [...PROTECTED_PREFIXES, '/design', '/api/'],
    },
    sitemap: `${base()}/sitemap.xml`,
  };
}

function base(): string {
  return process.env['APP_URL'] ?? 'http://localhost:3000';
}
