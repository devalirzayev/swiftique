import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizResults } from "@/db/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { articleSlug, score, totalQuestions, correctAnswers } = body;

  await db.insert(quizResults).values({
    articleSlug,
    score,
    totalQuestions,
    correctAnswers,
  });

  return NextResponse.json({ success: true });
}
