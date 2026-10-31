import { NextResponse } from 'next/server';

const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Periodic cleanup if map grows
  if (rateLimitMap.size > 500) {
    for (const [key, val] of rateLimitMap.entries()) {
      if (now - val.startTime > RATE_LIMIT_WINDOW_MS) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!entry || now - entry.startTime > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, startTime: now });
    return false;
  }

  if (entry.count >= MAX_REQUESTS_PER_WINDOW) {
    return true;
  }

  entry.count += 1;
  return false;
}

export async function POST(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : request.headers.get('x-real-ip') ||
        request.headers.get('cf-connecting-ip') ||
        'anon';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { 
      name, email, message, 
      isPlatform, fullName, role, userClass, age, contactInfo, category,
      website, hp_check 
    } = body;

    // Honeypot bot trap
    if (website || hp_check) {
      return NextResponse.json({ success: true });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }
    if (message.length > 3000) {
      return NextResponse.json({ error: 'Message is too long (max 3,000 characters).' }, { status: 400 });
    }

    const clean = (str = '') => 
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('[contact] Telegram bot configuration missing.');
      return NextResponse.json({ error: 'Contact service temporarily unavailable.' }, { status: 500 });
    }

    const ALLOWED_ROLES = ['student', 'teacher', 'parent', 'admin', 'guest'];
    const sanitizedRole = typeof role === 'string' && ALLOWED_ROLES.includes(role.toLowerCase())
      ? role.toLowerCase()
      : 'student';
    const formattedRole = sanitizedRole.charAt(0).toUpperCase() + sanitizedRole.slice(1);

    let text = '';
    if (isPlatform) {
      text = `<b>🏢 New Platform Support Request</b>\n\n` +
             `<b>👤 Name:</b> ${clean(typeof fullName === 'string' ? fullName.slice(0, 100) : 'Anonymous')}\n` +
             `<b>🎭 Role:</b> ${clean(formattedRole)}\n` +
             (userClass && typeof userClass === 'string' ? `<b>🏫 Class:</b> ${clean(userClass.slice(0, 30))}\n` : '') +
             (age ? `<b>🎂 Age:</b> ${clean(String(age).slice(0, 10))}\n` : '') +
             (category && typeof category === 'string' ? `<b>🏷️ Category:</b> ${clean(category.slice(0, 100))}\n` : '') +
             (contactInfo && typeof contactInfo === 'string' ? `<b>📞 Contact:</b> ${clean(contactInfo.slice(0, 100))}\n` : '') +
             `\n<b>💬 Message:</b>\n${clean(message)}`;
    } else {
      text = `<b>📬 New Website Inquiry</b>\n\n` +
             `<b>👤 Name:</b> ${clean(typeof name === 'string' ? name.slice(0, 100) : 'Anonymous')}\n` +
             `<b>📧 Email:</b> ${clean(typeof email === 'string' ? email.slice(0, 150) : 'Not provided')}\n\n` +
             `<b>💬 Message:</b>\n${clean(message)}`;
    }

    const telegramRes = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML' }),
    });

    if (!telegramRes.ok) {
      console.error('[contact] Telegram API responded with error status:', telegramRes.status);
      return NextResponse.json({ error: 'Failed to deliver message. Please try again later.' }, { status: 502 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact] Submit error:', error);
    return NextResponse.json({ error: 'Failed to send message.' }, { status: 500 });
  }
}
