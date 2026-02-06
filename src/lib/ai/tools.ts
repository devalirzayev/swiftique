import { tool } from "ai";
import { z } from "zod";
import { getTrackArticles, getArticle } from "@/lib/content";
import { TRACKS } from "@/lib/config";

export const tutorTools = {
  listAllTracks: tool({
    description:
      "List all available learning tracks with their IDs, titles, and descriptions. Use this to find which track covers a topic the learner asks about, then call listArticles with that trackId.",
    inputSchema: z.object({}),
    execute: async () => {
      return TRACKS.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
      }));
    },
  }),
  listArticles: tool({
    description:
      "List all articles in a learning track. Use this to discover related content when a learner asks about topics that might be covered in other articles.",
    inputSchema: z.object({
      trackId: z.string().describe("The track ID to list articles from"),
    }),
    execute: async ({ trackId }) => {
      const articles = getTrackArticles(trackId);
      return articles.map((a) => ({
        slug: a.slug,
        title: a.title,
        description: a.description,
        section: a.sectionTitle,
      }));
    },
  }),
  readArticle: tool({
    description:
      "Read the full content of a specific article. Use this to reference concepts, code examples, or explanations from other articles when helping the learner.",
    inputSchema: z.object({
      trackId: z.string().describe("The track ID the article belongs to"),
      slug: z.string().describe("The article slug"),
    }),
    execute: async ({ trackId, slug }) => {
      const article = getArticle(trackId, slug);
      if (!article) return { error: "Article not found" };
      return {
        title: article.title,
        description: article.description,
        section: article.sectionTitle,
        content: article.content,
      };
    },
  }),
};
