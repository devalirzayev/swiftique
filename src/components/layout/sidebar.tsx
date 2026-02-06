"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRACKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

interface SidebarSection {
  id: string;
  title: string;
  articles: {
    slug: string;
    title: string;
    completed?: boolean;
  }[];
}

interface SidebarProps {
  sections?: SidebarSection[];
  currentTrackId?: string;
}

export function Sidebar({ sections, currentTrackId }: SidebarProps) {
  const pathname = usePathname();

  // Derive which section contains the current article so it stays open on navigation
  const currentSlug = pathname?.split("/").pop();
  const activeSectionId = sections?.find((s) =>
    s.articles.some((a) => a.slug === currentSlug)
  )?.id;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(activeSectionId ? [activeSectionId] : [])
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  // Keep the active section expanded when navigating to a different article
  useEffect(() => {
    if (activeSectionId) {
      setExpandedSections((prev) => {
        if (prev.has(activeSectionId)) return prev;
        const next = new Set(prev);
        next.add(activeSectionId);
        return next;
      });
    }
  }, [activeSectionId]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" />
          Swiftique
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Tracks
          </p>
          {TRACKS.map((track) => (
            <Link
              key={track.id}
              href={`/tracks/${track.id}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                currentTrackId === track.id
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: track.color }}
              />
              {track.title}
            </Link>
          ))}
        </div>

        {sections && sections.length > 0 && (
          <div className="mt-6 space-y-1">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Sections
            </p>
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <span className="truncate">{section.title}</span>
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                </button>
                {expandedSections.has(section.id) && (
                  <div className="ml-3 pl-3 border-l border-[var(--border)] space-y-0.5">
                    {section.articles.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/tracks/${currentTrackId}/${article.slug}`}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                          pathname?.includes(article.slug)
                            ? "text-[var(--accent)]"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        <span
                          className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                            article.completed
                              ? "bg-[var(--success)] border-[var(--success)]"
                              : "border-[var(--border)]"
                          )}
                        >
                          {article.completed && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{article.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[var(--card)] border border-[var(--border)] lg:hidden"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-[var(--card)] border-r border-[var(--border)] transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {nav}
      </aside>
    </>
  );
}
