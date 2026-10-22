import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { sendWelcomeEmail } from '@/lib/mail';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

const HMAC_SECRET = process.env.GUEST_ID_HMAC_SECRET || 'harshguruji_login_verification_secret_2026';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    const { email, code, token, source } = await request.json();

    if (!email || !code || !token) {
      return NextResponse.json(
        { error: 'Email, verification code, and token are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    // 1. Parse token (format: expiresAt:signature)
    const [expiresAtStr, signature] = token.split(':');
    const expiresAt = parseInt(expiresAtStr, 10);

    if (!expiresAt || !signature) {
      return NextResponse.json(
        { error: 'Invalid verification token format.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Check expiration
    if (Date.now() > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code has expired. Please request a new code.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 3. Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(`${cleanEmail}:${cleanCode}:${expiresAt}`)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { error: 'Invalid verification code. Please check the code sent to your email.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 4. Code is verified! Check if user is new or returning
    let isNewUser = false;
    let displayName = cleanEmail.split('@')[0];

    try {
      const { data: usersList } = await supabaseAdmin.auth.admin.listUsers();
      const user = usersList?.users?.find(u => (u.email || '').toLowerCase() === cleanEmail);

      if (user) {
        displayName = user.user_metadata?.full_name || user.user_metadata?.name || displayName;
        const alreadySent = user.user_metadata?.welcome_email_sent === true;

        if (!alreadySent) {
          isNewUser = true;
          // Send Welcome Email from info@webguruji.online
          try {
            await sendWelcomeEmail({
              to: cleanEmail,
              name: displayName,
              source: source || 'main'
            });
            await supabaseAdmin.auth.admin.updateUserById(user.id, {
              user_metadata: {
                ...user.user_metadata,
                welcome_email_sent: true,
                welcome_sent_at: new Date().toISOString()
              }
            });
          } catch (mErr) {
            console.warn('Welcome email dispatch notice:', mErr);
          }
        }
      }
    } catch (dbErr) {
      console.warn('User status check notice:', dbErr);
    }

    return NextResponse.json({
      success: true,
      verified: true,
      isNewUser,
      displayName,
      greeting: isNewUser
        ? (source === 'ai' ? `Welcome to GuruAI, ${displayName}! 🎉` : `Welcome to HarshGuruJi, ${displayName}! 🎉`)
        : `Welcome back, ${displayName}! 👋`
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('Verify login code error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to verify login code.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
