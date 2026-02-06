import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatHistory } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const { sessionId } = await params;

  const messages = await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.sessionId, sessionId))
    .orderBy(asc(chatHistory.createdAt));

  return NextResponse.json(messages);
}
