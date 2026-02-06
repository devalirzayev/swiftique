"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/quiz";

interface QuizProps {
  questions: QuizQuestion[];
  articleSlug: string;
}

export function Quiz({ questions, articleSlug }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );

  const current = questions[currentIndex];

  const handleSelect = (optionIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);

    if (optionIndex === current.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
      // Save results
      fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleSlug,
          score: score / questions.length,
          totalQuestions: questions.length,
          correctAnswers: score + (selectedAnswer === current.correctAnswer ? 1 : 0),
        }),
      });
    }
  };

  if (finished) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Quiz Complete</h3>
        <p className="text-4xl font-bold mb-2" style={{
          color: percentage >= 80 ? "var(--success)" : percentage >= 60 ? "var(--warning)" : "var(--error)",
        }}>
          {percentage}%
        </p>
        <p className="text-[var(--muted-foreground)]">
          {finalScore} out of {questions.length} correct
        </p>
        {percentage < 80 && (
          <p className="mt-4 text-sm text-[var(--warning)]">
            Consider reviewing this article before moving on.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[var(--muted-foreground)]">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-medium">{score} correct</span>
      </div>

      <h3 className="text-lg font-medium mb-4">{current.question}</h3>

      <div className="space-y-2 mb-4">
        {current.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={showExplanation}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors",
              showExplanation && i === current.correctAnswer
                ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                : showExplanation && i === selectedAnswer && i !== current.correctAnswer
                  ? "border-[var(--error)] bg-[var(--error)]/10 text-[var(--error)]"
                  : selectedAnswer === i
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:border-[var(--accent)]"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className="mb-4 p-4 rounded-lg bg-[var(--muted)] text-sm">
          <p className="font-medium mb-1">
            {selectedAnswer === current.correctAnswer ? "Correct!" : "Incorrect"}
          </p>
          <p className="text-[var(--muted-foreground)]">{current.explanation}</p>
        </div>
      )}

      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </button>
      )}
    </div>
  );
}
