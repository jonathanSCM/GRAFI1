import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Panel, admin y login no aportan a búsqueda; los perfiles públicos (/[slug]) sí se permiten.
        disallow: ['/panel', '/admin', '/login'],
      },
    ],
    sitemap: 'https://grafi.digital/sitemap.xml',
  };
}
