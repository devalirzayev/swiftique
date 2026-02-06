"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Card {
  id: number;
  front: string;
  back: string;
}

interface FlashcardDeckProps {
  cards: Card[];
  articleSlug: string;
  onComplete?: (results: { cardId: number; quality: number }[]) => void;
}

export function FlashcardDeck({ cards, articleSlug, onComplete }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ cardId: number; quality: number }[]>([]);

  const current = cards[currentIndex];
  const isLast = currentIndex === cards.length - 1;

  const handleRate = async (quality: number) => {
    const newResults = [...results, { cardId: current.id, quality }];
    setResults(newResults);

    await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: current.id,
        quality,
        articleSlug,
      }),
    });

    if (isLast) {
      onComplete?.(newResults);
    } else {
      setFlipped(false);
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    }
  };

  if (currentIndex >= cards.length) {
    return (
      <div className="text-center p-6">
        <p className="text-lg font-medium">Review complete!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
        <span>Card {currentIndex + 1} of {cards.length}</span>
      </div>

      <div
        onClick={() => !flipped && setFlipped(true)}
        className={cn(
          "min-h-[200px] p-6 rounded-lg border bg-[var(--card)] flex items-center justify-center text-center cursor-pointer transition-colors",
          flipped ? "border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? "back" : "front"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {flipped ? (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Answer</p>
                <p className="text-[var(--foreground)]">{current.back}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Click to reveal</p>
                <p className="text-lg font-medium">{current.front}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {flipped && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRate(1)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30 hover:bg-[var(--error)]/20 transition-colors"
          >
            Forgot
          </button>
          <button
            onClick={() => handleRate(3)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30 hover:bg-[var(--warning)]/20 transition-colors"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate(4)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-colors"
          >
            Good
          </button>
          <button
            onClick={() => handleRate(5)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30 hover:bg-[var(--success)]/20 transition-colors"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
