import { generateObject } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";
import { z } from "zod";
import { db } from "@/db";
import { projects, projectArticles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getAllTracks, getTrackArticles } from "@/lib/content";
import { TRACKS } from "@/lib/config";

const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const syllabusSchema = z.object({
  sections: z.array(
    z.object({
      title: z.string(),
      articles: z.array(
        z.object({
          trackId: z.string(),
          slug: z.string(),
          reason: z.string(),
        })
      ),
    })
  ),
});

function buildArticleCatalog() {
  const trackIds = getAllTracks();
  const catalog: {
    trackId: string;
    trackTitle: string;
    slug: string;
    title: string;
    description: string;
    tags: string[];
    sectionTitle: string;
  }[] = [];

  for (const trackId of trackIds) {
    const track = TRACKS.find((t) => t.id === trackId);
    const articles = getTrackArticles(trackId);
    for (const article of articles) {
      catalog.push({
        trackId,
        trackTitle: track?.title || trackId,
        slug: article.slug,
        title: article.title,
        description: article.description,
        tags: article.tags || [],
        sectionTitle: article.sectionTitle,
      });
    }
  }

  return catalog;
}

export async function generateProjectSyllabus(
  projectId: string,
  projectName: string,
  projectDescription: string
) {
  try {
    const catalog = buildArticleCatalog();

    const { object } = await generateObject({
      model: anthropic("claude-sonnet-4-5-20250929"),
      schema: syllabusSchema,
      system: `You are a curriculum designer for Swiftique, an iOS development learning platform.
Your job is to create a focused, ordered learning path for a user who wants to build a specific app.

Select ONLY the articles that are directly relevant to building the described project.
Group them into logical sections that make sense for the project's learning journey.
Order them pedagogically — prerequisites before advanced topics.
Keep the syllabus focused: don't include articles just because they exist. Only include what's needed.`,
      prompt: `The user wants to build this project:

**Project Name:** ${projectName}
**Project Description:** ${projectDescription}

Here is the complete article catalog available on the platform:

${JSON.stringify(catalog, null, 2)}

Create a focused learning syllabus by selecting relevant articles from the catalog above. Group them into sections and order them for progressive learning. Each article must reference an existing trackId and slug from the catalog.`,
    });

    // Insert curated articles
    for (let sIdx = 0; sIdx < object.sections.length; sIdx++) {
      const section = object.sections[sIdx];
      for (let aIdx = 0; aIdx < section.articles.length; aIdx++) {
        const article = section.articles[aIdx];
        db.insert(projectArticles)
          .values({
            projectId,
            trackId: article.trackId,
            articleSlug: article.slug,
            sectionTitle: section.title,
            sectionOrder: sIdx,
            articleOrder: aIdx,
            reason: article.reason,
          })
          .run();
      }
    }

    // Mark project as ready
    db.update(projects)
      .set({ status: "ready", updatedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId))
      .run();
  } catch (error) {
    console.error("Failed to generate project syllabus:", error);
    db.update(projects)
      .set({ status: "error", updatedAt: new Date().toISOString() })
      .where(eq(projects.id, projectId))
      .run();
  }
}
