import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/dashboard/',
        '/parent/dashboard/',
        '/student/dashboard/',
        '/super/',
        '/api/',
      ],
    },
    sitemap: 'https://tuckshopkonnect.com/sitemap.xml',
  };
}
