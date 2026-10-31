import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

const round1 = (n) => Math.round(n * 10) / 10;
const activeSubmissions = new Set();
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export async function POST(req) {
  let userIdForLock = null;
  try {
    const authCheck = await verifyCaller(req, ['student', 'admin']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { user, profile, adminClient } = authCheck;

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { testId, answers, lessonDate } = body;
    if (!testId || typeof testId !== 'string' || testId.trim().length === 0 || testId.length > 100) {
      return NextResponse.json({ error: 'Valid testId is required.' }, { status: 400 });
    }
    if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.keys(answers).length > 100) {
      return NextResponse.json({ error: 'Invalid answers payload (max 100 answers).' }, { status: 400 });
    }

    // In-memory concurrency guard per student
    if (activeSubmissions.has(user.id)) {
      return NextResponse.json(
        { error: 'Urinish yuborilmoqda, iltimos kuting.' },
        { status: 429 }
      );
    }
    activeSubmissions.add(user.id);
    userIdForLock = user.id;

    // Fetch test details
    const { data: test, error: testErr } = await adminClient
      .from('classwork_tests')
      .select('id, teacher_id, subject, test_date')
      .eq('id', testId.trim())
      .maybeSingle();

    if (testErr || !test) {
      return NextResponse.json({ error: 'Test topilmadi.' }, { status: 404 });
    }

    // Strict date validation: prevent bypassing attempt limit with arbitrary strings
    let targetDate = test.test_date;
    if (!targetDate && lessonDate && typeof lessonDate === 'string' && DATE_REGEX.test(lessonDate.trim())) {
      targetDate = lessonDate.trim();
    }
    if (!targetDate) {
      targetDate = new Date().toISOString().slice(0, 10);
    }

    // Attempt ceiling check (max 3)
    const { data: existingAttempts, error: attErr } = await adminClient
      .from('classwork_attempts')
      .select('id')
      .eq('student_id', user.id)
      .eq('teacher_id', test.teacher_id)
      .eq('lesson_date', targetDate);

    if (attErr) {
      console.error('[classwork-submit] Attempt check error:', attErr);
      return NextResponse.json({ error: 'Server xatoligi yuz berdi.' }, { status: 500 });
    }

    const attemptCount = existingAttempts?.length || 0;
    if (attemptCount >= 3) {
      return NextResponse.json(
        { error: 'Bugungi kun uchun barcha urinishlar (3 ta) tugagan.' },
        { status: 400 }
      );
    }

    // Server-side questions & grading (answers never sent to client)
    const { data: questions, error: qErr } = await adminClient
      .from('classwork_test_questions')
      .select('id, position, correct')
      .eq('test_id', test.id)
      .order('position', { ascending: true });

    if (qErr || !questions || questions.length === 0) {
      return NextResponse.json({ error: 'Ushbu test uchun savollar topilmadi.' }, { status: 404 });
    }

    let correctCount = 0;
    const total = questions.length;

    questions.forEach((q, i) => {
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

    const score = total > 0 ? round1((correctCount / total) * 6) : 0;

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
      console.error('[classwork-submit] Insert attempt error:', insertErr);
      return NextResponse.json({ error: 'Natijani saqlashda xatolik yuz berdi.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      correct: correctCount,
      total,
      score,
      attempt: attemptRecord,
    });
  } catch (err) {
    console.error('[classwork-submit] Error:', err);
    return NextResponse.json({ error: 'Server xatoligi yuz berdi.' }, { status: 500 });
  } finally {
    if (userIdForLock) {
      activeSubmissions.delete(userIdForLock);
    }
  }
}
