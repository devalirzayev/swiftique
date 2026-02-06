"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Plus, History, ChevronLeft, ChevronRight } from "lucide-react";

interface ChatSession {
  id: string;
  trackId: string;
  articleSlug: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

interface ChatHistorySidebarProps {
  trackId: string;
  activeSessionId: string;
  refreshKey: number;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
}

function timeAgo(dateStr: string) {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function ChatHistorySidebar({
  trackId,
  activeSessionId,
  refreshKey,
  onSelectSession,
  onNewChat,
}: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetch(`/api/chat/sessions?trackId=${encodeURIComponent(trackId)}`)
      .then((r) => r.json())
      .then(setSessions)
      .catch(() => {});
  }, [trackId, activeSessionId, refreshKey]);

  if (collapsed) {
    return (
      <div className="flex flex-col items-center py-3 px-1 border-r border-[var(--border)] bg-[var(--muted)]/30">
        <button
          onClick={() => setCollapsed(false)}
          className="p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors"
          title="Show history"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={onNewChat}
          className="mt-2 p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors"
          title="New chat"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-56 flex-shrink-0 flex flex-col border-r border-[var(--border)] bg-[var(--muted)]/30">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          <span className="text-xs font-medium text-[var(--muted-foreground)]">History</span>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onNewChat}
            className="p-1 rounded-md hover:bg-[var(--muted)] transition-colors"
            title="New chat"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCollapsed(true)}
            className="p-1 rounded-md hover:bg-[var(--muted)] transition-colors"
            title="Collapse"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto py-1">
        {sessions.length === 0 ? (
          <p className="text-xs text-[var(--muted-foreground)] p-3 text-center">
            No previous chats
          </p>
        ) : (
          sessions.map((s) => (
            <button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              className={cn(
                "w-full text-left px-3 py-2 text-xs hover:bg-[var(--muted)] transition-colors",
                s.id === activeSessionId && "bg-[var(--muted)]"
              )}
            >
              <p className="font-medium truncate">{s.title}</p>
              <p className="text-[var(--muted-foreground)] text-[10px] mt-0.5">
                {timeAgo(s.updatedAt)}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
