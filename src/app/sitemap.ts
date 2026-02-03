import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tuckshopkonnect.com'; // Replace with actual domain

  const routes = [
    '',
    '/schools',
    '/portal',
    '/privacy-policy',
    '/terms-of-service',
    '/vote-of-thanks',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'weekly' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return routes;
}
