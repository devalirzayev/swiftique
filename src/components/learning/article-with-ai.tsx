"use client";

import { useState, useEffect, useCallback } from "react";
import { TextHighlighter } from "./text-highlighter";
import { AIChat } from "./ai-chat";
import { MessageCircle } from "lucide-react";

interface ArticleWithAIProps {
  children: React.ReactNode;
  articleTitle: string;
  articleContent: string;
  trackId: string;
  trackTitle: string;
}

export function ArticleWithAI({
  children,
  articleTitle,
  articleContent,
  trackId,
  trackTitle,
}: ArticleWithAIProps) {
  const [chatOpen, setChatOpen] = useState(false);
  const [highlightedText, setHighlightedText] = useState<string | undefined>();

  const handleHighlight = (text: string) => {
    setHighlightedText(text);
    setChatOpen(true);
  };

  const handleOpenChat = useCallback(() => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 3) {
      setHighlightedText(selection);
    } else {
      setHighlightedText(undefined);
    }
    setChatOpen(true);
  }, []);

  // Cmd+L / Ctrl+L keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "l") {
        e.preventDefault();
        handleOpenChat();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleOpenChat]);

  return (
    <>
      <TextHighlighter onHighlight={handleHighlight}>
        {children}
      </TextHighlighter>

      {/* Floating AI chat button */}
      {!chatOpen && (
        <button
          onClick={() => {
            setHighlightedText(undefined);
            setChatOpen(true);
          }}
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-full bg-[var(--accent)] text-white shadow-lg hover:opacity-90 transition-opacity"
          title="Ask AI Tutor"
        >
          <MessageCircle className="w-5 h-5" />
        </button>
      )}

      {/* AI Chat panel */}
      {chatOpen && (
        <AIChat
          articleTitle={articleTitle}
          articleContent={articleContent}
          trackId={trackId}
          trackTitle={trackTitle}
          highlightedText={highlightedText}
          onClose={() => {
            setChatOpen(false);
            setHighlightedText(undefined);
          }}
        />
      )}
    </>
  );
}
