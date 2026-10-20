import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data?.user) {
      try {
        const user = data.user;
        const provider =
          user.app_metadata?.provider ||
          (user.identities && user.identities[0]?.provider) ||
          'google';
        const fullName =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email.split('@')[0];
        const avatarUrl =
          user.user_metadata?.avatar_url ||
          user.user_metadata?.picture ||
          null;
        const now = new Date().toISOString();

        await supabaseAdmin.from('users').upsert(
          {
            id: user.id,
            email: user.email.toLowerCase(),
            name: fullName,
            full_name: fullName,
            avatar_url: avatarUrl,
            provider,
            email_verified: Boolean(user.email_confirmed_at),
            last_login_at: now,
            updated_at: now,
            is_active: true,
          },
          { onConflict: 'id' }
        );

        await supabaseAdmin.from('profiles').upsert(
          {
            id: user.id,
            email: user.email.toLowerCase(),
            display_name: fullName,
            avatar_url: avatarUrl,
            updated_at: now,
          },
          { onConflict: 'id' }
        );
      } catch (trackErr) {
        console.warn('OAuth callback user track error:', trackErr);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Return user to an error page or main page
  return NextResponse.redirect(`${origin}/?auth_error=true`);
}

