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

    const { prompt, conversationId, messages, fingerprint, isImageMode, language, model, imageBase64 } = parseResult.data;

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

    // 4b. Access Gating for Tiered AI Models (Tier 1 to Tier 5)
    const MODEL_TIERS = {
      'guru-flash-1.1': 1,
      'guru-flash-1.2': 2,
      'guru-flash-1.3': 3,
      'guru-argon-1.4': 4,
      'guru-argon-1.5': 5,
    };
    const targetModelTier = MODEL_TIERS[model] || 1;

    // Guru-Flash 1.2: Logged-in members only (Free)
    if (targetModelTier === 2 && !isLoggedIn) {
      return NextResponse.json(
        {
          error: 'Authentication Required',
          requiresLogin: true,
          message: 'Guru-Flash 1.2 is exclusively available for logged-in members. Please sign in to use this model.',
        },
        { status: 403 }
      );
    }

    // Guru-Flash 1.3 (Tier 3), Guru-Argon 1.4 (Tier 4), Guru-Argon 1.5 (Tier 5): Paid Premium Models
    if (targetModelTier >= 3) {
      let userUnlockedTier = 1;

      // 1. Check logged-in user metadata from Supabase Auth
      if (isLoggedIn && authState.user) {
        const userMeta = authState.user.user_metadata || {};
        const metaPlan = (userMeta.plan || '').toLowerCase();
        if (userMeta.is_paid === true || (metaPlan && metaPlan !== 'free' && metaPlan !== 'standard')) {
          if (metaPlan.includes('1.5') || metaPlan.includes('grandmaster')) userUnlockedTier = 5;
          else if (metaPlan.includes('1.4') || metaPlan.includes('power') || metaPlan.includes('scholar')) userUnlockedTier = 4;
          else userUnlockedTier = 3;
        }
      }

      // 2. Query user_ai_limits by user_id OR email (from auth or verified header)
      const userEmail = (authState.user?.email || request.headers.get('x-user-email') || '').toLowerCase().trim();

      if (userUnlockedTier < targetModelTier) {
        try {
          let query = supabaseAdmin.from('user_ai_limits').select('*');
          if (userId && userEmail) {
            query = query.or(`user_id.eq.${userId},email.ilike.${userEmail}`);
          } else if (userId) {
            query = query.eq('user_id', userId);
          } else if (userEmail) {
            query = query.ilike('email', userEmail);
          } else {
            query = null;
          }

          if (query) {
            const { data: limitRows } = await query.order('updated_at', { ascending: false }).limit(5);
            if (limitRows && limitRows.length > 0) {
              for (const row of limitRows) {
                if (!row.is_active) continue;
                // Exclude system config rows
                if (row.email && (row.email.startsWith('admin_') || row.email.includes('config') || row.email.includes('roster'))) continue;

                const p = (row.plan_name || '').toLowerCase();
                let rowTier = 1;
                if (p.includes('1.5') || p.includes('grandmaster') || p.includes('argon 1.5') || p.includes('argon-1.5')) {
                  rowTier = 5;
                } else if (p.includes('1.4') || p.includes('power') || p.includes('scholar') || p.includes('argon 1.4') || p.includes('argon-1.4')) {
                  rowTier = 4;
                } else if (p.includes('1.3') || p.includes('starter') || p.includes('flash 1.3') || p.includes('flash-1.3')) {
                  rowTier = 3;
                }

                if (rowTier > userUnlockedTier) {
                  userUnlockedTier = rowTier;
                }
              }
            }
          }
        } catch (dbErr) {
          console.error('Server-side user_ai_limits verification notice:', dbErr);
        }
      }

      if (userUnlockedTier < targetModelTier) {
        const modelDisplayNames = {
          'guru-flash-1.3': 'Guru-Flash 1.3 ($5 Starter Premium)',
          'guru-argon-1.4': 'Guru-Argon 1.4 ($15 Pro Premium)',
          'guru-argon-1.5': 'Guru-Argon 1.5 ($25 Power User Mistral 1T)',
        };
        const displayName = modelDisplayNames[model] || model;

        return NextResponse.json(
          {
            error: 'Payment Required',
            requiresPayment: true,
            model,
            message: `${displayName} payment ke baad hi unlock hota hai. Kripya apna plan upgrade karke payment complete karein.`,
            upgradeUrl: `https://webguruji.online/payment.html?plan=${encodeURIComponent(model)}`,
          },
          { status: 402 }
        );
      }
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
            ? `You have reached your limit of ${reservation.maxRequests || 20} requests. Upgrade your plan at https://webguruji.online/contact.html for higher context and unlimited usage, or wait ${resetHours}h ${resetMins}m.`
            : `Guest limit of 8 requests reached. Please log in at webguruji.online for 20 requests and image generation, or upgrade your plan.`,
          upgradeUrl: 'https://webguruji.online/contact.html?subject=ai_upgrade',
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

    let userContent = prompt;
    if (imageBase64) {
      userContent = [
        { type: 'text', text: prompt },
        { type: 'image_url', image_url: { url: imageBase64 } }
      ];
    }

    if (
      formattedMessages.length === 0 ||
      formattedMessages[formattedMessages.length - 1].content !== prompt
    ) {
      formattedMessages.push({ role: 'user', content: userContent });
    }

    let nvidiaStream;
    try {
      nvidiaStream = await streamNvidiaTextChat({
        messages: formattedMessages,
        language,
        modelId: model,
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
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-visitor-id, x-requested-with',
      },
    });
  } catch (error) {
    console.error('API /api/chat Unhandled Exception:', error);
    if (reserved) {
      await refundUsageAllowance({ userId, guestKeyHash });
    }
    return NextResponse.json(
      { error: error.message || 'An unexpected server error occurred.' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-visitor-id, x-requested-with',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-visitor-id, x-requested-with',
      'Access-Control-Max-Age': '86400',
    },
  });
}
