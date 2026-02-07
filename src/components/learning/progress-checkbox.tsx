"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface ProgressCheckboxProps {
  articleSlug: string;
  trackId: string;
  sectionId: string;
  initialCompleted?: boolean;
}

export function ProgressCheckbox({
  articleSlug,
  trackId,
  sectionId,
  initialCompleted = false,
}: ProgressCheckboxProps) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const newState = !completed;
    setCompleted(newState);

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleSlug,
        trackId,
        sectionId,
        completed: newState,
      }),
    });

    setLoading(false);
    // Notify sidebar to refresh completion checkmarks
    window.dispatchEvent(new Event("swiftique:progress-changed"));
    // Re-fetch server data so the sidebar updates immediately
    router.refresh();
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
        completed
          ? "bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      )}
    >
      <span
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
          completed
            ? "bg-[var(--success)] border-[var(--success)]"
            : "border-[var(--border)]"
        )}
      >
        {completed && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      {completed ? "Learned" : "Mark as learned"}
    </button>
  );
}
