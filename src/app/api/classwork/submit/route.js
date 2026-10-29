import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

const round1 = (n) => Math.round(n * 10) / 10;
const activeSubmissions = new Set();

export async function POST(req) {
  let userIdForLock = null;
  try {
    // 1. Authenticate caller (Must be logged in)
    const authCheck = await verifyCaller(req);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { user, profile, adminClient } = authCheck;
    const role = profile.role || 'student';
    if (role !== 'student' && role !== 'admin') {
      return NextResponse.json(
        { error: 'Faqat o\'quvchilar test topshirishi mumkin.' },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { testId, answers, lessonDate } = body;
    if (!testId || !answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'Missing testId or answers payload.' }, { status: 400 });
    }

    // Concurrency lock per student to prevent race condition bypassing 3-attempt ceiling
    if (activeSubmissions.has(user.id)) {
      return NextResponse.json(
        { error: 'Urinish yuborilmoqda, iltimos kuting.' },
        { status: 429 }
      );
    }
    activeSubmissions.add(user.id);
    userIdForLock = user.id;

    // 2. Fetch the test details
    const { data: test, error: testErr } = await adminClient
      .from('classwork_tests')
      .select('*')
      .eq('id', testId)
      .maybeSingle();

    if (testErr || !test) {
      return NextResponse.json({ error: 'Test topilmadi.' }, { status: 404 });
    }

    const targetDate = test.test_date || lessonDate;

    // 3. Attempt Limit Verification: max 3 attempts per student per teacher on this date
    const { data: existingAttempts, error: attErr } = await adminClient
      .from('classwork_attempts')
      .select('id, attempt_no')
      .eq('student_id', user.id)
      .eq('teacher_id', test.teacher_id)
      .eq('lesson_date', targetDate);

    if (attErr) {
      return NextResponse.json({ error: attErr.message }, { status: 500 });
    }

    const attemptCount = existingAttempts?.length || 0;
    if (attemptCount >= 3) {
      return NextResponse.json(
        { error: 'Bugungi kun uchun barcha urinishlar (3 ta) tugagan.' },
        { status: 400 }
      );
    }

    // 4. Server-side fetch of questions WITH authoritative correct answers
    const { data: questions, error: qErr } = await adminClient
      .from('classwork_test_questions')
      .select('id, position, correct')
      .eq('test_id', testId)
      .order('position', { ascending: true });

    if (qErr || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Ushbu test uchun savollar topilmadi.' }, { status: 404 });
    }

    // 5. Server-side grading (tamper-proof)
    let correctCount = 0;
    const total = questions.length;

    questions.forEach((q, i) => {
      // Support answer by 0-based index, question ID, or 1-based position
      const chosen =
        answers[i] !== undefined
          ? answers[i]
          : answers[q.id] !== undefined
          ? answers[q.id]
          : answers[q.position];

      if (chosen !== undefined && chosen !== null && Number(chosen) === q.correct) {
        correctCount++;
      }
    });

    // 6-point scale
    const score = total > 0 ? round1((correctCount / total) * 6) : 0;

    // 6. Record verified attempt in database
    const { data: attemptRecord, error: insertErr } = await adminClient
      .from('classwork_attempts')
      .insert([{
        student_id: user.id,
        teacher_id: test.teacher_id,
        subject: test.subject,
        lesson_date: targetDate,
        attempt_no: attemptCount + 1,
        score,
      }])
      .select()
      .single();

    if (insertErr) {
      return NextResponse.json({ error: insertErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      correct: correctCount,
      total,
      score,
      attempt: attemptRecord,
    });
  } catch (err) {
    console.error('Classwork submission error:', err);
    return NextResponse.json({ error: err.message || 'Server xatoligi' }, { status: 500 });
  } finally {
    if (userIdForLock) {
      activeSubmissions.delete(userIdForLock);
    }
  }
}
