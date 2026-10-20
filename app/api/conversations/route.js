import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { validateRequestOrigin } from '@/lib/security';
import { conversationCreateSchema } from '@/lib/validation';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/conversations - List conversations for authenticated user
export async function GET(request) {
  try {
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ conversations: [] }, { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .select('id, title, created_at, updated_at')
      .eq('user_id', authState.userId)
      .order('updated_at', { ascending: false })
      .limit(50);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversations: data || [] }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/conversations - Create a new conversation
export async function POST(request) {
  try {
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const parseResult = conversationCreateSchema.safeParse(body);
    const title = parseResult.success ? parseResult.data.title : 'New Conversation';

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .insert({
        user_id: authState.userId,
        title,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ conversation: data }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
