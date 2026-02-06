import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { chatSessions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const trackId = req.nextUrl.searchParams.get("trackId");

  if (!trackId) {
    return NextResponse.json({ error: "trackId required" }, { status: 400 });
  }

  const sessions = await db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.trackId, trackId))
    .orderBy(desc(chatSessions.updatedAt));

  return NextResponse.json(sessions);
}
