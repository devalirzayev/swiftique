"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, BookOpen, Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Hashimage } from "./hashimage";
import { NewProjectModal } from "./new-project-modal";
import { useUserId } from "@/components/providers/user-provider";
import { cn } from "@/lib/utils";

export interface Project {
  id: string;
  name: string;
  status: string;
  description: string;
  createdAt: string;
}

interface ProjectSelectorProps {
  currentProjectId: string | null;
  onSelectProject: (projectId: string | null) => void;
}

const PROJECTS_LIST_CACHE_KEY = "swiftique_projects_list";

function getCachedProjectsList(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(PROJECTS_LIST_CACHE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function ProjectSelector({
  currentProjectId,
  onSelectProject,
}: ProjectSelectorProps) {
  const userId = useUserId();
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [projectsList, setProjectsList] = useState<Project[]>(getCachedProjectsList);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/projects?userId=${userId}`)
      .then((r) => r.json())
      .then((list: Project[]) => {
        setProjectsList(list);
        try { sessionStorage.setItem(PROJECTS_LIST_CACHE_KEY, JSON.stringify(list)); } catch {}
      })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setDeleteConfirm(null);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const currentProject = projectsList.find((p) => p.id === currentProjectId);
  const displayName = currentProject?.name || "All Articles";

  async function handleDelete(projectId: string) {
    await fetch(`/api/projects/${projectId}`, { method: "DELETE" });
    setProjectsList((prev) => {
      const next = prev.filter((p) => p.id !== projectId);
      try { sessionStorage.setItem(PROJECTS_LIST_CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    setDeleteConfirm(null);
    if (currentProjectId === projectId) {
      onSelectProject(null);
    }
  }

  function handleCreated(project: Project) {
    setProjectsList((prev) => {
      const next = [...prev, project];
      try { sessionStorage.setItem(PROJECTS_LIST_CACHE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
    onSelectProject(project.id);
  }

  return (
    <>
      <div ref={dropdownRef} className="relative">
        {/* Trigger button */}
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer",
            open
              ? "bg-[var(--muted)] text-[var(--foreground)]"
              : "hover:bg-[var(--muted)] text-[var(--foreground)]"
          )}
        >
          {currentProjectId && currentProject ? (
            <Hashimage id={currentProjectId} size={22} />
          ) : (
            <BookOpen className="w-[22px] h-[22px] text-[var(--accent)] shrink-0" />
          )}
          <span className="truncate flex-1 text-left font-medium">{displayName}</span>
          <ChevronDown
            className={cn(
              "w-4 h-4 shrink-0 text-[var(--muted-foreground)] transition-transform duration-200",
              open && "rotate-180"
            )}
          />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-xl shadow-black/30 overflow-hidden">
            <div className="p-1.5 max-h-72 overflow-y-auto">
              {/* All Articles (default) */}
              <button
                onClick={() => { onSelectProject(null); setOpen(false); }}
                className={cn(
                  "flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg transition-colors cursor-pointer",
                  !currentProjectId
                    ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                    : "hover:bg-[var(--muted)]"
                )}
              >
                <BookOpen className="w-5 h-5 text-[var(--accent)] shrink-0" />
                <span className="truncate flex-1 text-left font-medium">All Articles</span>
              </button>

              {/* Divider if projects exist */}
              {projectsList.length > 0 && (
                <div className="my-1.5 mx-3 border-t border-[var(--border)]" />
              )}

              {/* User projects */}
              {projectsList.map((project) => (
                <div
                  key={project.id}
                  className={cn(
                    "group flex items-center gap-2 w-full px-3 py-2.5 text-sm rounded-lg transition-colors",
                    currentProjectId === project.id
                      ? "bg-[var(--accent)]/10 text-[var(--accent)]"
                      : "hover:bg-[var(--muted)]"
                  )}
                >
                  <button
                    onClick={() => { onSelectProject(project.id); setOpen(false); }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                  >
                    <Hashimage id={project.id} size={22} />
                    <span className="truncate flex-1 text-left">{project.name}</span>
                    {project.status === "pending" ? (
                      <Loader2 className="w-4 h-4 shrink-0 animate-spin text-[var(--accent)]" />
                    ) : project.status === "error" ? (
                      <AlertCircle className="w-4 h-4 shrink-0 text-[var(--error)]" />
                    ) : null}
                  </button>

                  {/* Delete */}
                  {deleteConfirm === project.id ? (
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => setDeleteConfirm(null)}
                        className="text-[var(--muted-foreground)] text-xs px-1.5 py-0.5 rounded hover:bg-[var(--muted)] cursor-pointer"
                      >
                        No
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="text-[var(--error)] text-xs font-medium px-1.5 py-0.5 rounded hover:bg-[var(--error)]/10 cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirm(project.id); }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-[var(--muted-foreground)] hover:text-[var(--error)] shrink-0 transition-opacity rounded hover:bg-[var(--muted)] cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* New project button */}
            <div className="p-1.5 border-t border-[var(--border)]">
              <button
                onClick={() => { setModalOpen(true); setOpen(false); }}
                className="flex items-center gap-2.5 w-full px-3 py-2.5 text-sm font-medium text-[var(--accent)] rounded-lg hover:bg-[var(--accent)]/10 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            </div>
          </div>
        )}
      </div>

      <NewProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </>
  );
}
