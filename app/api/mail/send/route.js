import { NextResponse } from 'next/server';
import { sendHostingerEmail, sendWelcomeEmail, sendVerificationCodeEmail } from '../../../../lib/mail.js';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { to, subject, text, html, displayName, type, name, source, code, expiresMinutes } = body;

    if (!to) {
      return NextResponse.json(
        { error: 'Missing required field: "to"' },
        { status: 400, headers: corsHeaders }
      );
    }

    let result;
    if (type === 'welcome') {
      result = await sendWelcomeEmail({
        to,
        name: name || displayName || 'User',
        source: source || 'main'
      });
    } else if (type === 'verification_code') {
      if (!code) {
        return NextResponse.json(
          { error: 'Missing required field: "code"' },
          { status: 400, headers: corsHeaders }
        );
      }
      result = await sendVerificationCodeEmail({
        to,
        code,
        expiresMinutes: expiresMinutes || 10,
        source: source || 'main'
      });
    } else {
      if (!subject) {
        return NextResponse.json(
          { error: 'Missing required field: "subject"' },
          { status: 400, headers: corsHeaders }
        );
      }
      result = await sendHostingerEmail({ to, subject, text, html, displayName });
    }

    return NextResponse.json(result, { headers: corsHeaders });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to send email via Hostinger' },
      { status: 500, headers: corsHeaders }
    );
  }
}
