import { supabaseAdmin } from '@/lib/supabase/admin';

export const GUEST_MAX_REQUESTS = 2;
export const GUEST_WINDOW_SECONDS = 6 * 60 * 60; // 6 hours (21,600s)

export const USER_MAX_REQUESTS = 10;
export const USER_WINDOW_SECONDS = 12 * 60 * 60; // 12 hours (43,200s)

/**
 * Concurrency-safe atomic rate limiting backed by PostgreSQL function
 * reserve_usage_allowance(p_user_id, p_guest_key_hash, p_max_requests, p_window_duration_seconds)
 */
export async function checkAndReserveAllowance({ userId = null, guestKeyHash = null, isGuest = true }) {
  const maxRequests = isGuest ? GUEST_MAX_REQUESTS : USER_MAX_REQUESTS;
  const windowSeconds = isGuest ? GUEST_WINDOW_SECONDS : USER_WINDOW_SECONDS;

  const { data, error } = await supabaseAdmin.rpc('reserve_usage_allowance', {
    p_user_id: userId,
    p_guest_key_hash: guestKeyHash,
    p_max_requests: maxRequests,
    p_window_duration_seconds: windowSeconds,
  });

  if (error) {
    console.error('Rate limit RPC error:', error);
    // If the SQL migration has not been applied yet, throw descriptive error
    throw new Error(`Rate limit system error: ${error.message}`);
  }

  const result = Array.isArray(data) ? data[0] : data;

  return {
    allowed: !!result?.allowed,
    currentCount: result?.current_count || 1,
    remainingAllowance: result?.remaining_allowance ?? 0,
    windowExpiresAt: result?.window_expires_at,
    resetInSeconds: result?.reset_in_seconds || 0,
    maxRequests,
  };
}

/**
 * Refunds 1 reserved operation if the upstream AI provider fails to deliver
 */
export async function refundUsageAllowance({ userId = null, guestKeyHash = null }) {
  try {
    await supabaseAdmin.rpc('refund_usage_allowance', {
      p_user_id: userId,
      p_guest_key_hash: guestKeyHash,
    });
  } catch (err) {
    console.error('Failed to refund usage allowance:', err);
  }
}
