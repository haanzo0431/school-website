import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

const clean = (s) => (s || '').toLowerCase().trim().replace(/\s+/g, '');
const ID_REGEX = /^[a-zA-Z0-9._-]+$/;

async function studentByLogin(login, adminClient) {
  if (!login || typeof login !== 'string') return null;
  const cleaned = clean(login);
  if (!ID_REGEX.test(cleaned)) return null;

  const { data } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', `s-${cleaned}@xonqa.school`)
    .maybeSingle();

  return data?.id || null;
}

export async function POST(req) {
  try {
    const authCheck = await verifyCaller(req, 'admin');
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    const { adminClient } = authCheck;

    const b = await req.json().catch(() => null);
    if (!b || typeof b !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { kind, loginId, password, firstName, surname } = b;

    // Strict input validation
    if (!['teacher', 'parent'].includes(kind)) {
      return NextResponse.json({ error: 'Role must be "teacher" or "parent".' }, { status: 400 });
    }
    if (!loginId || typeof loginId !== 'string' || !ID_REGEX.test(clean(loginId)) || loginId.length > 50) {
      return NextResponse.json({ error: 'Login ID is invalid (alphanumeric, max 50 characters).' }, { status: 400 });
    }
    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 6 and 128 characters.' }, { status: 400 });
    }
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0 || firstName.length > 50) {
      return NextResponse.json({ error: 'First name is required (max 50 characters).' }, { status: 400 });
    }
    if (!surname || typeof surname !== 'string' || surname.trim().length === 0 || surname.length > 50) {
      return NextResponse.json({ error: 'Surname is required (max 50 characters).' }, { status: 400 });
    }
    if (kind === 'teacher' && (!b.subject || typeof b.subject !== 'string' || b.subject.trim().length === 0 || b.subject.length > 100)) {
      return NextResponse.json({ error: 'Subject is required for teachers (max 100 characters).' }, { status: 400 });
    }

    const prefix = kind === 'teacher' ? 't' : 'p';
    const email = `${prefix}-${clean(loginId)}@xonqa.school`;

    // Validate students with max limit of 50
    const logins = kind === 'teacher'
      ? (Array.isArray(b.students) ? b.students.slice(0, 50) : [])
      : [b.childLogin];

    const studentIds = [];
    for (const l of logins) {
      const id = await studentByLogin(l, adminClient);
      if (!id) {
        return NextResponse.json({ error: `Student "${String(l).slice(0, 50)}" not found.` }, { status: 400 });
      }
      studentIds.push(id);
    }

    const cleanFirst = firstName.trim();
    const cleanLast = surname.trim();

    // 1. Create Auth Account
    const { data: auth, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: cleanFirst, surname: cleanLast, role: kind },
    });

    if (authError) {
      const isDuplicate = authError.message?.toLowerCase().includes('already registered');
      return NextResponse.json(
        { error: isDuplicate ? 'An account with this ID already exists.' : 'Failed to create user account.' },
        { status: 400 }
      );
    }

    const uid = auth.user.id;

    // 2. Upsert Staff Profile
    const { error: pErr } = await adminClient.from('profiles').upsert(
      [{
        id: uid,
        first_name: cleanFirst,
        surname: cleanLast,
        name: `${cleanFirst} ${cleanLast}`,
        email,
        role: kind,
        subject: kind === 'teacher' ? b.subject.trim() : null,
        class: kind === 'teacher' && typeof b.gradeClass === 'string' ? b.gradeClass.trim().slice(0, 30) : null,
        child_id: kind === 'parent' ? studentIds[0] : null,
      }],
      { onConflict: 'id' }
    );

    if (pErr) {
      await adminClient.auth.admin.deleteUser(uid);
      console.error('[create-staff] Profile error:', pErr);
      return NextResponse.json({ error: 'Failed to create staff profile.' }, { status: 500 });
    }

    // 3. Connect Relationships with full atomic rollback on failure
    if (kind === 'teacher') {
      if (studentIds.length > 0) {
        const rows = studentIds.map((sid) => ({
          teacher_id: uid,
          student_id: sid,
          subject: b.subject.trim(),
        }));
        const { error: relError } = await adminClient
          .from('teacher_students')
          .upsert(rows, { onConflict: 'teacher_id,student_id' });

        if (relError) {
          console.error('[create-staff] Teacher relation error:', relError);
          await adminClient.from('profiles').delete().eq('id', uid);
          await adminClient.auth.admin.deleteUser(uid);
          return NextResponse.json({ error: 'Failed to link students to teacher.' }, { status: 500 });
        }
      }
    } else {
      if (studentIds.length > 0) {
        const { error: parentRelError } = await adminClient
          .from('profiles')
          .update({ parent_id: uid })
          .eq('id', studentIds[0]);

        if (parentRelError) {
          console.error('[create-staff] Parent relation error:', parentRelError);
          await adminClient.from('profiles').delete().eq('id', uid);
          await adminClient.auth.admin.deleteUser(uid);
          return NextResponse.json({ error: 'Failed to link child to parent.' }, { status: 500 });
        }
      }
    }

    return NextResponse.json({ success: true, email });
  } catch (err) {
    console.error('[create-staff] Error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
