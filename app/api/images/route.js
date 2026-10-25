import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// GET /api/images - List generated images for the authenticated user
export async function GET(request) {
  try {
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    const { data, error } = await supabaseAdmin
      .from('chat_messages')
      .select('id, conversation_id, content, image_url, storage_path, model, created_at')
      .eq('user_id', authState.userId)
      .eq('message_type', 'image')
      .order('created_at', { ascending: false })
      .limit(60);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Format list of images
    const images = (data || []).map((msg) => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      prompt: msg.content.replace(/^Generated image for:\s*"?/, '').replace(/"?$/, ''),
      imageUrl: msg.image_url,
      storagePath: msg.storage_path,
      model: msg.model || 'stabilityai/stable-diffusion-xl',
      createdAt: msg.created_at,
    }));

    return NextResponse.json({ images }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Failed to list images' }, { status: 500 });
  }
}
