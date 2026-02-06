CREATE TABLE `chat_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_slug` text NOT NULL,
	`highlighted_text` text,
	`role` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE TABLE `flashcards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_slug` text NOT NULL,
	`front` text NOT NULL,
	`back` text NOT NULL,
	`interval` integer DEFAULT 1,
	`ease_factor` real DEFAULT 2.5,
	`next_review_at` text,
	`last_reviewed_at` text,
	`review_count` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `progress` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_slug` text NOT NULL,
	`track_id` text NOT NULL,
	`section_id` text NOT NULL,
	`completed` integer DEFAULT false,
	`completed_at` text,
	`created_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
--> statement-breakpoint
CREATE UNIQUE INDEX `progress_article_slug_unique` ON `progress` (`article_slug`);--> statement-breakpoint
CREATE TABLE `quiz_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`article_slug` text NOT NULL,
	`score` real NOT NULL,
	`total_questions` integer NOT NULL,
	`correct_answers` integer NOT NULL,
	`attempted_at` text DEFAULT 'CURRENT_TIMESTAMP'
);
