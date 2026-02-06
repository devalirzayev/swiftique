import { config } from "dotenv";
config({ path: ".env.local" });

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import OpenAI from "openai";

const openai = new OpenAI();

interface Flashcard {
  front: string;
  back: string;
}

interface FlashcardData {
  articleSlug: string;
  cards: Flashcard[];
}

async function generateFlashcards(trackId: string, slug: string) {
  const articlePath = join(process.cwd(), "content/tracks", trackId, `${slug}.mdx`);

  if (!existsSync(articlePath)) {
    console.error(`Article not found: ${articlePath}`);
    process.exit(1);
  }

  const articleContent = readFileSync(articlePath, "utf-8");

  console.log(`Generating flashcards for: ${trackId}/${slug}`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are a flashcard generator for a Swift/iOS learning platform. Generate 5-10 flashcards based on the provided article content.

Return valid JSON in this exact format:
{
  "cards": [
    {
      "front": "Question or prompt on the front of the card",
      "back": "Answer or explanation on the back of the card"
    }
  ]
}

Rules:
- Generate between 5 and 10 flashcards
- Front should be a clear question or prompt
- Back should be a concise but complete answer
- Use inline code formatting with backticks for Swift code references
- Cover the most important concepts from the article
- Include both conceptual and syntax-focused cards
- Cards should be self-contained — understandable without reading the article`,
      },
      {
        role: "user",
        content: `Generate flashcards based on this Swift article:\n\n${articleContent}`,
      },
    ],
  });

  const result = JSON.parse(response.choices[0].message.content ?? "{}");

  const flashcardData: FlashcardData = {
    articleSlug: slug,
    cards: result.cards,
  };

  const dir = join(process.cwd(), "content/flashcards", trackId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const outputPath = join(dir, `${slug}.json`);
  writeFileSync(outputPath, JSON.stringify(flashcardData, null, 2) + "\n");
  console.log(`  Written: ${outputPath}`);
}

async function main() {
  const trackId = process.argv[2];
  const slug = process.argv[3];

  if (!trackId || !slug) {
    console.log("Usage: npx tsx scripts/generate-flashcards.ts <track-id> <article-slug>");
    console.log("Example: npx tsx scripts/generate-flashcards.ts 01-swift-fundamentals 03-constants-variables");
    process.exit(1);
  }

  await generateFlashcards(trackId, slug);
  console.log("\nDone!");
}

main().catch(console.error);
