import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://ecomplus.ga';

  // In a real app, you would fetch products and categories from your API
  // const products = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/products`).then(res => res.json());

  const routes = [
    '',
    '/catalogue',
    '/suivi',
    '/login',
    '/register',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }));

  return [...routes];
}
