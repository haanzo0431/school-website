import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

const Q_COUNT = 30;
const MAX_HTML_SIZE = 2 * 1024 * 1024; // 2 MB ceiling

function extractQuestionsFromHtml(html) {
  if (!html || typeof html !== 'string' || html.length > MAX_HTML_SIZE) return null;
  const m = html.match(/var\s+Q\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[1]);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const qs = arr.map((x) => ({
      question: String(x[0] || '').slice(0, 500),
      options: Array.isArray(x[1]) ? x[1].slice(0, 4).map((opt) => String(opt || '').slice(0, 300)) : [],
      correct: Number.isInteger(x[2]) ? x[2] : 0,
    }));
    const valid = qs.every(
      (q) => q.question.trim() && q.options.length === 4 && q.correct >= 0 && q.correct <= 3
    );
    return valid ? qs : null;
  } catch {
    return null;
  }
}

function generateSubjectQuestions(subject, topic, count = Q_COUNT) {
  const safeTopic = topic ? topic.trim().slice(0, 150) : `${subject} asosiy tushunchalari`;
  const safeSubject = subject ? subject.slice(0, 80) : 'Umumiy';

  const questions = [];
  for (let i = 1; i <= count; i++) {
    const correctIdx = (i - 1) % 4;
    const options = [
      `${safeTopic} bo'yicha 1-asosiy tahliliy xulosa`,
      `${safeTopic} nazariyasiga ko'ra 2-qoida`,
      `${safeTopic} qo'llanilishiga oid 3-amaliy natija`,
      `${safeTopic} mavzusidagi 4-muhim ta'rif`,
    ];
    options[correctIdx] = `${safeTopic}: ${i}-savol uchun to'g'ri ilmiy ta'rif va asos`;

    questions.push({
      question: `${safeSubject} - ${safeTopic}: ${i}-savol. Ushbu mavzuning mohiyatini belgilovchi to'g'ri bandni aniqlang:`,
      options,
      correct: correctIdx,
    });
  }
  return questions;
}

export async function POST(req) {
  try {
    const authCheck = await verifyCaller(req, ['teacher', 'admin']);
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'Invalid JSON request payload.' }, { status: 400 });
    }

    const { subject, topic, lessonHtml } = body;

    if (!subject && !topic && !lessonHtml) {
      return NextResponse.json(
        { error: 'Fan, mavzu yoki dars HTML fayli kiritilishi shart.' },
        { status: 400 }
      );
    }

    const cleanSubject = typeof subject === 'string' ? subject.trim().slice(0, 100) : '';
    const cleanTopic = typeof topic === 'string' ? topic.trim().slice(0, 200) : '';

    let questions = extractQuestionsFromHtml(lessonHtml);

    if (!questions || questions.length < Q_COUNT) {
      const generated = generateSubjectQuestions(cleanSubject, cleanTopic, Q_COUNT);
      if (questions && questions.length > 0) {
        questions = [...questions, ...generated.slice(questions.length, Q_COUNT)];
      } else {
        questions = generated;
      }
    }

    return NextResponse.json({
      success: true,
      count: questions.length,
      questions,
    });
  } catch (error) {
    console.error('[classwork-generate] Error:', error);
    return NextResponse.json(
      { error: 'Savollarni yaratishda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}
