import { createClient as createServerClient } from '@/lib/supabase/server';

/**
 * Validates and retrieves the currently authenticated user from server-side cookies.
 * Never trusts client-supplied headers or user IDs.
 */
export async function getAuthenticatedUser() {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return {
        user: null,
        isLoggedIn: false,
        userId: null,
      };
    }

    return {
      user,
      isLoggedIn: true,
      userId: user.id,
    };
  } catch (err) {
    console.error('Server auth retrieval error:', err);
    return {
      user: null,
      isLoggedIn: false,
      userId: null,
    };
  }
}
