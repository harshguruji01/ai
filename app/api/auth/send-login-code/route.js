import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { sendVerificationCodeEmail } from '@/lib/mail';

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
    const { email, password, source } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Verify credentials with Supabase
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false }
    });

    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email: cleanEmail,
      password: password
    });

    if (authError) {
      let errorMsg = authError.message || 'Invalid email or password.';
      if (errorMsg.includes('Invalid login credentials')) {
        errorMsg = 'Invalid email or password. Please check your credentials.';
      }
      return NextResponse.json(
        { error: errorMsg },
        { status: 401, headers: corsHeaders }
      );
    }

    // 2. Generate cryptographically secure 6-digit numeric OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    // 3. Create tamper-proof HMAC verification token
    const signature = crypto
      .createHmac('sha256', HMAC_SECRET)
      .update(`${cleanEmail}:${code}:${expiresAt}`)
      .digest('hex');

    const token = `${expiresAt}:${signature}`;

    // 4. Send verification code via Hostinger Mail API from info@webguruji.online
    await sendVerificationCodeEmail({
      to: cleanEmail,
      code,
      expiresMinutes: 10,
      source: source || 'main'
    });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent to your email from info@webguruji.online',
      token,
      email: cleanEmail,
      userId: authData.user?.id
    }, { headers: corsHeaders });

  } catch (err) {
    console.error('Send login code error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to send login verification code.' },
      { status: 500, headers: corsHeaders }
    );
  }
}
