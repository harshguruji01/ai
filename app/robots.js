export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai.webguruji.online';

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/login'],
        disallow: ['/admin*', '/api/', '/auth/'],
      },
    ],
    sitemap: [
      `${baseUrl}/sitemap.xml`,
      'https://www.webguruji.online/sitemap_index.xml',
    ],
  };
}
