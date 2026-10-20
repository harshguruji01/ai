import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { validateRequestOrigin } from '@/lib/security';
import { imageGenerateSchema } from '@/lib/validation';
import { checkAndReserveAllowance, refundUsageAllowance } from '@/lib/rate-limit';
import { generateNvidiaImage } from '@/lib/ai/nvidia';
import { uploadGeneratedImage } from '@/lib/storage';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let reserved = false;
  let userId = null;

  try {
    // 1. CSRF Protection
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden: Invalid request origin' }, { status: 403 });
    }

    // 2. Authenticated Session Check (Strictly Required for Images)
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json(
        {
          error: 'Authentication Required',
          requiresLogin: true,
          message:
            'AI Image Generation is available to signed-in users. Log in at https://webguruji.online to unlock image creation.',
        },
        { status: 401 }
      );
    }

    userId = authState.userId;

    // 3. Validate Request Body
    const body = await request.json();
    const parseResult = imageGenerateSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: 'Invalid image request parameters', details: parseResult.error.format() },
        { status: 400 }
      );
    }

    const { prompt, conversationId } = parseResult.data;

    // 4. Concurrency-Safe Rate Limiting
    const reservation = await checkAndReserveAllowance({
      userId,
      isGuest: false,
    });

    if (!reservation.allowed) {
      const resetHours = Math.floor(reservation.resetInSeconds / 3600);
      const resetMins = Math.ceil((reservation.resetInSeconds % 3600) / 60);

      return NextResponse.json(
        {
          error: 'Rate Limit Exhausted',
          remainingAllowance: 0,
          resetInSeconds: reservation.resetInSeconds,
          message: `You have reached your limit of 10 requests. Your allowance resets in ${resetHours}h ${resetMins}m.`,
        },
        { status: 429 }
      );
    }

    reserved = true;

    // 5. Ensure Active Conversation exists
    let activeConversationId = conversationId;
    if (!activeConversationId) {
      const titleSnippet = `Image: ${prompt.slice(0, 30)}`;
      const { data: convData } = await supabaseAdmin
        .from('conversations')
        .insert({ user_id: userId, title: titleSnippet })
        .select()
        .single();
      if (convData) activeConversationId = convData.id;
    }

    // Record User Image Prompt in Chat Messages
    if (activeConversationId) {
      await supabaseAdmin.from('chat_messages').insert({
        conversation_id: activeConversationId,
        user_id: userId,
        role: 'user',
        content: `🎨 Generate image: ${prompt}`,
        message_type: 'text',
        status: 'completed',
      });
    }

    // 6. Generate Image via NVIDIA NIM
    let imageBuffer;
    try {
      imageBuffer = await generateNvidiaImage({ prompt });
    } catch (imgError) {
      console.error('NVIDIA Image Generation Failure:', imgError);
      await refundUsageAllowance({ userId });
      reserved = false;
      return NextResponse.json(
        { error: imgError.message || 'Image generation provider failed.' },
        { status: 502 }
      );
    }

    // 7. Store Image in Private Supabase Storage Bucket
    let storagePath = null;
    let signedUrl = null;

    try {
      const uploadResult = await uploadGeneratedImage({
        userId,
        imageBuffer,
        contentType: 'image/png',
      });
      storagePath = uploadResult.storagePath;
      signedUrl = uploadResult.signedUrl;
    } catch (storageError) {
      console.error('Failed to upload image to Supabase Storage:', storageError);
      // Fallback: Return data URL directly if storage is temporarily unconfigured
      const base64Data = imageBuffer.toString('base64');
      signedUrl = `data:image/png;base64,${base64Data}`;
    }

    // 8. Persist Assistant Image Message
    if (activeConversationId) {
      await supabaseAdmin.from('chat_messages').insert({
        conversation_id: activeConversationId,
        user_id: userId,
        role: 'assistant',
        content: `Generated image for: "${prompt}"`,
        message_type: 'image',
        status: 'completed',
        image_url: signedUrl,
        storage_path: storagePath,
        model: process.env.NVIDIA_IMAGE_MODEL || 'stabilityai/stable-diffusion-xl',
      });

      await supabaseAdmin
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', activeConversationId);
    }

    return NextResponse.json({
      success: true,
      imageUrl: signedUrl,
      prompt,
      conversationId: activeConversationId,
      remainingAllowance: reservation.remainingAllowance,
      maxRequests: reservation.maxRequests,
    });
  } catch (err) {
    console.error('API /api/images/generate Error:', err);
    if (reserved) {
      await refundUsageAllowance({ userId });
    }
    return NextResponse.json(
      { error: err.message || 'Internal server error while generating image' },
      { status: 500 }
    );
  }
}
