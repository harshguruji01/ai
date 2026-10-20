import { createBrowserClient } from '@supabase/ssr';

/**
 * Returns cookie domain config for cross-subdomain sharing (*.webguruji.online).
 * If testing locally on localhost, returns undefined so browser stores standard cookies.
 */
export function getCookieDomain() {
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (hostname.endsWith('webguruji.online')) {
      return '.webguruji.online';
    }
  }
  return undefined;
}

export function createClient() {
  const domain = getCookieDomain();
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookieOptions: domain
        ? {
            domain,
            path: '/',
            sameSite: 'lax',
            secure: true,
          }
        : undefined,
    }
  );
}
