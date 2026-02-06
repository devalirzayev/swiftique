import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flashcards } from "@/db/schema";
import { eq, lte } from "drizzle-orm";
import {
  calculateNextReview,
  getNextReviewDate,
} from "@/lib/spaced-repetition";

export async function GET() {
  const now = new Date().toISOString();
  const due = await db
    .select()
    .from(flashcards)
    .where(lte(flashcards.nextReviewAt, now));

  return NextResponse.json(due);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cardId, quality } = body;

  const card = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.id, cardId));

  if (card.length === 0) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const { interval, easeFactor } = calculateNextReview(
    quality,
    card[0].interval ?? 1,
    card[0].easeFactor ?? 2.5
  );

  await db
    .update(flashcards)
    .set({
      interval,
      easeFactor,
      nextReviewAt: getNextReviewDate(interval),
      lastReviewedAt: new Date().toISOString(),
      reviewCount: (card[0].reviewCount ?? 0) + 1,
    })
    .where(eq(flashcards.id, cardId));

  return NextResponse.json({ success: true, nextInterval: interval });
}
