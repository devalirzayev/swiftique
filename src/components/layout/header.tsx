import Link from "next/link";

interface HeaderProps {
  title: string;
  description: string;
  readingTime?: string;
  trackTitle?: string;
  trackId?: string;
  sectionTitle?: string;
}

export function ArticleHeader({
  title,
  description,
  readingTime,
  trackTitle,
  trackId,
  sectionTitle,
}: HeaderProps) {
  return (
    <header className="mb-10">
      {trackTitle && (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-3">
          <Link
            href={`/tracks/${trackId}`}
            className="hover:text-[var(--accent)] transition-colors"
          >
            {trackTitle}
          </Link>
          {sectionTitle && (
            <>
              <span>/</span>
              <span>{sectionTitle}</span>
            </>
          )}
        </div>
      )}
      <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
      <p className="text-[var(--muted-foreground)] text-lg">{description}</p>
      {readingTime && (
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {readingTime}
        </p>
      )}
    </header>
  );
}
