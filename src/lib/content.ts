import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";

const CONTENT_DIR = path.join(process.cwd(), "content/tracks");

export interface ArticleMeta {
  slug: string;
  title: string;
  description: string;
  trackId: string;
  sectionId: string;
  sectionTitle: string;
  order: number;
  readingTime: string;
  videoResources?: { title: string; url: string; platform: string }[];
  prerequisites?: string[];
  tags?: string[];
}

export interface Article extends ArticleMeta {
  content: string;
}

export function getArticle(trackId: string, slug: string): Article | null {
  const trackDir = path.join(CONTENT_DIR, trackId);
  const filePath = path.join(trackDir, `${slug}.mdx`);

  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const stats = readingTime(content);

  return {
    slug,
    title: data.title,
    description: data.description,
    trackId,
    sectionId: data.sectionId,
    sectionTitle: data.sectionTitle,
    order: data.order,
    readingTime: stats.text,
    videoResources: data.videoResources,
    prerequisites: data.prerequisites,
    tags: data.tags,
    content,
  };
}

export function getTrackArticles(trackId: string): ArticleMeta[] {
  const trackDir = path.join(CONTENT_DIR, trackId);

  if (!fs.existsSync(trackDir)) return [];

  const files = fs
    .readdirSync(trackDir)
    .filter((f) => f.endsWith(".mdx"));

  return files
    .map((file) => {
      const slug = file.replace(".mdx", "");
      const raw = fs.readFileSync(path.join(trackDir, file), "utf-8");
      const { data, content } = matter(raw);
      const stats = readingTime(content);

      return {
        slug,
        title: data.title,
        description: data.description,
        trackId,
        sectionId: data.sectionId,
        sectionTitle: data.sectionTitle,
        order: data.order,
        readingTime: stats.text,
        videoResources: data.videoResources,
        prerequisites: data.prerequisites,
        tags: data.tags,
      };
    })
    .sort((a, b) => a.order - b.order);
}

export function getAllTracks() {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((d) => fs.statSync(path.join(CONTENT_DIR, d)).isDirectory())
    .sort();
}

export function getTrackSections(trackId: string) {
  const articles = getTrackArticles(trackId);
  const sectionMap = new Map<string, { title: string; articles: ArticleMeta[] }>();

  for (const article of articles) {
    if (!sectionMap.has(article.sectionId)) {
      sectionMap.set(article.sectionId, {
        title: article.sectionTitle,
        articles: [],
      });
    }
    sectionMap.get(article.sectionId)!.articles.push(article);
  }

  return Array.from(sectionMap.entries()).map(([id, data]) => ({
    id,
    title: data.title,
    articles: data.articles.sort((a, b) => a.order - b.order),
  }));
}
