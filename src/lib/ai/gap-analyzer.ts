import { aiGenerate } from "@/lib/ai/providers";
import { gapAnalysisPrompt } from "@/lib/ai/prompts";
import { db } from "@/db";
import { quizResults, progress } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface GapAnalysisResult {
  weakTopics: string[];
  recommendations: {
    topic: string;
    reason: string;
    suggestedResources: string[];
  }[];
  supplementaryArticleSuggestions: {
    title: string;
    focus: string;
    difficulty: string;
  }[];
}

export async function analyzeGaps(): Promise<GapAnalysisResult> {
  const allQuizResults = await db.select().from(quizResults);
  const completedProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.completed, true));

  if (allQuizResults.length === 0) {
    return {
      weakTopics: [],
      recommendations: [],
      supplementaryArticleSuggestions: [],
    };
  }

  const quizData = allQuizResults.map((r) => ({
    topic: r.articleSlug,
    score: r.score,
  }));

  const completedArticles = completedProgress.map((p) => p.articleSlug);

  const prompt = gapAnalysisPrompt(quizData, completedArticles);
  const result = await aiGenerate("gap-analysis", prompt);

  try {
    return JSON.parse(result);
  } catch {
    return {
      weakTopics: [],
      recommendations: [],
      supplementaryArticleSuggestions: [],
    };
  }
}
