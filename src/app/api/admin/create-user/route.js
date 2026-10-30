import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

// Login ID (masalan "teacher1") bo'yicha profil topadi (Indexed O(1) DB lookup)
async function findUserId(prefix, rawId, adminClient) {
  if (!rawId) return null;
  let id = rawId.toLowerCase().trim().replace(/\s+/g, '');
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
    // Verify caller is an authenticated admin
    const authCheck = await verifyCaller(req, 'admin');
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }
    const { adminClient } = authCheck;

    const {
      firstName, surname, gradeClass, age,
      studentId, password, teacherId, parentId,
    } = await req.json();

    if (!studentId || !password || !firstName || !surname) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const cleanId = studentId.toLowerCase().trim().replace(/\s+/g, '');
    const email = `s-${cleanId}@xonqa.school`;

    // Ustoz va ota-onani oldin tekshiramiz (topilmasa akkaunt yaratmaymiz)
    let teacherUuid = null;
    let parentUuid = null;

    if (teacherId && teacherId.trim()) {
      teacherUuid = await findUserId('t', teacherId, adminClient);
      if (!teacherUuid) {
        return NextResponse.json({ error: `Teacher "${teacherId}" topilmadi.` }, { status: 400 });
      }
    }
    if (parentId && parentId.trim()) {
      parentUuid = await findUserId('p', parentId, adminClient);
      if (!parentUuid) {
        return NextResponse.json({ error: `Parent "${parentId}" topilmadi.` }, { status: 400 });
      }
    }

    // 1. Auth akkaunt
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, surname, role: 'student' },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Profil
    const { error: profileError } = await adminClient.from('profiles').upsert([
      {
        id: authData.user.id,
        first_name: firstName,
        surname,
        class: gradeClass,
        age: parseInt(age, 10) || null,
        student_id: cleanId,
        email,
        role: 'student',
        teacher_id: teacherUuid,
        parent_id: parentUuid,
      },
    ]);

    if (profileError) {
      await adminClient.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json({ error: profileError.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: { email, studentId: cleanId, name: `${firstName} ${surname}` },
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}