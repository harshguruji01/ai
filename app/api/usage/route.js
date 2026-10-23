import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { extractClientIp, generateGuestKeyHash } from '@/lib/security';
import { supabaseAdmin } from '@/lib/supabase/admin';
import {
  GUEST_MAX_REQUESTS,
  GUEST_WINDOW_SECONDS,
  USER_MAX_REQUESTS,
  USER_WINDOW_SECONDS,
} from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    const authState = await getAuthenticatedUser();
    const isLoggedIn = authState.isLoggedIn;
    const userId = authState.userId;

    let maxRequests = isLoggedIn ? USER_MAX_REQUESTS : GUEST_MAX_REQUESTS;
    const windowSeconds = isLoggedIn ? USER_WINDOW_SECONDS : GUEST_WINDOW_SECONDS;

    if (isLoggedIn && userId) {
      try {
        const { data: customRow } = await supabaseAdmin
          .from('user_ai_limits')
          .select('max_requests, context_limit')
          .eq('user_id', userId)
          .maybeSingle();
        if (customRow && typeof customRow.max_requests === 'number' && customRow.max_requests > 0) {
          maxRequests = customRow.max_requests;
        }
      } catch (e) {}
    }

    let query = supabaseAdmin.from('usage_limits').select('*');

    if (isLoggedIn) {
      query = query.eq('user_id', userId);
    } else {
      const url = new URL(request.url);
      const fingerprint = url.searchParams.get('fp') || '';
      const clientIp = extractClientIp(request);
      const userAgent = request.headers.get('user-agent') || '';
      const guestKeyHash = generateGuestKeyHash(clientIp, fingerprint, userAgent);
      query = query.eq('guest_key_hash', guestKeyHash);
    }

    const { data: record, error } = await query.maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.warn('Failed to query usage limits:', error);
    }

    const now = new Date();

    if (!record) {
      return NextResponse.json({
        isLoggedIn,
        currentCount: 0,
        maxRequests,
        remainingAllowance: maxRequests,
        resetInSeconds: 0,
        windowExpiresAt: null,
      });
    }

    const expiresAt = new Date(record.window_expires_at);

    if (now >= expiresAt) {
      // Window has already expired
      return NextResponse.json({
        isLoggedIn,
        currentCount: 0,
        maxRequests,
        remainingAllowance: maxRequests,
        resetInSeconds: 0,
        windowExpiresAt: null,
      });
    }

    const resetInSeconds = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    const remaining = Math.max(0, maxRequests - record.request_count);

    return NextResponse.json({
      isLoggedIn,
      currentCount: record.request_count,
      maxRequests,
      remainingAllowance: remaining,
      resetInSeconds,
      windowExpiresAt: record.window_expires_at,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || 'Failed to fetch usage status' },
      { status: 500 }
    );
  }
}
