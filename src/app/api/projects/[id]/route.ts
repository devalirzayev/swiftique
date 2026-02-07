import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { projects, projectArticles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getArticle } from "@/lib/content";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = db.select().from(projects).where(eq(projects.id, id)).get();
  if (!project) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const articles = db
    .select()
    .from(projectArticles)
    .where(eq(projectArticles.projectId, id))
    .all();

  // Enrich with real article titles
  const enrichedArticles = articles.map((a) => {
    const article = getArticle(a.trackId, a.articleSlug);
    return {
      ...a,
      articleTitle: article?.title || a.articleSlug,
    };
  });

  return NextResponse.json({ ...project, articles: enrichedArticles });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  db.delete(projectArticles).where(eq(projectArticles.projectId, id)).run();
  db.delete(projects).where(eq(projects.id, id)).run();

  return NextResponse.json({ success: true });
}
