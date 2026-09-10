import type { MetadataRoute } from 'next';

/** Public routes only. Nothing behind a session is ever listed. */
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env['APP_URL'] ?? 'http://localhost:3000';

  return [
    { url: base, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/login`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${base}/register`, changeFrequency: 'yearly', priority: 0.5 },
  ];
}
