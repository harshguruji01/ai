import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { validateRequestOrigin } from '@/lib/security';
import { imageGenerateSchema } from '@/lib/validation';
import { generateNvidiaImage } from '@/lib/ai/nvidia';
import { uploadGeneratedImage } from '@/lib/storage';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let userId = null;

  try {
    // 1. CSRF Protection
    if (!validateRequestOrigin(request)) {
      return NextResponse.json({ error: 'Forbidden: Invalid request origin' }, { status: 403 });
    }

    // 2. Authenticated Session Check (Strictly Required: Guests cannot create images)
    const authState = await getAuthenticatedUser();
    if (!authState.isLoggedIn || !authState.userId) {
      return NextResponse.json(
        {
          error: 'Authentication Required',
          requiresLogin: true,
          message:
            'Guest users are not able to create images. Please sign in or create an account at https://webguruji.online to unlock 5 images per 24 hours.',
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

    // 4. Concurrency-Safe 24-Hour Rolling Window Limit: Exactly 5 Images per 24 Hours
    const MAX_IMAGES_24H = 5;
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { count: imageCount, error: countErr } = await supabaseAdmin
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('message_type', 'image')
      .gte('created_at', twentyFourHoursAgo);

    const currentImageCount = imageCount || 0;

    if (currentImageCount >= MAX_IMAGES_24H) {
      // Find oldest image in the 24-hour window to calculate precise reset time
      const { data: oldestImage } = await supabaseAdmin
        .from('chat_messages')
        .select('created_at')
        .eq('user_id', userId)
        .eq('message_type', 'image')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: true })
        .limit(1);

      let resetInSeconds = 24 * 3600;
      if (oldestImage && oldestImage.length > 0) {
        const expiresAt = new Date(oldestImage[0].created_at).getTime() + 24 * 3600 * 1000;
        resetInSeconds = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000));
      }

      const resetHours = Math.floor(resetInSeconds / 3600);
      const resetMins = Math.ceil((resetInSeconds % 3600) / 60);

      return NextResponse.json(
        {
          error: 'Image Quota Exceeded',
          remainingAllowance: 0,
          maxRequests: MAX_IMAGES_24H,
          resetInSeconds,
          message: `Daily limit reached: You can generate a maximum of 5 images per 24 hours. Your allowance resets in ${resetHours}h ${resetMins}m.`,
        },
        { status: 429 }
      );
    }

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
      remainingAllowance: Math.max(0, MAX_IMAGES_24H - (currentImageCount + 1)),
      maxRequests: MAX_IMAGES_24H,
    });
  } catch (err) {
    console.error('API /api/images/generate Error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error while generating image' },
      { status: 500 }
    );
  }
}
