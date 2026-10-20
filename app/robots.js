export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ai.webguruji.online';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/auth/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
