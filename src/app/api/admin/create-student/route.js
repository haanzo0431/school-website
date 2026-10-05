import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(req) {
  try {
    const { email, password, firstName, lastName, age, className } = await req.json();

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) throw authError;

    // 2. Use .upsert() so it updates the row if a trigger already created it
    const fullName = `${firstName} ${lastName}`.trim();
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: authData.user.id,
          first_name: firstName,
          last_name: lastName,
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