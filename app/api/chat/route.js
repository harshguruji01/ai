import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { extractClientIp, generateGuestKeyHash } from '@/lib/security';
import { chatRequestSchema } from '@/lib/validation';
import { checkAndReserveAllowance, refundUsageAllowance } from '@/lib/rate-limit';
import { streamNvidiaTextChat, isImageIntent } from '@/lib/ai/nvidia';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let reserved = false;
  let userId = null;
  let guestKeyHash = null;

  try {
    // 1. Parse & Validate Input Body
    const jsonBody = await request.json();
    const parseResult = chatRequestSchema.safeParse(jsonBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { prompt, conversationId, messages, fingerprint, isImageMode, language } = parseResult.data;

    // 2. Identify Authenticated Session
    const authState = await getAuthenticatedUser();
    const isLoggedIn = authState.isLoggedIn;
    userId = authState.userId;

    // 3. Client Signals & Guest Privacy Hash
    const clientIp = extractClientIp(request);
    const userAgent = request.headers.get('user-agent') || '';
    guestKeyHash = isLoggedIn ? null : generateGuestKeyHash(clientIp, fingerprint, userAgent);

    // 4. Guest Image Restriction Gating
    const wantsImage = isImageMode || isImageIntent(prompt);
    if (wantsImage && !isLoggedIn) {
      return NextResponse.json(
        {
          error: 'Authentication Required',
          requiresLogin: true,
          message:
            'AI Image Generation is available to signed-in users. Log in at https://webguruji.online to unlock image creation.',
        },
        { status: 403 }
      );
    }

    // 5. Concurrency-Safe Atomic Rate Limit Reservation
    let reservation = { allowed: true, currentCount: 1, remainingAllowance: 2, maxRequests: 2, resetInSeconds: 0 };
    try {
      reservation = await checkAndReserveAllowance({
        userId,
        guestKeyHash,
        isGuest: !isLoggedIn,
      });
      reserved = reservation.allowed;
    } catch (dbError) {
      console.warn('Rate limit reservation fallback:', dbError?.message || dbError);
      reservation = { allowed: true, currentCount: 1, remainingAllowance: 1, maxRequests: 10, resetInSeconds: 0 };
      reserved = false;
    }

    if (!reservation.allowed) {
      const resetHours = Math.floor(reservation.resetInSeconds / 3600);
      const resetMins = Math.ceil((reservation.resetInSeconds % 3600) / 60);

      return NextResponse.json(
        {
          error: 'Rate Limit Exhausted',
          isLoggedIn,
          currentCount: reservation.currentCount,
          maxRequests: reservation.maxRequests,
          remainingAllowance: 0,
          resetInSeconds: reservation.resetInSeconds,
          windowExpiresAt: reservation.windowExpiresAt,
          message: isLoggedIn
            ? `You have reached your limit of 10 requests. Your allowance resets in ${resetHours}h ${resetMins}m.`
            : `Guest limit of 2 requests reached. Please log in at webguruji.online for 10 requests and image generation, or wait ${resetHours}h ${resetMins}m.`,
        },
        { status: 429 }
      );
    }

    // 6. Ensure Conversation exists for Logged-In User
    let activeConversationId = conversationId;
    if (isLoggedIn && userId) {
      if (!activeConversationId) {
        // Derive clean title from first 40 characters of user prompt
        const titleSnippet = prompt.replace(/\s+/g, ' ').slice(0, 40);
        const { data: convData, error: convError } = await supabaseAdmin
          .from('conversations')
          .insert({
            user_id: userId,
            title: titleSnippet || 'New Chat',
          })
          .select()
          .single();

        if (!convError && convData) {
          activeConversationId = convData.id;
        }
      }

      // Persist User Message
      if (activeConversationId) {
        await supabaseAdmin.from('chat_messages').insert({
          conversation_id: activeConversationId,
          user_id: userId,
          role: 'user',
          content: prompt,
          message_type: 'text',
          status: 'completed',
        });
      }
    }

    // 7. Request Streaming AI Response from NVIDIA NIM
    const formattedMessages = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    if (
      formattedMessages.length === 0 ||
      formattedMessages[formattedMessages.length - 1].content !== prompt
    ) {
      formattedMessages.push({ role: 'user', content: prompt });
    }

    let nvidiaStream;
    try {
      nvidiaStream = await streamNvidiaTextChat({
        messages: formattedMessages,
        language,
      });
    } catch (aiErr) {
      // Refund reserved allowance on upstream provider failure
      await refundUsageAllowance({ userId, guestKeyHash });
      reserved = false;
      console.error('NVIDIA Text Chat Error:', aiErr);
      return NextResponse.json(
        { error: aiErr.message || 'Upstream AI provider error' },
        { status: 502 }
      );
    }

    // 8. Stream Response to Client while Buffering for Database Persistence
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let accumulatedContent = '';
    let accumulatedReasoning = '';

    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        const text = decoder.decode(chunk, { stream: true });
        const lines = text.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const parsed = JSON.parse(trimmed.slice(6));
              const delta = parsed.choices?.[0]?.delta || {};
              const reasoning = delta.reasoning_content || '';
              const token = delta.content || '';

              if (reasoning) {
                accumulatedReasoning += reasoning;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      reasoning,
                      conversationId: activeConversationId,
                    })}\n\n`
                  )
                );
              }

              if (token) {
                accumulatedContent += token;
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      token,
                      conversationId: activeConversationId,
                    })}\n\n`
                  )
                );
              }
            } catch (e) {
              // Ignore non-json chunk lines
            }
          }
        }
      },
      async flush(controller) {
        // Send final metadata event with usage and complete content
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({
              done: true,
              conversationId: activeConversationId,
              remainingAllowance: reservation.remainingAllowance,
              maxRequests: reservation.maxRequests,
            })}\n\n`
          )
        );

        // Persist final assistant response with thinking block for logged-in user
        const finalContent = accumulatedReasoning.trim()
          ? `<think>\n${accumulatedReasoning.trim()}\n</think>\n\n${accumulatedContent}`
          : accumulatedContent;

        if (isLoggedIn && userId && activeConversationId && finalContent.trim()) {
          try {
            await supabaseAdmin.from('chat_messages').insert({
              conversation_id: activeConversationId,
              user_id: userId,
              role: 'assistant',
              content: finalContent,
              message_type: 'text',
              status: 'completed',
              model: process.env.NVIDIA_TEXT_MODEL || 'nvidia/nemotron-3-ultra-550b-a55b',
            });

            // Update conversation updated_at
            await supabaseAdmin
              .from('conversations')
              .update({ updated_at: new Date().toISOString() })
              .eq('id', activeConversationId);
          } catch (dbSaveErr) {
            console.error('Failed to save completed assistant message:', dbSaveErr);
          }
        }
      },
    });

    return new Response(nvidiaStream.pipeThrough(transformStream), {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    console.error('API /api/chat Unhandled Exception:', error);
    if (reserved) {
      await refundUsageAllowance({ userId, guestKeyHash });
    }
    return NextResponse.json(
      { error: error.message || 'An unexpected server error occurred.' },
      { status: 500 }
    );
  }
}
