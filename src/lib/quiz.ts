import fs from "fs";
import path from "path";

const QUIZ_DIR = path.join(process.cwd(), "content/quizzes");

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Quiz {
  articleSlug: string;
  questions: QuizQuestion[];
}

export function getQuiz(trackId: string, articleSlug: string): Quiz | null {
  const filePath = path.join(QUIZ_DIR, trackId, `${articleSlug}.json`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}
