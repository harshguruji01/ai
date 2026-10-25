import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/prompts - List saved prompts for authenticated user
export async function GET(request) {
  try {
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ prompts: [] }, { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from('saved_prompts')
      .select('*')
      .eq('user_id', authState.userId)
      .order('updated_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ prompts: data || [] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/prompts - Create or save a prompt
export async function POST(request) {
  try {
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { title, prompt, category } = body;

    if (!title || !prompt) {
      return NextResponse.json({ error: 'Title and prompt content are required' }, { status: 400 });
    }

    const validCategories = ['Coding', 'Writing', 'Learning', 'Business', 'Custom'];
    const safeCategory = validCategories.includes(category) ? category : 'Custom';

    const { data, error } = await supabaseAdmin
      .from('saved_prompts')
      .insert({
        user_id: authState.userId,
        title: title.trim(),
        prompt: prompt.trim(),
        category: safeCategory,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ prompt: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
