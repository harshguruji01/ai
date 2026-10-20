import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { validateRequestOrigin } from '@/lib/security';
import { conversationUpdateSchema } from '@/lib/validation';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/conversations/[id] - Fetch messages in conversation
export async function GET(request, { params }) {
  try {
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;

    // Verify ownership
    const { data: conv, error: convError } = await supabaseAdmin
      .from('conversations')
      .select('id, title, user_id')
      .eq('id', conversationId)
      .eq('user_id', authState.userId)
      .maybeSingle();

    if (convError || !conv) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Fetch messages
    const { data: messages, error: msgError } = await supabaseAdmin
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', authState.userId)
      .order('created_at', { ascending: true });

    if (msgError) {
      return NextResponse.json({ error: msgError.message }, { status: 500 });
    }

    return NextResponse.json({
      conversation: conv,
      messages: messages || [],
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// PATCH /api/conversations/[id] - Rename conversation
export async function PATCH(request, { params }) {
  try {
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;
    const body = await request.json();
    const parseResult = conversationUpdateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: 'Invalid title' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('conversations')
      .update({
        title: parseResult.data.title,
        updated_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .eq('user_id', authState.userId)
      .select()
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update conversation' }, { status: 404 });
    }

    return NextResponse.json({ conversation: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/conversations/[id] - Delete conversation
export async function DELETE(request, { params }) {
  try {
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const conversationId = params.id;

    const { error } = await supabaseAdmin
      .from('conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', authState.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Conversation deleted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
