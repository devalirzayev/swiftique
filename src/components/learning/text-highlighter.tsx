"use client";

import { useState, useCallback, useEffect } from "react";

interface TextHighlighterProps {
  children: React.ReactNode;
  onHighlight: (text: string) => void;
}

export function TextHighlighter({ children, onHighlight }: TextHighlighterProps) {
  const [showButton, setShowButton] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0, above: true });
  const [selectedText, setSelectedText] = useState("");
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 3) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();

      // Position above selection by default; if too close to top, position below
      const above = rect.top > 50;
      setButtonPos({
        x: rect.left + rect.width / 2,
        y: above ? rect.top - 8 : rect.bottom + 8,
        above,
      });
      setSelectedText(text);
      setShowButton(true);
    } else {
      setShowButton(false);
      setSelectedText("");
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-highlight-btn]")) {
        setShowButton(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Hide tooltip on scroll to prevent stale positions
  useEffect(() => {
    if (!showButton) return;
    const handleScroll = () => setShowButton(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [showButton]);

  return (
    <div onMouseUp={handleMouseUp} className="relative">
      {children}
      {showButton && (
        <button
          data-highlight-btn
          onClick={() => {
            onHighlight(selectedText);
            setShowButton(false);
          }}
          className={`fixed z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium shadow-lg hover:opacity-90 transition-opacity -translate-x-1/2 ${buttonPos.above ? "-translate-y-full" : ""}`}
          style={{
            left: buttonPos.x,
            top: buttonPos.y,
          }}
        >
          Ask AI about this
          <kbd className="px-1 py-0.5 rounded bg-white/20 text-[10px] font-mono">
            {isMac ? "⌘" : "Ctrl+"}L
          </kbd>
        </button>
      )}
    </div>
  );
}
