import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const clean = (s) => (s || '').toLowerCase().trim().replace(/\s+/g, '');

async function studentByLogin(login) {
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('email', `s-${clean(login)}@xonqa.school`)
    .maybeSingle();
  return data?.id || null;
}

export async function POST(req) {
  try {
    const b = await req.json();
    const { kind, loginId, password, firstName, surname } = b;
    if (!['teacher', 'parent'].includes(kind) || !loginId || !password) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 });
    }

    const prefix = kind === 'teacher' ? 't' : 'p';
    const email = `${prefix}-${clean(loginId)}@xonqa.school`;

    // Bog'lanadigan o'quvchilarni oldin topamiz
    const logins = kind === 'teacher' ? b.students || [] : [b.childLogin];
    const studentIds = [];
    for (const l of logins) {
      const id = await studentByLogin(l);
      if (!id) {
        return NextResponse.json({ error: `O'quvchi topilmadi: ${l}` }, { status: 400 });
      }
      studentIds.push(id);
    }

    const { data: auth, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, surname, role: kind },
    });
    if (authError) return NextResponse.json({ error: authError.message }, { status: 400 });

    const uid = auth.user.id;

    const { error: pErr } = await admin.from('profiles').upsert(
      [{
        id: uid,
        first_name: firstName,
        surname,
        email,
        role: kind,
        subject: kind === 'teacher' ? b.subject : null,
        class: kind === 'teacher' ? b.gradeClass || null : null,
        child_id: kind === 'parent' ? studentIds[0] : null,
      }],
      { onConflict: 'id' }
    );
    if (pErr) {
      await admin.auth.admin.deleteUser(uid);
      return NextResponse.json({ error: pErr.message }, { status: 400 });
    }

    if (kind === 'teacher') {
      const rows = studentIds.map((sid) => ({
        teacher_id: uid,
        student_id: sid,
        subject: b.subject,
      }));
      const { error } = await admin
        .from('teacher_students')
        .upsert(rows, { onConflict: 'teacher_id,student_id' });
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    } else {
      const { error } = await admin
        .from('profiles')
        .update({ parent_id: uid })
        .eq('id', studentIds[0]);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, email });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}