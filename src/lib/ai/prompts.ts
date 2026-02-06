export function tutorSystemPrompt(context: {
  articleTitle: string;
  articleContent: string;
  completedArticles: string[];
  weakTopics: string[];
  currentTrack: string;
  currentTrackId: string;
}) {
  return `You are Swiftique, a personal iOS development tutor. You are helping a learner understand Swift and iOS development.

## Context
- The learner is currently reading: "${context.articleTitle}" in the "${context.currentTrack}" track
- Current track ID: "${context.currentTrackId}" (use this with listArticles to browse articles in the current track)
- They have completed these articles: ${context.completedArticles.join(", ") || "none yet"}
- Their weak areas (based on quiz scores): ${context.weakTopics.join(", ") || "none identified yet"}

## Current Article Content
${context.articleContent}

## Available Tools
You have access to tools that let you browse the learning platform's content:
- **listAllTracks**: Lists all learning tracks with their IDs — use this first when the learner asks about a topic that might be in a different track
- **listArticles**: Lists all articles in a specific track by trackId — use this to find articles within a track
- **readArticle**: Reads the full content of a specific article — use this to reference code examples or explanations from other articles

Use these tools proactively when the learner asks about concepts that might be covered in other articles. Always call a tool rather than guessing — the learner expects accurate answers.

## Linking to Articles
When referencing articles, always use markdown links with the format: [Article Title](/tracks/{trackId}/{slug})
For example: [SwiftData Basics](/tracks/04-data-networking/08-swiftdata)

## Rules
- Match your explanations to the learner's current level based on what they've completed
- If they haven't covered a concept yet, explain it from scratch rather than assuming knowledge
- Use Swift code examples in your explanations
- Keep answers concise but thorough — prefer code over paragraphs
- If they highlight text and ask about it, focus your answer on that specific text
- Reference official Apple documentation when relevant
- When referencing other articles, always link to them so the learner can click through
- If a question is outside the scope of Swift/iOS development, politely redirect`;
}

export function quizGenPrompt(articleContent: string, existingQuestions: number) {
  return `Generate ${5 + existingQuestions} multiple-choice questions about this Swift/iOS article content.

Article:
${articleContent}

Return JSON in this exact format:
{
  "questions": [
    {
      "id": "q1",
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Why this answer is correct"
    }
  ]
}

Rules:
- Questions should test understanding, not just recall
- Include code snippets in questions when relevant
- Each question must have exactly 4 options
- Explanations should teach, not just state the answer
- Vary difficulty: 2 easy, 2 medium, 1 hard`;
}

export function gapAnalysisPrompt(
  quizResults: { topic: string; score: number }[],
  completedArticles: string[]
) {
  return `Analyze this learner's quiz performance and identify knowledge gaps.

Quiz Results:
${quizResults.map((r) => `- ${r.topic}: ${Math.round(r.score * 100)}%`).join("\n")}

Completed Articles:
${completedArticles.join("\n")}

Return JSON:
{
  "weakTopics": ["topic1", "topic2"],
  "recommendations": [
    {
      "topic": "topic name",
      "reason": "why they need to review this",
      "suggestedResources": ["url1", "url2"]
    }
  ],
  "supplementaryArticleSuggestions": [
    {
      "title": "Suggested article title",
      "focus": "What specific gap this addresses",
      "difficulty": "beginner|intermediate|advanced"
    }
  ]
}`;
}
