import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Fetch profiles
    const { data: profiles, error: pErr } = await supabaseAdmin
      .from('profiles')
      .select('id, email, display_name, avatar_url, role, is_admin, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (pErr) throw pErr;

    // Fetch users info (for provider details)
    const { data: users, error: uErr } = await supabaseAdmin
      .from('users')
      .select('id, email, provider, last_login_at, created_at');

    const providerMap = new Map();
    if (users) {
      users.forEach((u) => {
        providerMap.set(u.id, {
          provider: u.provider || 'email',
          last_login_at: u.last_login_at,
        });
      });
    }

    const merged = (profiles || []).map((p) => {
      const uInfo = providerMap.get(p.id) || {};
      return {
        ...p,
        provider: uInfo.provider || 'email',
        last_login_at: uInfo.last_login_at || p.updated_at,
      };
    });

    return NextResponse.json({ success: true, users: merged });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { userId, email, isAdmin } = await request.json();

    if (!userId && !email) {
      return NextResponse.json({ error: 'userId or email is required' }, { status: 400 });
    }

    const query = supabaseAdmin.from('profiles').update({
      is_admin: Boolean(isAdmin),
      role: isAdmin ? 'admin' : 'student',
      updated_at: new Date().toISOString(),
    });

    if (userId) {
      query.eq('id', userId);
    } else {
      query.eq('email', email.toLowerCase());
    }

    const { data, error } = await query.select();
    if (error) throw error;

    // Also sync public.users
    const uQuery = supabaseAdmin.from('users').update({
      role: isAdmin ? 'ADMIN' : 'USER',
      updated_at: new Date().toISOString(),
    });
    if (userId) {
      uQuery.eq('id', userId);
    } else {
      uQuery.eq('email', email.toLowerCase());
    }
    await uQuery;

    return NextResponse.json({ success: true, updated: data });
  } catch (err) {
    console.error('Error updating admin status:', err);
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
