import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request) {
  try {
    const { email, password, name } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const displayName = name?.trim() || cleanEmail.split('@')[0];

    // Try admin creation with email_confirm: true to completely bypass SMTP/confirmation barriers
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: displayName,
        name: displayName,
      },
    });

    if (!createError && newUser?.user) {
      // Ensure user profile in public.users
      await supabaseAdmin.from('users').upsert({
        id: newUser.user.id,
        email: cleanEmail,
        name: displayName,
        role: 'user',
      }, { onConflict: 'id' });

      return NextResponse.json({
        success: true,
        message: 'Account created and verified successfully.',
        user: { id: newUser.user.id, email: cleanEmail },
      });
    }

    // If user already exists, auto-confirm their email and update password if needed
    if (createError && (
      createError.message?.toLowerCase().includes('already registered') ||
      createError.message?.toLowerCase().includes('already exists') ||
      createError.status === 422
    )) {
      // Search for the user to confirm them
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const existingUser = listData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

      if (existingUser) {
        // Auto-confirm the user and update password
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          email_confirm: true,
          password: password,
          user_metadata: {
            full_name: displayName,
            name: displayName,
          },
        });

        await supabaseAdmin.from('users').upsert({
          id: existingUser.id,
          email: cleanEmail,
          name: displayName,
          role: 'user',
        }, { onConflict: 'id' });

        return NextResponse.json({
          success: true,
          message: 'Account updated and verified successfully.',
          user: { id: existingUser.id, email: cleanEmail },
        });
      }
    }

    if (createError) {
      return NextResponse.json(
        { error: createError.message || 'Failed to create account.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Signup API error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
