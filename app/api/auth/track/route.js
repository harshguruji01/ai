import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const user = body.user;

    if (!user || !user.id || !user.email) {
      return NextResponse.json({ error: 'Invalid user payload' }, { status: 400 });
    }

    const provider =
      user.app_metadata?.provider ||
      (user.identities && user.identities[0]?.provider) ||
      body.provider ||
      'email';

    const providerAccountId =
      user.identities && user.identities[0]?.id ? String(user.identities[0]?.id) : null;

    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email.split('@')[0];

    const avatarUrl =
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      null;

    const now = new Date().toISOString();

    // 1. Upsert into public.users
    const { error: userError } = await supabaseAdmin.from('users').upsert(
      {
        id: user.id,
        email: user.email.toLowerCase(),
        name: fullName,
        full_name: fullName,
        avatar_url: avatarUrl,
        provider: provider,
        provider_account_id: providerAccountId,
        email_verified: Boolean(user.email_confirmed_at),
        last_login_at: now,
        updated_at: now,
        is_active: true,
      },
      { onConflict: 'id' }
    );

    if (userError) {
      console.warn('Warning: Could not upsert public.users:', userError.message);
    }

    // 2. Upsert into public.profiles (check existing is_admin first)
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin, role')
      .eq('id', user.id)
      .maybeSingle();

    const isAdmin = Boolean(existingProfile?.is_admin);
    const role = existingProfile?.role || (isAdmin ? 'admin' : 'student');

    const { error: profileError } = await supabaseAdmin.from('profiles').upsert(
      {
        id: user.id,
        email: user.email.toLowerCase(),
        display_name: fullName,
        avatar_url: avatarUrl,
        role: role,
        is_admin: isAdmin,
        updated_at: now,
      },
      { onConflict: 'id' }
    );

    if (profileError) {
      console.warn('Warning: Could not upsert public.profiles:', profileError.message);
    }

    return NextResponse.json({
      success: true,
      tracked: {
        id: user.id,
        email: user.email,
        provider,
        isAdmin,
        role,
      },
    });
  } catch (err) {
    console.error('Error tracking auth user:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
