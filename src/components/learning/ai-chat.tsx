"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, UIMessage } from "ai";
import { cn } from "@/lib/utils";
import { X, Send, MessageCircle } from "lucide-react";
import { ChatMarkdown } from "@/components/ui/chat-markdown";
import { ChatHistorySidebar } from "./chat-history";

interface AIChatProps {
  articleTitle: string;
  articleContent: string;
  trackId: string;
  trackTitle: string;
  highlightedText?: string;
  onClose: () => void;
}

export function AIChat({
  articleTitle,
  articleContent,
  trackId,
  trackTitle,
  highlightedText,
  onClose,
}: AIChatProps) {
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState(() =>
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2) + Date.now().toString(36)
  );
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus input when chat opens
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const initialMessages = (highlightedText
    ? [
        {
          id: "highlight",
          role: "assistant",
          parts: [
            {
              type: "text",
              text: `I see you highlighted: *"${highlightedText}"*\n\nWhat would you like to know about this?`,
            },
          ],
        },
      ]
    : []) as UIMessage[];

  const { messages, setMessages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: {
        articleTitle,
        articleContent,
        trackId,
        trackTitle,
        highlightedText,
        sessionId,
      },
    }),
    messages: initialMessages,
    onFinish: () => {
      // Refresh chat history sidebar when AI response completes
      setHistoryRefreshKey((k) => k + 1);
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
    // Reset textarea height
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    // Auto-resize
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 150) + "px";
  };

  const handleNewChat = useCallback(() => {
    const newId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2) + Date.now().toString(36);
    setSessionId(newId);
    setMessages([]);
    setHistoryRefreshKey((k) => k + 1);
    // Focus input after state update
    setTimeout(() => inputRef.current?.focus(), 0);
  }, [setMessages]);

  const handleSelectSession = useCallback(
    async (selectedSessionId: string) => {
      try {
        const res = await fetch(`/api/chat/sessions/${selectedSessionId}`);
        const data = await res.json();
        const uiMessages: UIMessage[] = data.map(
          (m: { id: number; role: string; content: string }, i: number) => ({
            id: `loaded-${i}`,
            role: m.role as "user" | "assistant",
            parts: [{ type: "text", text: m.content }],
          }),
        );
        setSessionId(selectedSessionId);
        setMessages(uiMessages);
      } catch {
        // ignore
      }
    },
    [setMessages],
  );

  const getMessageText = (msg: (typeof messages)[0]) => {
    return (
      msg.parts
        ?.filter((p): p is { type: "text"; text: string } => p.type === "text")
        .map((p) => p.text)
        .join("\n") ?? ""
    );
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-[680px] bg-[var(--card)] border-l border-[var(--border)] flex z-50 shadow-2xl">
      {/* History sidebar */}
      <ChatHistorySidebar
        trackId={trackId}
        activeSessionId={sessionId}
        refreshKey={historyRefreshKey}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-medium text-sm">AI Tutor</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "text-sm",
                msg.role === "user" ? "ml-8" : "mr-8",
              )}
            >
              <div
                className={cn(
                  "rounded-lg px-4 py-3",
                  msg.role === "user"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)]",
                )}
              >
                {msg.role === "assistant" ? (
                  <ChatMarkdown content={getMessageText(msg)} />
                ) : (
                  <p className="whitespace-pre-wrap">{getMessageText(msg)}</p>
                )}
              </div>
            </div>
          ))}
          {isLoading &&
            messages[messages.length - 1]?.role !== "assistant" && (
              <div className="mr-8">
                <div className="rounded-lg px-4 py-3 bg-[var(--muted)]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce delay-100" />
                    <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form
          onSubmit={handleSubmit}
          className="p-4 border-t border-[var(--border)]"
        >
          <div className="flex gap-2 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this article..."
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors resize-none"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-2.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
