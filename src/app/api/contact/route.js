import { NextResponse } from 'next/server';

// In-memory IP rate limiter: max 5 requests per 60 seconds per IP
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  // Clean up occasionally
  if (rateLimitMap.size > 2000) {
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
    // 1. Client IP detection & Rate Limiting
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded
      ? forwarded.split(',')[0].trim()
      : request.headers.get('cf-connecting-ip') ||
        request.headers.get('x-real-ip') ||
        `ua-${request.headers.get('user-agent') || 'anon'}`;

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please wait a minute before sending another message.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { 
      name, email, message, 
      isPlatform, fullName, role, userClass, age, contactInfo, category,
      website, hp_check // Honeypot fields for bot traps
    } = body;

    // 2. Honeypot check: Bots usually fill hidden fields
    if (website || hp_check) {
      return NextResponse.json({ success: true });
    }

    // 3. Payload size and validation protection
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty.' }, { status: 400 });
    }
    if (message.length > 3000) {
      return NextResponse.json({ error: 'Message is too long (max 3,000 characters).' }, { status: 400 });
    }
    if (name && (typeof name !== 'string' || name.length > 100)) {
      return NextResponse.json({ error: 'Name exceeds maximum length of 100 characters.' }, { status: 400 });
    }
    if (fullName && (typeof fullName !== 'string' || fullName.length > 100)) {
      return NextResponse.json({ error: 'Full name exceeds maximum length of 100 characters.' }, { status: 400 });
    }
    if (email && (typeof email !== 'string' || email.length > 150)) {
      return NextResponse.json({ error: 'Email exceeds maximum length of 150 characters.' }, { status: 400 });
    }
    if (contactInfo && (typeof contactInfo !== 'string' || contactInfo.length > 150)) {
      return NextResponse.json({ error: 'Contact info exceeds maximum length of 150 characters.' }, { status: 400 });
    }
    if (category && (typeof category !== 'string' || category.length > 100)) {
      return NextResponse.json({ error: 'Category exceeds maximum length of 100 characters.' }, { status: 400 });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      console.error('❌ Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment');
      return NextResponse.json(
        { error: 'Telegram configuration missing on server.' },
        { status: 500 }
      );
    }

    // Escape HTML special characters to prevent Telegram API parsing crashes & injection
    const clean = (str = '') => 
      String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    let text = '';

    if (isPlatform) {
      const rawRole = role || 'student';
      const formattedRole = rawRole.charAt(0).toUpperCase() + rawRole.slice(1);

      text = `<b>🏢 New Platform Support Request</b>\n\n` +
             `<b>👤 Name:</b> ${clean(fullName || name || 'Anonymous')}\n` +
             `<b>🎭 Role:</b> ${clean(formattedRole)}\n` +
             (userClass ? `<b>🏫 Class:</b> ${clean(userClass)}\n` : '') +
             (age ? `<b>🎂 Age:</b> ${clean(age)}\n` : '') +
             (category ? `<b>🏷️ Category:</b> ${clean(category)}\n` : '') +
             (contactInfo ? `<b>📞 Contact:</b> ${clean(contactInfo)}\n` : '') +
             `\n<b>💬 Message:</b>\n${clean(message)}`;
    } else {
      text = `<b>📬 New Website Inquiry</b>\n\n` +
             `<b>👤 Name:</b> ${clean(name || 'Anonymous')}\n` +
             `<b>📧 Email:</b> ${clean(email || 'Not provided')}\n\n` +
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