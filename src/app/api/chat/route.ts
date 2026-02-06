import { NextRequest } from "next/server";
import { convertToModelMessages, UIMessage } from "ai";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { aiStream } from "@/lib/ai/providers";
import { tutorSystemPrompt } from "@/lib/ai/prompts";
import { tutorTools } from "@/lib/ai/tools";
import { db } from "@/db";
import { progress, quizResults, chatHistory, chatSessions } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    messages,
    articleTitle,
    articleContent,
    highlightedText,
    trackId,
    trackTitle,
    sessionId,
  } = body;

  // Gather learner context
  const completedProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.completed, true));

  const completedArticles = completedProgress.map((p) => p.articleSlug);

  const allQuizResults = await db.select().from(quizResults);
  const weakTopics = allQuizResults
    .filter((r) => r.score < 0.7)
    .map((r) => r.articleSlug);

  const systemMessage = tutorSystemPrompt({
    articleTitle,
    articleContent,
    completedArticles,
    weakTopics,
    currentTrack: trackTitle,
    currentTrackId: trackId,
  });

  // Convert UIMessages to model messages
  const modelMessages: ModelMessage[] = await convertToModelMessages(
    messages as UIMessage[]
  );

  // If there's highlighted text, prepend it to the last user message
  if (highlightedText && modelMessages.length > 0) {
    const lastMsg = modelMessages[modelMessages.length - 1];
    if (lastMsg.role === "user") {
      const parts = lastMsg.content;
      if (typeof parts === "string") {
        lastMsg.content = `[Highlighted text from article: "${highlightedText}"]\n\n${parts}`;
      } else if (Array.isArray(parts)) {
        lastMsg.content = [
          { type: "text" as const, text: `[Highlighted text from article: "${highlightedText}"]` },
          ...parts,
        ];
      }
    }
  }

  // Save user message and upsert session before streaming
  const lastMsg = messages[messages.length - 1];
  if (lastMsg && sessionId) {
    const textContent =
      lastMsg.content ||
      (lastMsg.parts
        ?.filter((p: { type: string }) => p.type === "text")
        .map((p: { text: string }) => p.text)
        .join("\n") ??
        "");

    if (textContent) {
      const now = new Date().toISOString();
      const title = textContent.slice(0, 80);

      // Upsert session
      db.insert(chatSessions)
        .values({
          id: sessionId,
          trackId: trackId || "",
          articleSlug: articleTitle || "",
          title,
          createdAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: chatSessions.id,
          set: { updatedAt: now },
        })
        .catch(() => {});

      // Save user message
      db.insert(chatHistory)
        .values({
          sessionId,
          articleSlug: articleTitle,
          highlightedText: highlightedText || null,
          role: lastMsg.role || "user",
          content: textContent,
        })
        .catch(() => {});
    }
  }

  const result = aiStream("tutor", {
    system: systemMessage,
    messages: modelMessages,
    tools: tutorTools,
  });

  // Save AI response after streaming completes
  Promise.resolve(result.text).then((responseText) => {
    if (sessionId && responseText) {
      db.insert(chatHistory)
        .values({
          sessionId,
          articleSlug: articleTitle,
          highlightedText: null,
          role: "assistant",
          content: responseText,
        })
        .catch(() => {});

      db.update(chatSessions)
        .set({ updatedAt: new Date().toISOString() })
        .where(eq(chatSessions.id, sessionId))
        .catch(() => {});
    }
  }).catch(() => {});

  return result.toUIMessageStreamResponse();
}
