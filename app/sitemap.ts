import type { MetadataRoute } from 'next';
import { getContent } from '../lib/content';

const baseUrl = 'https://austinlesterstudio.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { projects } = await getContent();

  return [
    { url: `${baseUrl}/` },
    { url: `${baseUrl}/work` },
    { url: `${baseUrl}/about` },
    { url: `${baseUrl}/contact` },
    ...projects.map((project) => ({
      url: `${baseUrl}/work/${project.slug}`,
    })),
  ];
}
