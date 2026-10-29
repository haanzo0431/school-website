import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

export async function POST(req) {
  try {
    // Verify caller is an authenticated admin
    const authCheck = await verifyCaller(req, 'admin');
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    const { adminClient } = authCheck;

    const { email, password, firstName, lastName, age, className } = await req.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, surname: lastName, role: 'student' },
    });

    if (authError) throw authError;

    // 2. Use .upsert() so it updates the row if a trigger already created it
    const fullName = `${firstName} ${lastName}`.trim();
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(
        {
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
          surname: lastName,
          name: fullName,
          email,
          age: age ? parseInt(age, 10) : null,
          role: 'student',
          class: className,
        },
        { onConflict: 'id' }
      );

    if (profileError) throw profileError;

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}