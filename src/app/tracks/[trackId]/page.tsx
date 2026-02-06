import { notFound } from "next/navigation";
import { TRACKS } from "@/lib/config";
import { getTrackSections } from "@/lib/content";
import { Sidebar } from "@/components/layout/sidebar";
import { ContentLayout } from "@/components/layout/content-layout";
import Link from "next/link";

interface Props {
  params: Promise<{ trackId: string }>;
}

export default async function TrackPage({ params }: Props) {
  const { trackId } = await params;
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) notFound();

  const sections = getTrackSections(trackId);
  const sidebarSections = sections.map((s) => ({
    id: s.id,
    title: s.title,
    articles: s.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      completed: false,
    })),
  }));

  return (
    <>
      <Sidebar sections={sidebarSections} currentTrackId={trackId} />
      <ContentLayout>
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg text-white text-xl font-bold mb-4"
            style={{ backgroundColor: track.color }}
          >
            {TRACKS.indexOf(track) + 1}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{track.title}</h1>
          <p className="text-lg text-[var(--muted-foreground)] mt-2">
            {track.description}
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <div className="space-y-2">
                {section.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/tracks/${trackId}/${article.slug}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded border border-[var(--border)]" />
                      <span className="group-hover:text-[var(--accent)] transition-colors">
                        {article.title}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {article.readingTime}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ContentLayout>
    </>
  );
}
