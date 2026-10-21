import { NextResponse } from 'next/server';
import { sendHostingerEmail } from '../../../../lib/mail.js';

export async function POST(req) {
  try {
    const body = await req.json();
    const { to, subject, text, html, displayName } = body;

    if (!to || !subject) {
      return NextResponse.json(
        { error: 'Missing required fields: "to" and "subject"' },
        { status: 400 }
      );
    }

    const result = await sendHostingerEmail({ to, subject, text, html, displayName });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: error.message || 'Failed to send email via Hostinger' },
      { status: 500 }
    );
  }
}
