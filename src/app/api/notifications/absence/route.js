import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

export async function POST(req) {
  try {
    // 1. Authorize caller: Only teachers and admins can trigger absence alerts
    const authCheck = await verifyCaller(req, ['teacher', 'admin']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { adminClient } = authCheck;
    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { studentIds, className, date } = body;

    if (!Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: 'No absent students specified.' }, { status: 400 });
    }

    const cleanClass = typeof className === 'string' ? className.trim().slice(0, 30) : 'Noma\'lum sinf';
    const cleanDate = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date.trim())
      ? date.trim()
      : new Date().toISOString().slice(0, 10);

    // 2. Fetch absent student profiles
    const cappedIds = studentIds.slice(0, 50);
    const { data: students, error: fetchErr } = await adminClient
      .from('profiles')
      .select('id, name, first_name, surname')
      .in('id', cappedIds);

    if (fetchErr || !students || students.length === 0) {
      return NextResponse.json({ error: 'Student records not found.' }, { status: 404 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.warn('[notifications/absence] Telegram bot configuration missing.');
      return NextResponse.json({ success: true, notifiedCount: 0, warning: 'Telegram not configured' });
    }

    // 3. Format absence-only alert (strictly excludes late/excused)
    const escapeHtml = (str = '') =>
      String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const studentListText = students
      .map((s) => `• <b>${escapeHtml(s.name || `${s.first_name || ''} ${s.surname || ''}`.trim() || 'O\'quvchi')}</b>`)
      .join('\n');

    const messageText =
      `⚠️ <b>Davomat Xabarnomasi: Dars qoldirish</b>\n\n` +
      `📅 <b>Sana:</b> ${cleanDate}\n` +
      `🏫 <b>Sinf:</b> ${escapeHtml(cleanClass)}\n\n` +
      `Quyidagi o'quvchi(lar) bugun darsda qatnashmadi (Yo'q):\n` +
      `${studentListText}\n\n` +
      `<i>Iltimos, ota-onalar dars qoldirish sababini sinf rahbariga yoki maktab ma'muriyatiga ma'lum qiling.</i>`;

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: messageText,
        parse_mode: 'HTML',
      }),
    });

    if (!telegramRes.ok) {
      console.error('[notifications/absence] Telegram API error status:', telegramRes.status);
    }

    return NextResponse.json({
      success: true,
      notifiedCount: students.length,
      date: cleanDate,
    });
  } catch (err) {
    console.error('[notifications/absence] Error:', err);
    return NextResponse.json({ error: 'Failed to dispatch absence alert.' }, { status: 500 });
  }
}
