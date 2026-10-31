import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

export async function POST(req) {
  try {
    // 1. Authorize: Only teachers and admins can generate/send the end-of-day digest
    const authCheck = await verifyCaller(req, ['teacher', 'admin']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { adminClient } = authCheck;
    const body = await req.json().catch(() => ({}));
    const targetDate = typeof body.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(body.date.trim())
      ? body.date.trim()
      : new Date().toISOString().slice(0, 10);

    // 2. Query today's attempts from classwork_attempts
    const { data: attempts, error: attErr } = await adminClient
      .from('classwork_attempts')
      .select('student_id, subject, score, lesson_date')
      .eq('lesson_date', targetDate);

    if (attErr) {
      console.error('[daily-digest] Error fetching attempts:', attErr);
      return NextResponse.json({ error: 'Failed to fetch day attempts.' }, { status: 500 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!attempts || attempts.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No quiz or classwork attempts recorded for this date.',
        count: 0,
        date: targetDate,
      });
    }

    // 3. Collect unique student IDs and fetch student names
    const studentIds = [...new Set(attempts.map((a) => a.student_id))];
    const { data: studentProfiles } = await adminClient
      .from('profiles')
      .select('id, name, first_name, surname, class')
      .in('id', studentIds);

    const profileMap = {};
    (studentProfiles || []).forEach((p) => {
      profileMap[p.id] = {
        name: p.name || `${p.first_name || ''} ${p.surname || ''}`.trim() || 'O\'quvchi',
        className: p.class || '',
      };
    });

    // 4. Group scores by student
    const studentScores = {};
    attempts.forEach((att) => {
      if (!studentScores[att.student_id]) {
        studentScores[att.student_id] = [];
      }
      studentScores[att.student_id].push(`${att.subject}: ${Number(att.score).toFixed(1)}/6`);
    });

    const escapeHtml = (str = '') =>
      String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const digestLines = Object.entries(studentScores).map(([sid, scores]) => {
      const student = profileMap[sid] || { name: 'O\'quvchi', className: '' };
      const classLabel = student.className ? ` (${escapeHtml(student.className)})` : '';
      return `• <b>${escapeHtml(student.name)}${classLabel}:</b> ${scores.join(', ')}`;
    });

    const messageText =
      `📊 <b>Kunlik Baholar va Test Natijalari Hisoboti</b>\n\n` +
      `📅 <b>Sana:</b> ${targetDate}\n` +
      `🏫 <b>Xonqa Tuman Maktab Platformasi</b>\n\n` +
      `Bugungi darslarda baholangan o'quvchilar:\n` +
      `${digestLines.slice(0, 40).join('\n')}\n\n` +
      `<i>Jami: ${attempts.length} ta test urinishi topshirildi. Hurmatli ota-onalar, farzandingizning darsdagi faolligini doimiy nazorat qilib boring.</i>`;

    if (botToken && chatId) {
      await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
        }),
      });
    }

    return NextResponse.json({
      success: true,
      deliveredToTelegram: Boolean(botToken && chatId),
      studentCount: studentIds.length,
      attemptCount: attempts.length,
      date: targetDate,
    });
  } catch (err) {
    console.error('[daily-digest] Error:', err);
    return NextResponse.json({ error: 'Failed to generate daily digest.' }, { status: 500 });
  }
}
