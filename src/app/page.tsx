import Link from "next/link";
import { TRACKS } from "@/lib/config";
import { Sidebar } from "@/components/layout/sidebar";
import { ContentLayout } from "@/components/layout/content-layout";

export default function Home() {
  return (
    <>
      <Sidebar />
      <ContentLayout>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Learn iOS Development
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] mb-10">
          A structured, AI-powered learning path from Swift fundamentals to App
          Store deployment.
        </p>

        <div className="grid gap-4">
          {TRACKS.map((track, i) => (
            <Link
              key={track.id}
              href={`/tracks/${track.id}`}
              className="group flex items-start gap-4 p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
            >
              <span
                className="mt-1 flex items-center justify-center w-8 h-8 rounded-md text-sm font-semibold text-white shrink-0"
                style={{ backgroundColor: track.color }}
              >
                {i + 1}
              </span>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-[var(--accent)] transition-colors">
                  {track.title}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {track.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </ContentLayout>
    </>
  );
}
