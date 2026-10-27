import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Login ID (masalan "teacher1") bo'yicha auth foydalanuvchini topadi
async function findUserId(prefix, rawId) {
  if (!rawId) return null;
  let id = rawId.toLowerCase().trim().replace(/\s+/g, '');
  if (!id.startsWith(`${prefix}-`)) id = `${prefix}-${id}`;
  const email = `${id}@xonqa.school`;

  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ perPage: 1000 });
  if (error) return null;
  const found = data.users.find((u) => (u.email || '').toLowerCase() === email);
  return found ? found.id : null;
}

export async function POST(req) {
  try {
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
      teacherUuid = await findUserId('t', teacherId);
      if (!teacherUuid) {
        return NextResponse.json({ error: `Teacher "${teacherId}" topilmadi.` }, { status: 400 });
      }
    }
    if (parentId && parentId.trim()) {
      parentUuid = await findUserId('p', parentId);
      if (!parentUuid) {
        return NextResponse.json({ error: `Parent "${parentId}" topilmadi.` }, { status: 400 });
      }
    }

    // 1. Auth akkaunt
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, surname, role: 'student' },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 2. Profil
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert([
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
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
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