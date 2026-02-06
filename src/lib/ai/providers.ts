import { generateText, streamText, stepCountIs, ToolSet } from "ai";
import type { ModelMessage } from "@ai-sdk/provider-utils";
import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type AITask =
  | "tutor"          // Explain concepts, answer questions (Claude)
  | "quiz-gen"       // Generate quiz questions (GPT)
  | "content-gen"    // Generate/refine articles (Claude)
  | "gap-analysis"   // Analyze weak areas, recommend content (reasoning model)
  | "flashcard-gen"; // Generate flashcards (GPT)

const TASK_MODEL_MAP: Record<AITask, ReturnType<typeof anthropic | typeof openai>> = {
  tutor: anthropic("claude-sonnet-4-5-20250929"),
  "quiz-gen": openai("gpt-4o"),
  "content-gen": anthropic("claude-sonnet-4-5-20250929"),
  "gap-analysis": openai("o3-mini"),
  "flashcard-gen": openai("gpt-4o"),
};

export function getModel(task: AITask) {
  return TASK_MODEL_MAP[task];
}

export async function aiGenerate(task: AITask, prompt: string, system?: string) {
  const model = getModel(task);
  const result = await generateText({
    model,
    system,
    prompt,
  });
  return result.text;
}

export function aiStream(
  task: AITask,
  options: {
    system?: string;
    messages: ModelMessage[];
    tools?: ToolSet;
  },
) {
  const model = getModel(task);
  return streamText({
    model,
    system: options.system,
    messages: options.messages,
    ...(options.tools ? { tools: options.tools, stopWhen: stepCountIs(5) } : {}),
  });
}
