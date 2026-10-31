import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export async function POST(req) {
  try {
    const authCheck = await verifyCaller(req, 'admin');
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    const { adminClient } = authCheck;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { email, password, firstName, lastName, age, className } = body;

    // Strict validation
    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.length > 150) {
      return NextResponse.json({ error: 'Valid email address is required (max 150 characters).' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 6 and 128 characters.' }, { status: 400 });
    }
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0 || firstName.length > 50) {
      return NextResponse.json({ error: 'First name is required (max 50 characters).' }, { status: 400 });
    }
    if (!lastName || typeof lastName !== 'string' || lastName.trim().length === 0 || lastName.length > 50) {
      return NextResponse.json({ error: 'Last name is required (max 50 characters).' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanFirst = firstName.trim();
    const cleanLast = lastName.trim();
    const cleanClass = typeof className === 'string' ? className.trim().slice(0, 30) : null;
    const parsedAge = age ? parseInt(age, 10) : null;
    const validAge = Number.isInteger(parsedAge) && parsedAge >= 5 && parsedAge <= 100 ? parsedAge : null;
    const fullName = `${cleanFirst} ${cleanLast}`;

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { first_name: cleanFirst, surname: cleanLast, role: 'student' },
    });

    if (authError) {
      const isDuplicate = authError.message?.toLowerCase().includes('already registered');
      return NextResponse.json(
        { error: isDuplicate ? 'An account with this email already exists.' : 'Failed to create student account.' },
        { status: 400 }
      );
    }

    // 2. Upsert Profile
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: authData.user.id,
          first_name: cleanFirst,
          last_name: cleanLast,
          surname: cleanLast,
          name: fullName,
          email: cleanEmail,
          age: validAge,
          role: 'student',
          class: cleanClass,
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      console.error('[create-student] Profile error:', profileError);
      return NextResponse.json({ error: 'Failed to create student profile.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error) {
    console.error('[create-student] Error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
