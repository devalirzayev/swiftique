import { notFound } from "next/navigation";
import { TRACKS } from "@/lib/config";
import { getArticle, getTrackSections, getTrackArticles } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { getQuiz } from "@/lib/quiz";
import { getFlashcardSet } from "@/lib/flashcards";
import { Sidebar } from "@/components/layout/sidebar";
import { ContentLayout } from "@/components/layout/content-layout";
import { ArticleHeader } from "@/components/layout/header";
import { VideoResources } from "@/components/learning/video-resources";
import { ArticleFooter } from "@/components/learning/article-footer";
import { ArticleWithAI } from "@/components/learning/article-with-ai";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { eq } from "drizzle-orm";

interface Props {
  params: Promise<{ trackId: string; slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { trackId, slug } = await params;
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) notFound();

  const article = getArticle(trackId, slug);
  if (!article) notFound();

  // Fetch all progress for this track
  const allProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.trackId, trackId));
  const completedSlugs = new Set(
    allProgress.filter((p) => p.completed).map((p) => p.articleSlug),
  );

  const sections = getTrackSections(trackId);
  const sidebarSections = sections.map((s) => ({
    id: s.id,
    title: s.title,
    articles: s.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      completed: completedSlugs.has(a.slug),
    })),
  }));

  // Load quiz and flashcard data
  const quiz = getQuiz(trackId, slug);
  const flashcardSet = getFlashcardSet(trackId, slug);

  // Get all articles to find prev/next navigation
  const allArticles = getTrackArticles(trackId);
  const currentIndex = allArticles.findIndex((a) => a.slug === slug);
  const prevArticle =
    currentIndex > 0
      ? { slug: allArticles[currentIndex - 1].slug, title: allArticles[currentIndex - 1].title }
      : null;
  const nextArticle =
    currentIndex < allArticles.length - 1
      ? { slug: allArticles[currentIndex + 1].slug, title: allArticles[currentIndex + 1].title }
      : null;

  // Format flashcard cards with IDs
  const flashcardCards =
    flashcardSet?.cards.map((c, i) => ({ id: i, front: c.front, back: c.back })) ?? null;

  const content = await renderMDX(article.content);

  return (
    <>
      <Sidebar sections={sidebarSections} currentTrackId={trackId} />
      <ContentLayout>
        <ArticleHeader
          title={article.title}
          description={article.description}
          readingTime={article.readingTime}
          trackTitle={track.title}
          trackId={track.id}
          sectionTitle={article.sectionTitle}
        />

        <VideoResources resources={article.videoResources || []} />

        <ArticleWithAI
          articleTitle={article.title}
          articleContent={article.content}
          trackId={trackId}
          trackTitle={track.title}
        >
          <article className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[var(--accent)] prose-code:text-[var(--accent-foreground)] prose-pre:bg-transparent prose-pre:p-0">
            {content}
          </article>

          <ArticleFooter
            articleSlug={slug}
            trackId={trackId}
            sectionId={article.sectionId}
            initialCompleted={completedSlugs.has(slug)}
            quiz={quiz}
            flashcards={flashcardCards}
            nextArticle={nextArticle}
            prevArticle={prevArticle}
          />
        </ArticleWithAI>
      </ContentLayout>
    </>
  );
}
