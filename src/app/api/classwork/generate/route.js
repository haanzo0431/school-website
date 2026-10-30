import { NextResponse } from 'next/server';
import { verifyCaller } from '@/lib/serverAuth';

const Q_COUNT = 30;

// HTML fayl ichidagi "var Q=[[savol,[variantlar],to'g'ri],...];" ni o'qiydi
function extractQuestionsFromHtml(html) {
  if (!html || typeof html !== 'string') return null;
  const m = html.match(/var\s+Q\s*=\s*(\[[\s\S]*?\])\s*;/);
  if (!m) return null;
  try {
    const arr = JSON.parse(m[1]);
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const qs = arr.map((x) => ({
      question: String(x[0] || ''),
      options: Array.isArray(x[1]) ? x[1].map(String) : [],
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

// Fallback topic/subject structured question generator
function generateSubjectQuestions(subject, topic, count = Q_COUNT) {
  const safeTopic = topic ? topic.trim() : `${subject} asosiy tushunchalari`;
  const safeSubject = subject || 'Umumiy';

  const questions = [];
  for (let i = 1; i <= count; i++) {
    const correctIdx = (i - 1) % 4;
    const options = [
      `${safeTopic} bo'yicha 1-asosiy tahliliy xulosa`,
      `${safeTopic} nazariyasiga ko'ra 2-qoida`,
      `${safeTopic} qo'llanilishiga oid 3-amaliy natija`,
      `${safeTopic} mavzusidagi 4-muhim ta'rif`,
    ];
    // Rotate to make correctIdx accurate
    const correctText = `${safeTopic}: ${i}-savol uchun to'g'ri ilmiy ta'rif va asos`;
    options[correctIdx] = correctText;

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
    // 1. Authorize: Only teachers and admins can generate classwork
    const authCheck = await verifyCaller(req, 'teacher');
    if (authCheck.error) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const body = await req.json();
    const { subject, topic, lessonHtml } = body;

    if (!subject && !topic && !lessonHtml) {
      return NextResponse.json(
        { error: 'Fan, mavzu yoki dars HTML fayli kiritilishi shart.' },
        { status: 400 }
      );
    }

    // 2. If lesson HTML is provided, extract embedded questions
    let questions = extractQuestionsFromHtml(lessonHtml);

    // 3. If no HTML questions, generate from subject & topic
    if (!questions || questions.length < Q_COUNT) {
      const generated = generateSubjectQuestions(subject, topic, Q_COUNT);
      // If some questions were parsed from HTML, combine or fill up to Q_COUNT
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
    console.error('Classwork generate error:', error);
    return NextResponse.json(
      { error: error.message || 'Savollarni yaratishda xatolik yuz berdi.' },
      { status: 500 }
    );
  }
}