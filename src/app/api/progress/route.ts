import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(progress);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { articleSlug, trackId, sectionId, completed } = body;

  const existing = await db
    .select()
    .from(progress)
    .where(eq(progress.articleSlug, articleSlug));

  if (existing.length > 0) {
    await db
      .update(progress)
      .set({
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      })
      .where(eq(progress.articleSlug, articleSlug));
  } else {
    await db.insert(progress).values({
      articleSlug,
      trackId,
      sectionId,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });
  }

  return NextResponse.json({ success: true });
}
