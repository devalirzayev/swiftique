"use client";

import { useState } from "react";
import { Quiz } from "./quiz";
import { FlashcardDeck } from "./flashcard-deck";
import { ProgressCheckbox } from "./progress-checkbox";
import { Recommendations } from "./recommendations";
import type { QuizQuestion } from "@/lib/quiz";

interface ArticleFooterProps {
  articleSlug: string;
  trackId: string;
  sectionId: string;
  initialCompleted?: boolean;
  quiz: { questions: QuizQuestion[] } | null;
  flashcards: { id: number; front: string; back: string }[] | null;
  nextArticle: { slug: string; title: string } | null;
  prevArticle: { slug: string; title: string } | null;
}

export function ArticleFooter({
  articleSlug,
  trackId,
  sectionId,
  initialCompleted,
  quiz,
  flashcards,
  nextArticle,
  prevArticle,
}: ArticleFooterProps) {
  const [activeTab, setActiveTab] = useState<"quiz" | "flashcards" | null>(null);

  return (
    <footer className="mt-16 space-y-8 border-t border-[var(--border)] pt-8">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <ProgressCheckbox
          articleSlug={articleSlug}
          trackId={trackId}
          sectionId={sectionId}
          initialCompleted={initialCompleted}
        />
      </div>

      {/* Quiz & Flashcard tabs */}
      {(quiz || flashcards) && (
        <div>
          <div className="flex gap-2 mb-4">
            {quiz && (
              <button
                onClick={() => setActiveTab(activeTab === "quiz" ? null : "quiz")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "quiz"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Take Quiz ({quiz.questions.length} questions)
              </button>
            )}
            {flashcards && (
              <button
                onClick={() => setActiveTab(activeTab === "flashcards" ? null : "flashcards")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "flashcards"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Flashcards ({flashcards.length} cards)
              </button>
            )}
          </div>

          {activeTab === "quiz" && quiz && (
            <Quiz questions={quiz.questions} articleSlug={articleSlug} />
          )}
          {activeTab === "flashcards" && flashcards && (
            <FlashcardDeck cards={flashcards} articleSlug={articleSlug} />
          )}
        </div>
      )}

      {/* Recommendations */}
      <Recommendations />

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-[var(--border)]">
        {prevArticle ? (
          <a
            href={`/tracks/${trackId}/${prevArticle.slug}`}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
          >
            &larr; {prevArticle.title}
          </a>
        ) : (
          <span />
        )}
        {nextArticle ? (
          <a
            href={`/tracks/${trackId}/${nextArticle.slug}`}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            {nextArticle.title} &rarr;
          </a>
        ) : (
          <span />
        )}
      </div>
    </footer>
  );
}
