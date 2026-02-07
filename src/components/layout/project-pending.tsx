"use client";

import { Sparkles } from "lucide-react";

export function ProjectPending() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="relative mb-8">
        {/* Pulsing ring */}
        <div className="absolute inset-0 rounded-full bg-[var(--accent)]/20 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative flex items-center justify-center w-16 h-16 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/20">
          <Sparkles className="w-7 h-7 text-[var(--accent)]" />
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-3">Your project was created!</h2>
      <p className="text-[var(--muted-foreground)] max-w-md leading-relaxed">
        We&apos;re building your personalized learning path. This usually takes about a minute.
      </p>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"
            style={{ animationDelay: `${i * 0.3}s` }}
          />
        ))}
      </div>
    </div>
  );
}
