"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { TRACKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Menu,
  X,
} from "lucide-react";
import { ProjectSelector, type Project } from "./project-selector";

interface SidebarSection {
  id: string;
  title: string;
  articles: {
    slug: string;
    title: string;
    trackId?: string;
    completed?: boolean;
  }[];
}

interface SidebarProps {
  sections?: SidebarSection[];
  currentTrackId?: string;
}

const PROJECT_KEY = "swiftique_current_project";
const PROJECT_CACHE_KEY = "swiftique_project_detail";

interface ProjectArticle {
  trackId: string;
  articleSlug: string;
  articleTitle: string;
  sectionTitle: string;
  sectionOrder: number;
  articleOrder: number;
}

interface ProjectDetail extends Project {
  articles: ProjectArticle[];
}

function getCachedProject(projectId: string | null): ProjectDetail | null {
  if (!projectId || typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PROJECT_CACHE_KEY);
    if (!raw) return null;
    const cached: ProjectDetail = JSON.parse(raw);
    return cached.id === projectId ? cached : null;
  } catch {
    return null;
  }
}

export function Sidebar({ sections, currentTrackId }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Project state — initialized as null to match server render, then hydrated from storage
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const [completedSlugs, setCompletedSlugs] = useState<Set<string>>(new Set());

  // Hydrate project state from localStorage/sessionStorage after mount
  useEffect(() => {
    const pid = localStorage.getItem(PROJECT_KEY);
    if (pid) {
      setCurrentProjectId(pid);
      const cached = getCachedProject(pid);
      if (cached) setProjectDetail(cached);
    }
  }, []);

  // Fetch all completed article slugs (used for project mode progress)
  const fetchProgress = useCallback(async () => {
    try {
      const res = await fetch("/api/progress");
      if (!res.ok) return;
      const data: { articleSlug: string; completed: boolean }[] = await res.json();
      const completed = new Set(data.filter((p) => p.completed).map((p) => p.articleSlug));
      setCompletedSlugs(completed);
      return completed;
    } catch {
      return new Set<string>();
    }
  }, []);

  // Fetch progress on mount and when pathname changes (article marked as learned)
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress, pathname]);

  // Listen for progress changes triggered by ProgressCheckbox
  useEffect(() => {
    const handler = () => fetchProgress();
    window.addEventListener("swiftique:progress-changed", handler);
    return () => window.removeEventListener("swiftique:progress-changed", handler);
  }, [fetchProgress]);

  // Fetch project detail when a project is selected
  const fetchProject = useCallback(async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      if (!res.ok) {
        setCurrentProjectId(null);
        localStorage.removeItem(PROJECT_KEY);
        sessionStorage.removeItem(PROJECT_CACHE_KEY);
        return null;
      }
      const data: ProjectDetail = await res.json();
      setProjectDetail(data);
      // Cache in sessionStorage so remounts don't flicker
      try { sessionStorage.setItem(PROJECT_CACHE_KEY, JSON.stringify(data)); } catch {}
      return data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!currentProjectId) {
      setProjectDetail(null);
      sessionStorage.removeItem(PROJECT_CACHE_KEY);
      return;
    }
    // Always fetch fresh data in background, but cached data is already in state
    fetchProject(currentProjectId);
  }, [currentProjectId, fetchProject]);

  // Poll while pending
  useEffect(() => {
    if (!currentProjectId || !projectDetail || projectDetail.status !== "pending") return;

    const interval = setInterval(async () => {
      const data = await fetchProject(currentProjectId);
      if (data && data.status !== "pending") {
        clearInterval(interval);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [currentProjectId, projectDetail, fetchProject]);

  async function handleSelectProject(projectId: string | null) {
    setCurrentProjectId(projectId);
    if (projectId) {
      localStorage.setItem(PROJECT_KEY, projectId);
      // Navigate to first article of the selected project
      const cached = getCachedProject(projectId);
      const detail = cached || (await fetchProject(projectId));
      if (detail && detail.status === "ready" && detail.articles?.length > 0) {
        const sorted = [...detail.articles].sort(
          (a, b) => a.sectionOrder - b.sectionOrder || a.articleOrder - b.articleOrder
        );
        const first = sorted[0];
        router.push(`/tracks/${first.trackId}/${first.articleSlug}`);
      }
    } else {
      localStorage.removeItem(PROJECT_KEY);
      sessionStorage.removeItem(PROJECT_CACHE_KEY);
    }
  }

  // Build project sections from project articles (with completion status)
  const projectSections: SidebarSection[] = (() => {
    if (!projectDetail || projectDetail.status !== "ready" || !projectDetail.articles) return [];

    const sectionMap = new Map<string, SidebarSection>();
    const sortedArticles = [...projectDetail.articles].sort(
      (a, b) => a.sectionOrder - b.sectionOrder || a.articleOrder - b.articleOrder
    );

    for (const article of sortedArticles) {
      const key = `${article.sectionOrder}-${article.sectionTitle}`;
      if (!sectionMap.has(key)) {
        sectionMap.set(key, {
          id: key,
          title: article.sectionTitle,
          articles: [],
        });
      }
      sectionMap.get(key)!.articles.push({
        slug: article.articleSlug,
        title: article.articleTitle || article.articleSlug,
        trackId: article.trackId,
        completed: completedSlugs.has(article.articleSlug),
      });
    }

    return Array.from(sectionMap.values());
  })();

  // Determine which sections to show
  // Bug 3 fix: while project is loading (currentProjectId set but projectDetail still null),
  // don't fall through to default mode. Show loading state instead.
  const isProjectLoading = currentProjectId !== null && projectDetail === null;
  const isProjectMode = currentProjectId !== null && projectDetail !== null;
  const displaySections = isProjectMode && projectDetail.status === "ready" ? projectSections : sections;
  const isPending = isProjectMode && projectDetail.status === "pending";

  // Derive which section contains the current article
  const currentSlug = pathname?.split("/").pop();
  const activeSectionId = displaySections?.find((s) =>
    s.articles.some((a) => a.slug === currentSlug)
  )?.id;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    () => new Set(activeSectionId ? [activeSectionId] : [])
  );
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Shared article renderer for both default and project mode
  const renderSections = (sectionsList: SidebarSection[], mode: "default" | "project") => (
    <div className={mode === "default" ? "mt-6 space-y-1" : "space-y-1"}>
      <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
        {mode === "project" ? "Learning Path" : "Sections"}
      </p>
      {sectionsList.map((section) => (
        <div key={section.id}>
          <button
            onClick={() => toggleSection(section.id)}
            className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
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
              {section.articles.map((article) => {
                const trackId = article.trackId || currentTrackId;
                return (
                  <Link
                    key={article.slug}
                    href={`/tracks/${trackId}/${article.slug}`}
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
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Skeleton used for both pending and loading states
  const skeletonLoader = (
    <div className="space-y-4 pt-1">
      <div className="px-3 py-2">
        <div className="h-3 bg-[var(--muted)] rounded w-20 mb-4 animate-pulse" />
      </div>
      {[...Array(4)].map((_, i) => (
        <div key={i} className="space-y-2 animate-pulse" style={{ animationDelay: `${i * 0.15}s` }}>
          <div className="h-4 bg-[var(--muted)] rounded-md mx-3 w-3/4" />
          <div className="ml-6 space-y-1.5">
            <div className="h-3.5 bg-[var(--muted)]/60 rounded-md w-full" />
            <div className="h-3.5 bg-[var(--muted)]/60 rounded-md w-5/6" />
            <div className="h-3.5 bg-[var(--muted)]/60 rounded-md w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" />
          Swiftique
        </Link>
      </div>

      {/* Project Selector — z-10 so dropdown renders above scrollable content */}
      <div className="relative z-10 px-2 pt-2.5 pb-2 border-b border-[var(--border)]">
        <ProjectSelector
          currentProjectId={currentProjectId}
          onSelectProject={handleSelectProject}
        />
      </div>

      {/* Scrollable content — z-0 so it stays behind the dropdown */}
      <div className="relative z-0 flex-1 overflow-y-auto p-3">
        {isProjectLoading || isPending ? (
          skeletonLoader
        ) : !isProjectMode ? (
          /* Default: show tracks + sections */
          <>
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

            {sections && sections.length > 0 && renderSections(sections, "default")}
          </>
        ) : (
          /* Project mode: show curated sections with completion checkmarks */
          renderSections(projectSections, "project")
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
