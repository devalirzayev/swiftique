import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import OpenAI from "openai";

const openai = new OpenAI();

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface QuizData {
  articleSlug: string;
  questions: QuizQuestion[];
}

async function generateQuiz(trackId: string, slug: string) {
  const articlePath = join(process.cwd(), "content/tracks", trackId, `${slug}.mdx`);

  if (!existsSync(articlePath)) {
    console.error(`Article not found: ${articlePath}`);
    process.exit(1);
  }

  const articleContent = readFileSync(articlePath, "utf-8");

  console.log(`Generating quiz for: ${trackId}/${slug}`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a quiz generator for a Swift/iOS learning platform. Generate exactly 5 multiple-choice questions based on the provided article content.

Return valid JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Brief explanation of why this answer is correct."
    }
  ]
}

Rules:
- Each question must have exactly 4 options
- correctAnswer is a 0-based index into the options array
- Questions should test understanding, not just memorization
- Include a mix of conceptual and practical code-reading questions
- Explanations should be concise but educational
- Questions should progress from easier to harder`,
      },
      {
        role: "user",
        content: `Generate 5 quiz questions based on this Swift article:\n\n${articleContent}`,
      },
    ],
  });

  const result = JSON.parse(response.choices[0].message.content ?? "{}");

  const quizData: QuizData = {
    articleSlug: slug,
    questions: result.questions,
  };

  const dir = join(process.cwd(), "content/quizzes", trackId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const outputPath = join(dir, `${slug}.json`);
  writeFileSync(outputPath, JSON.stringify(quizData, null, 2) + "\n");
  console.log(`  Written: ${outputPath}`);
}

async function main() {
  const trackId = process.argv[2];
  const slug = process.argv[3];

  if (!trackId || !slug) {
    console.log("Usage: npx tsx scripts/generate-quiz.ts <track-id> <article-slug>");
    console.log("Example: npx tsx scripts/generate-quiz.ts 01-swift-fundamentals 03-constants-variables");
    process.exit(1);
  }

  await generateQuiz(trackId, slug);
  console.log("\nDone!");
}

main().catch(console.error);
