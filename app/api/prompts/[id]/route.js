import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// PATCH /api/prompts/[id] - Update a prompt
export async function PATCH(request, { params }) {
  try {
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = params.id;
    const body = await request.json().catch(() => ({}));
    const { title, prompt, category } = body;

    const updates = { updated_at: new Date().toISOString() };
    if (title) updates.title = title.trim();
    if (prompt) updates.prompt = prompt.trim();
    if (category) updates.category = category;

    const { data, error } = await supabaseAdmin
      .from('saved_prompts')
      .update(updates)
      .eq('id', promptId)
      .eq('user_id', authState.userId)
      .select()
      .maybeSingle();

    if (error || !data) {
      return NextResponse.json({ error: 'Failed to update prompt' }, { status: 404 });
    }

    return NextResponse.json({ prompt: data }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// DELETE /api/prompts/[id] - Delete a prompt
export async function DELETE(request, { params }) {
  try {
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const promptId = params.id;
    const { error } = await supabaseAdmin
      .from('saved_prompts')
      .delete()
      .eq('id', promptId)
      .eq('user_id', authState.userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Prompt deleted' }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
