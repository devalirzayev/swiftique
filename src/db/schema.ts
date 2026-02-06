import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const progress = sqliteTable("progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleSlug: text("article_slug").notNull().unique(),
  trackId: text("track_id").notNull(),
  sectionId: text("section_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const quizResults = sqliteTable("quiz_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleSlug: text("article_slug").notNull(),
  score: real("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  attemptedAt: text("attempted_at").default("CURRENT_TIMESTAMP"),
});

export const flashcards = sqliteTable("flashcards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleSlug: text("article_slug").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  interval: integer("interval").default(1),
  easeFactor: real("ease_factor").default(2.5),
  nextReviewAt: text("next_review_at"),
  lastReviewedAt: text("last_reviewed_at"),
  reviewCount: integer("review_count").default(0),
});

export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey(),
  trackId: text("track_id").notNull(),
  articleSlug: text("article_slug").notNull(),
  title: text("title").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
  updatedAt: text("updated_at").default("CURRENT_TIMESTAMP"),
});

export const chatHistory = sqliteTable("chat_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  sessionId: text("session_id").notNull(),
  articleSlug: text("article_slug").notNull(),
  highlightedText: text("highlighted_text"),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
