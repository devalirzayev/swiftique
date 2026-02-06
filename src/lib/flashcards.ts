import fs from "fs";
import path from "path";

const FLASHCARD_DIR = path.join(process.cwd(), "content/flashcards");

export interface FlashcardData {
  front: string;
  back: string;
}

export interface FlashcardSet {
  articleSlug: string;
  cards: FlashcardData[];
}

export function getFlashcardSet(
  trackId: string,
  articleSlug: string
): FlashcardSet | null {
  const filePath = path.join(FLASHCARD_DIR, trackId, `${articleSlug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
