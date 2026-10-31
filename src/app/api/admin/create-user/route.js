import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

const ID_REGEX = /^[a-zA-Z0-9._-]+$/;

async function findUserId(prefix, rawId, adminClient) {
  if (!rawId || typeof rawId !== 'string') return null;
  let id = rawId.toLowerCase().trim().replace(/\s+/g, '');
  if (!ID_REGEX.test(id)) return null;
  if (!id.startsWith(`${prefix}-`)) id = `${prefix}-${id}`;
  const email = `${id}@xonqa.school`;

  const { data } = await adminClient
    .from('profiles')
    .select('id')
    .eq('email', email)
    .maybeSingle();

  return data ? data.id : null;
}

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

    const {
      firstName, surname, gradeClass, age,
      studentId, password, teacherId, parentId,
    } = body;

    // Strict input validation & boundaries
    if (!firstName || typeof firstName !== 'string' || firstName.trim().length === 0 || firstName.length > 50) {
      return NextResponse.json({ error: 'First name is required (max 50 characters).' }, { status: 400 });
    }
    if (!surname || typeof surname !== 'string' || surname.trim().length === 0 || surname.length > 50) {
      return NextResponse.json({ error: 'Surname is required (max 50 characters).' }, { status: 400 });
    }
    if (!studentId || typeof studentId !== 'string' || !ID_REGEX.test(studentId.trim()) || studentId.length > 50) {
      return NextResponse.json(
        { error: 'Student ID is invalid (alphanumeric, dot, dash, underscore only, max 50 characters).' },
        { status: 400 }
      );
    }
    if (!password || typeof password !== 'string' || password.length < 6 || password.length > 128) {
      return NextResponse.json({ error: 'Password must be between 6 and 128 characters.' }, { status: 400 });
    }

    const cleanFirst = firstName.trim();
    const cleanLast = surname.trim();
    const cleanId = studentId.toLowerCase().trim().replace(/\s+/g, '');
    const email = `s-${cleanId}@xonqa.school`;

    // Validate relationships before creating auth account
    let teacherUuid = null;
    let parentUuid = null;

    if (teacherId && typeof teacherId === 'string' && teacherId.trim()) {
      teacherUuid = await findUserId('t', teacherId, adminClient);
      if (!teacherUuid) {
        return NextResponse.json({ error: `Teacher "${teacherId}" not found.` }, { status: 400 });
      }
    }
    if (parentId && typeof parentId === 'string' && parentId.trim()) {
      parentUuid = await findUserId('p', parentId, adminClient);
      if (!parentUuid) {
        return NextResponse.json({ error: `Parent "${parentId}" not found.` }, { status: 400 });
      }
    }

    const parsedAge = age ? parseInt(age, 10) : null;
    const validAge = Number.isInteger(parsedAge) && parsedAge >= 5 && parsedAge <= 100 ? parsedAge : null;
    const cleanClass = typeof gradeClass === 'string' ? gradeClass.trim().slice(0, 30) : null;
    const fullName = `${cleanFirst} ${cleanLast}`;

    // 1. Create Auth Account
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: cleanFirst, surname: cleanLast, role: 'student' },
    });

    if (authError) {
      const isDuplicate = authError.message?.toLowerCase().includes('already registered');
      return NextResponse.json(
        { error: isDuplicate ? 'An account with this ID already exists.' : 'Failed to create student account.' },
        { status: 400 }
      );
    }

    // 2. Upsert Profile
    const { error: profileError } = await adminClient.from('profiles').upsert([
      {
        id: authData.user.id,
        first_name: cleanFirst,
        last_name: cleanLast,
        surname: cleanLast,
        name: fullName,
        class: cleanClass,
        age: validAge,
        student_id: cleanId,
        email,
        role: 'student',
        teacher_id: teacherUuid,
        parent_id: parentUuid,
      },
    ]);

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      console.error('[create-user] Profile error:', profileError);
      return NextResponse.json({ error: 'Failed to create student profile.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      user: { email, studentId: cleanId, name: fullName },
    });
  } catch (err) {
    console.error('[create-user] Error:', err);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
