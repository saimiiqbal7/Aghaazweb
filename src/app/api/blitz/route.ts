import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(req: NextRequest) {
  const { type, question, studentAnswer, correctAnswer, lessonContext } =
    await req.json();

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  let prompt = '';

  if (type === 'correct') {
    prompt = `You are Blitz, an encouraging AI tutor for Pakistani Matric/FSc students. The student just answered a quiz question correctly during a video lesson.

Question: "${question}"
Their answer: "${studentAnswer}" (correct!)

Respond with a SHORT (1-2 sentences max) celebration. Be warm, fun, and encouraging. Use simple English. You can use one emoji. Don't explain the answer — they already got it right. Examples of tone: "Nice one! 🎯", "You nailed it! That's exactly right.", "Boom! You really know your stuff."`;
  }

  if (type === 'wrong') {
    prompt = `You are Blitz, a patient and friendly AI tutor for Pakistani Matric/FSc students aged 14-18. The student just answered a quiz question WRONG during a video lesson.

Question: "${question}"
Student's answer: "${studentAnswer}" (wrong)
Correct answer: "${correctAnswer}"
Lesson context: ${lessonContext || 'General lesson'}

Explain WHY the correct answer is right in 3-4 sentences maximum. Use very simple English that a 9th/10th grader in Pakistan would understand. Be encouraging, not condescending. Start by acknowledging their attempt ("Good try!" or "Almost!"), then explain the concept clearly. End with something positive. Don't use complex jargon. You can use one emoji.`;
  }

  try {
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ message: response });
  } catch (error) {
    console.error('Blitz API error:', error);
    return NextResponse.json(
      {
        message:
          "Hmm, I had a little glitch. But no worries — the correct answer is: " +
          (correctAnswer || 'check the lesson again!'),
      },
      { status: 200 }
    );
  }
}
