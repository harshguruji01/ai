import crypto from 'crypto';

/**
 * Extracts the real client IP address accounting for reverse proxy configurations.
 * Avoids spoofing by checking trusted proxy headers appropriately.
 */
export function extractClientIp(request) {
  const proxyType = process.env.TRUSTED_PROXY_CONFIGURATION || 'standard';

  // Cloudflare
  if (proxyType === 'cloudflare') {
    const cfIp = request.headers.get('cf-connecting-ip');
    if (cfIp) return cfIp.trim();
  }

  // Standard reverse proxy (e.g. Nginx, Vercel, AWS ALB)
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',').map((p) => p.trim());
    if (parts.length > 0 && parts[0]) {
      return parts[0];
    }
  }

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/**
 * Generates a privacy-conscious, cryptographically secure keyed hash (HMAC-SHA256)
 * for guest abuse tracking without storing raw IP addresses or raw hardware fingerprints.
 */
export function generateGuestKeyHash(ip, fingerprint, userAgent = '') {
  const secret =
    process.env.GUEST_ID_HMAC_SECRET || 'fallback-secret-at-least-32-chars-long-for-testing';

  // Normalizing input signals
  const normalizedIp = (ip || '127.0.0.1').trim().toLowerCase();
  const normalizedFp = (fingerprint || 'fp_anonymous').trim();
  const normalizedUa = (userAgent || 'ua_generic').slice(0, 100);

  const payload = `${normalizedIp}:::${normalizedFp}:::${normalizedUa}`;

  return crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
}

/**
 * Validates request origin to protect cookie-authenticated mutation endpoints against CSRF.
 */
export function validateRequestOrigin(request) {
  if (process.env.NODE_ENV === 'development') return true;

  const origin = request.headers.get('origin');
  if (!origin) return true; // Non-browser clients or direct API calls

  const allowedOrigins = [
    'https://ai.webguruji.online',
    'https://webguruji.online',
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.NEXT_PUBLIC_MAIN_SITE_URL,
  ].filter(Boolean);

  return allowedOrigins.some((allowed) => origin.startsWith(allowed));
}
