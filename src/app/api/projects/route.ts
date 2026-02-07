import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateProjectSyllabus } from "@/lib/project-ai";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  const userProjects = db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .all();

  return NextResponse.json(userProjects);
}

export async function POST(req: NextRequest) {
  const { userId, name, description } = await req.json();

  if (!userId || !name || !description) {
    return NextResponse.json(
      { error: "userId, name, and description required" },
      { status: 400 }
    );
  }

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  db.insert(projects)
    .values({
      id,
      userId,
      name,
      description,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    })
    .run();

  // Fire-and-forget: generate syllabus in the background
  generateProjectSyllabus(id, name, description);

  return NextResponse.json({
    id,
    name,
    description,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  });
}
