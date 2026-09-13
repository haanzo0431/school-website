import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      name, email, message, 
      isPlatform, fullName, role, userClass, age, contactInfo, category 
    } = body;

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in .env.local');
      return NextResponse.json(
        { error: 'Telegram configuration missing on server.' },
        { status: 500 }
      );
    }

    // Escape HTML special characters to prevent Telegram API parsing crashes
    const clean = (str = '') => 
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    let text = '';

    if (isPlatform) {
      // Capitalize role for clean display (e.g., "Student", "Teacher", "Parent")
      const rawRole = role || 'student';
      const formattedRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

      text = `<b>🔔 Platform Request</b>\n\n` +
             `<b>📁 Category:</b> ${clean(category || 'General Proposal')}\n` +
             `<b>👤 User:</b> ${clean(fullName || 'Anonymous User')} (${clean(formattedRole)})\n` +
             `<b>🏫 Class:</b> ${clean(userClass || 'N/A')} | <b>Age:</b> ${clean(age || 'N/A')}\n` +
             `<b>📱 Contact:</b> ${clean(contactInfo || 'Not provided')}\n\n` +
             `<b>💬 Message:</b>\n${clean(message)}`;
    } else {
      text = `<b>📬 New Website Inquiry</b>\n\n` +
             `<b>👤 Name:</b> ${clean(name)}\n` +
             `<b>📧 Email:</b> ${clean(email)}\n\n` +
             `<b>💬 Message:</b>\n${clean(message)}`;
    }

    const telegramRes = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
          parse_mode: 'HTML',
        }),
      }
    );

    const telegramData = await telegramRes.json();

    if (!telegramRes.ok) {
      console.error('❌ Telegram API Rejected Request:', telegramData);
      throw new Error(telegramData.description || 'Telegram API call failed');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Contact Submit Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message.' },
      { status: 500 }
    );
  }
}