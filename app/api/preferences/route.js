import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

// GET: Fetch user preferences
export async function GET(request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ preferences: null, isGuest: true }, { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      preferences: data || {
        theme: 'dark',
        font_size: 'medium',
        font_family: 'sans',
        ai_language: 'english',
      },
      isGuest: false,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST: Save/Update user preferences
export async function POST(request) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Only logged-in users can sync preferences to the cloud.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { theme, font_size, font_family, ai_language } = body;

    const { data, error } = await supabaseAdmin
      .from('user_preferences')
      .upsert({
        user_id: user.id,
        theme: theme || 'dark',
        font_size: font_size || 'medium',
        font_family: font_family || 'sans',
        ai_language: ai_language || 'english',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, preferences: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
