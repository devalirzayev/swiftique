# Swiftique — AI-Powered iOS Learning Platform Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a dark-mode, documentation-style web app that teaches the full iOS development path (Swift → SwiftUI → Architecture → Production) with AI-generated articles, adaptive learning, context-aware AI tutor, quizzes, and spaced-repetition flashcards.

**Architecture:** Next.js 15 App Router with MDX-based content stored in the repo. Multi-provider AI layer (Claude + GPT + reasoning models) abstracted behind a unified interface. Local SQLite database for user progress, quiz scores, and flashcard scheduling. Content generated via CLI scripts that fetch, analyze, and restructure official Apple docs and community resources.

**Tech Stack:** Next.js 15 (App Router), TypeScript, Tailwind CSS v4, MDX (next-mdx-remote), SQLite (better-sqlite3/Drizzle ORM), Vercel AI SDK, Anthropic SDK, OpenAI SDK, Shiki (code highlighting), Framer Motion (animations)

---

## Phase 1: Project Foundation

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `.gitignore`

**Step 1: Scaffold the project**

Run:
```bash
cd /Users/devalirzayev/Projects/digitalchimpanzee/swiftique
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
```
Expected: Project scaffolded with App Router, TypeScript, Tailwind

**Step 2: Verify it runs**

Run: `npm run dev`
Expected: Dev server starts on localhost:3000

**Step 3: Configure dark mode in Tailwind**

Edit `src/app/globals.css` — set dark background/text as defaults:
```css
@import "tailwindcss";

:root {
  --background: #0a0a0b;
  --foreground: #e4e4e7;
  --muted: #27272a;
  --muted-foreground: #a1a1aa;
  --accent: #3b82f6;
  --accent-foreground: #dbeafe;
  --border: #27272a;
  --card: #111113;
  --card-foreground: #e4e4e7;
  --success: #22c55e;
  --warning: #eab308;
  --error: #ef4444;
}

body {
  background-color: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}
```

**Step 4: Set up base layout**

Edit `src/app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Swiftique — Learn iOS Development",
  description: "AI-powered learning platform for Swift & SwiftUI",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**Step 5: Verify dark mode renders**

Run: `npm run dev`
Expected: Dark background page loads at localhost:3000

**Step 6: Initialize git and commit**

Run:
```bash
git init
git add .
git commit -m "feat: initialize next.js project with dark mode"
```

---

### Task 2: Install Core Dependencies

**Files:**
- Modify: `package.json`

**Step 1: Install content dependencies**

Run:
```bash
npm install next-mdx-remote shiki gray-matter reading-time
```

**Step 2: Install database dependencies**

Run:
```bash
npm install better-sqlite3 drizzle-orm
npm install -D drizzle-kit @types/better-sqlite3
```

**Step 3: Install AI dependencies**

Run:
```bash
npm install ai @ai-sdk/anthropic @ai-sdk/openai
```

**Step 4: Install UI dependencies**

Run:
```bash
npm install framer-motion lucide-react clsx
```

**Step 5: Verify no install errors**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 6: Commit**

Run:
```bash
git add package.json package-lock.json
git commit -m "feat: install core dependencies (mdx, sqlite, ai, ui)"
```

---

### Task 3: Project Structure & Configuration

**Files:**
- Create: `src/lib/config.ts`
- Create: `src/lib/utils.ts`
- Create: `content/tracks/.gitkeep`
- Create: `src/db/schema.ts`
- Create: `src/db/index.ts`
- Create: `drizzle.config.ts`

**Step 1: Create directory structure**

Run:
```bash
mkdir -p src/lib src/db src/components src/components/ui src/components/mdx src/components/layout src/components/learning
mkdir -p content/tracks/01-swift-fundamentals content/tracks/02-swiftui-essentials content/tracks/03-swiftui-advanced content/tracks/04-data-networking content/tracks/05-app-architecture content/tracks/06-platform-features content/tracks/07-production-deployment
mkdir -p src/app/tracks src/app/api
```

**Step 2: Create config file**

Create `src/lib/config.ts`:
```ts
export const TRACKS = [
  {
    id: "01-swift-fundamentals",
    title: "Swift Fundamentals",
    description: "Master the Swift programming language from basics to advanced concepts",
    color: "#F05138",
  },
  {
    id: "02-swiftui-essentials",
    title: "SwiftUI Essentials",
    description: "Build user interfaces with SwiftUI's declarative framework",
    color: "#007AFF",
  },
  {
    id: "03-swiftui-advanced",
    title: "SwiftUI Advanced",
    description: "Animations, gestures, custom graphics, and advanced patterns",
    color: "#5856D6",
  },
  {
    id: "04-data-networking",
    title: "Data & Networking",
    description: "Networking, JSON parsing, persistence, and SwiftData",
    color: "#34C759",
  },
  {
    id: "05-app-architecture",
    title: "App Architecture",
    description: "Design patterns, testing, debugging, and profiling",
    color: "#FF9500",
  },
  {
    id: "06-platform-features",
    title: "Platform Features",
    description: "Notifications, maps, camera, widgets, and StoreKit",
    color: "#FF2D55",
  },
  {
    id: "07-production-deployment",
    title: "Production & Deployment",
    description: "App Store, TestFlight, CI/CD, and post-launch",
    color: "#AF52DE",
  },
] as const;

export type TrackId = (typeof TRACKS)[number]["id"];
```

**Step 3: Create utility functions**

Create `src/lib/utils.ts`:
```ts
import { clsx, type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}
```

**Step 4: Create database schema**

Create `src/db/schema.ts`:
```ts
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const progress = sqliteTable("progress", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleSlug: text("article_slug").notNull().unique(),
  trackId: text("track_id").notNull(),
  sectionId: text("section_id").notNull(),
  completed: integer("completed", { mode: "boolean" }).default(false),
  completedAt: text("completed_at"),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});

export const quizResults = sqliteTable("quiz_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleSlug: text("article_slug").notNull(),
  score: real("score").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  attemptedAt: text("attempted_at").default("CURRENT_TIMESTAMP"),
});

export const flashcards = sqliteTable("flashcards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleSlug: text("article_slug").notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  interval: integer("interval").default(1),
  easeFactor: real("ease_factor").default(2.5),
  nextReviewAt: text("next_review_at"),
  lastReviewedAt: text("last_reviewed_at"),
  reviewCount: integer("review_count").default(0),
});

export const chatHistory = sqliteTable("chat_history", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  articleSlug: text("article_slug").notNull(),
  highlightedText: text("highlighted_text"),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").default("CURRENT_TIMESTAMP"),
});
```

**Step 5: Create database connection**

Create `src/db/index.ts`:
```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";

const DB_PATH = path.join(process.cwd(), "swiftique.db");

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");

export const db = drizzle(sqlite, { schema });
```

**Step 6: Create Drizzle config**

Create `drizzle.config.ts`:
```ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  dbCredentials: {
    url: "./swiftique.db",
  },
});
```

**Step 7: Generate and run migration**

Run:
```bash
npx drizzle-kit generate
npx drizzle-kit push
```
Expected: Database tables created

**Step 8: Add db file to gitignore**

Append to `.gitignore`:
```
swiftique.db
```

**Step 9: Commit**

Run:
```bash
git add -A
git commit -m "feat: add project structure, config, db schema"
```

---

## Phase 2: Content System

### Task 4: MDX Content Loader

**Files:**
- Create: `src/lib/content.ts`
- Create: `src/lib/mdx.ts`

**Step 1: Create content types and loader**

Create `src/lib/content.ts`:
```ts
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
```

**Step 2: Create MDX renderer with code highlighting**

Create `src/lib/mdx.ts`:
```ts
import { compileMDX } from "next-mdx-remote/rsc";
import { createHighlighter } from "shiki";

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: ["swift", "bash", "json", "typescript", "yaml"],
    });
  }
  return highlighterPromise;
}

export async function renderMDX(source: string) {
  const highlighter = await getHighlighter();

  const { content } = await compileMDX({
    source,
    options: {
      mdxOptions: {
        rehypePlugins: [],
      },
    },
    components: {
      pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => (
        <pre className="overflow-x-auto rounded-lg bg-[#0d1117] p-4 text-sm" {...props}>
          {children}
        </pre>
      ),
      code: ({ children, className, ...props }: React.ComponentPropsWithoutRef<"code">) => {
        const match = /language-(\w+)/.exec(className || "");
        if (match) {
          const lang = match[1];
          const html = highlighter.codeToHtml(String(children).trim(), {
            lang,
            theme: "github-dark",
          });
          return <div dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return (
          <code
            className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      },
    },
  });

  return content;
}
```

**Step 3: Commit**

Run:
```bash
git add src/lib/content.ts src/lib/mdx.ts
git commit -m "feat: add MDX content loader and renderer with syntax highlighting"
```

---

### Task 5: Sample Content — First Article

**Files:**
- Create: `content/tracks/01-swift-fundamentals/01-about-swift.mdx`
- Create: `content/tracks/01-swift-fundamentals/02-the-basics.mdx`
- Create: `content/quizzes/01-swift-fundamentals/02-the-basics.json`
- Create: `content/flashcards/01-swift-fundamentals/02-the-basics.json`

**Step 1: Create quiz/flashcard directories**

Run:
```bash
mkdir -p content/quizzes/01-swift-fundamentals content/flashcards/01-swift-fundamentals
```

**Step 2: Create first article**

Create `content/tracks/01-swift-fundamentals/01-about-swift.mdx`:
```mdx
---
title: "About Swift"
description: "An introduction to the Swift programming language — its design philosophy, key features, and why it's the language for Apple platforms."
sectionId: "1.1-getting-started"
sectionTitle: "Getting Started"
order: 1
tags: ["introduction", "overview"]
videoResources:
  - title: "Swift in 100 Seconds"
    url: "https://www.youtube.com/watch?v=nAchMctX4YA"
    platform: "youtube"
---

# About Swift

Swift is a powerful, intuitive programming language created by Apple for building apps across all Apple platforms — iOS, macOS, watchOS, tvOS, and visionOS.

## Why Swift?

Swift was designed with three goals in mind:

- **Safe** — Swift eliminates entire categories of bugs. Variables are always initialized before use, arrays and integers are checked for overflow, and memory is managed automatically.
- **Fast** — Swift code is compiled to optimized native code using the LLVM compiler. Its performance is comparable to C and C++.
- **Expressive** — Swift's syntax is clean and modern, making code easier to read and write.

## A Brief History

Swift was introduced at WWDC 2014 as a replacement for Objective-C. Since then it has evolved rapidly:

| Version | Year | Key Feature |
|---------|------|-------------|
| Swift 1.0 | 2014 | Initial release |
| Swift 2.0 | 2015 | Error handling, protocol extensions |
| Swift 3.0 | 2016 | API design guidelines, open source |
| Swift 4.0 | 2017 | Codable, String overhaul |
| Swift 5.0 | 2019 | ABI stability |
| Swift 5.5 | 2021 | async/await, actors |
| Swift 6.0 | 2024 | Strict concurrency, complete sendable checking |

## Open Source

Swift is [open source](https://github.com/swiftlang/swift). The language, compiler, standard library, and package manager are all developed in the open. This means Swift evolves based on community feedback and contributions.

## What You'll Learn

In this track, you'll master Swift from the ground up — starting with variables and types, through functions and closures, to protocols, generics, and concurrency. Every concept is taught with practical examples you can run in Xcode or Swift Playgrounds.

Let's get started.
```

**Step 3: Create second article with code examples**

Create `content/tracks/01-swift-fundamentals/02-the-basics.mdx`:
```mdx
---
title: "The Basics"
description: "Constants, variables, type annotations, basic data types, tuples, optionals, and type safety in Swift."
sectionId: "1.2-the-basics"
sectionTitle: "The Basics"
order: 2
tags: ["variables", "constants", "types", "optionals"]
prerequisites: ["01-about-swift"]
videoResources:
  - title: "Swift Variables and Constants"
    url: "https://www.youtube.com/watch?v=example"
    platform: "youtube"
---

# The Basics

Swift provides fundamental building blocks for working with data. Let's explore each one.

## Constants and Variables

Use `let` for constants (values that don't change) and `var` for variables (values that can change):

```swift
let maximumLoginAttempts = 10 // constant — cannot be reassigned
var currentLoginAttempt = 0    // variable — can be reassigned

currentLoginAttempt += 1 // ✅ This works
// maximumLoginAttempts += 1 // ❌ Compile error — constants can't change
```

> **Rule of thumb:** Always use `let` unless you know the value needs to change. Xcode will warn you if you use `var` for a value that never changes.

## Type Annotations

Swift can infer types, but you can also be explicit:

```swift
let name: String = "Swift"
let version: Double = 6.0
let isAwesome: Bool = true
var year: Int = 2024
```

Most of the time, type inference is preferred — it keeps code cleaner:

```swift
let name = "Swift"       // String (inferred)
let version = 6.0        // Double (inferred)
let isAwesome = true     // Bool (inferred)
```

## Integers

Swift provides signed and unsigned integers in 8, 16, 32, and 64-bit forms:

```swift
let minInt8 = Int8.min    // -128
let maxInt8 = Int8.max    // 127
let maxUInt8 = UInt8.max  // 255

// In most cases, just use Int — it matches the platform (64-bit on modern hardware)
let age: Int = 25
```

## Floating-Point Numbers

```swift
let pi = 3.14159          // Double (64-bit, preferred)
let e: Float = 2.71828    // Float (32-bit, less precision)
```

> **Prefer `Double`** — Swift defaults to `Double` when inferring floating-point types, and it provides at least 15 decimal digits of precision.

## Type Safety and Type Inference

Swift is type-safe — it won't let you mix types accidentally:

```swift
let meaningOfLife = 42          // Int
let pi = 3.14159                // Double
// let sum = meaningOfLife + pi // ❌ Error: can't add Int and Double
let sum = Double(meaningOfLife) + pi // ✅ Explicit conversion
```

## Tuples

Tuples group multiple values into a single compound value:

```swift
let http404Error = (404, "Not Found")
print(http404Error.0) // 404
print(http404Error.1) // "Not Found"

// Named elements
let http200Status = (statusCode: 200, description: "OK")
print(http200Status.statusCode)  // 200
print(http200Status.description) // "OK"
```

## Optionals

An optional says "there is a value, and it equals x" or "there isn't a value at all":

```swift
var serverResponseCode: Int? = 404  // has a value: 404
serverResponseCode = nil             // now has no value

// Unwrapping optionals safely
if let code = serverResponseCode {
    print("Response code: \(code)")
} else {
    print("No response")
}

// Guard let — preferred in functions
func processResponse(_ code: Int?) {
    guard let code = code else {
        print("No response code")
        return
    }
    print("Processing code: \(code)")
}

// Nil-coalescing operator
let displayCode = serverResponseCode ?? 0  // use 0 if nil
```

## Summary

| Concept | Keyword | Example |
|---------|---------|---------|
| Constant | `let` | `let name = "Swift"` |
| Variable | `var` | `var count = 0` |
| Integer | `Int` | `let age: Int = 25` |
| Floating-point | `Double` | `let pi = 3.14` |
| Boolean | `Bool` | `let active = true` |
| Tuple | `()` | `let pair = (1, "one")` |
| Optional | `?` | `var name: String?` |
```

**Step 4: Create quiz for the basics article**

Create `content/quizzes/01-swift-fundamentals/02-the-basics.json`:
```json
{
  "articleSlug": "02-the-basics",
  "questions": [
    {
      "id": "q1",
      "question": "What keyword declares a constant in Swift?",
      "options": ["var", "let", "const", "final"],
      "correctAnswer": 1,
      "explanation": "`let` declares a constant whose value cannot be changed after it's set."
    },
    {
      "id": "q2",
      "question": "What type does Swift infer for `let pi = 3.14159`?",
      "options": ["Float", "Double", "Decimal", "Int"],
      "correctAnswer": 1,
      "explanation": "Swift defaults to `Double` when inferring floating-point types."
    },
    {
      "id": "q3",
      "question": "What does `var name: String?` mean?",
      "options": [
        "name is a String that cannot be nil",
        "name is a String or nil",
        "name has a default value",
        "name is a constant"
      ],
      "correctAnswer": 1,
      "explanation": "The `?` makes it an optional — it can hold a String value or nil."
    },
    {
      "id": "q4",
      "question": "What is the result of `let x = 42; let y = Double(x) + 0.5`?",
      "options": ["Compile error", "42.5", "42", "43"],
      "correctAnswer": 1,
      "explanation": "`Double(x)` converts the Int to Double, then adds 0.5 to get 42.5."
    },
    {
      "id": "q5",
      "question": "What does the nil-coalescing operator `??` do?",
      "options": [
        "Compares two optionals",
        "Force-unwraps an optional",
        "Provides a default value if the optional is nil",
        "Checks if a value is nil"
      ],
      "correctAnswer": 2,
      "explanation": "`a ?? b` unwraps `a` if it has a value, or returns `b` if `a` is nil."
    }
  ]
}
```

**Step 5: Create flashcards for the basics article**

Create `content/flashcards/01-swift-fundamentals/02-the-basics.json`:
```json
{
  "articleSlug": "02-the-basics",
  "cards": [
    {
      "front": "How do you declare a constant vs a variable in Swift?",
      "back": "`let` for constants, `var` for variables. Always prefer `let` unless the value needs to change."
    },
    {
      "front": "What is an Optional in Swift?",
      "back": "A type that can hold either a value or `nil`. Declared with `?` after the type: `var name: String?`"
    },
    {
      "front": "What does the nil-coalescing operator `??` do?",
      "back": "Provides a default value when an optional is nil: `let name = optionalName ?? \"Unknown\"`"
    },
    {
      "front": "Why does Swift prevent adding an Int and Double directly?",
      "back": "Swift is type-safe — no implicit type conversion. You must explicitly convert: `Double(myInt) + myDouble`"
    },
    {
      "front": "What's the difference between `if let` and `guard let`?",
      "back": "`if let` creates a scoped binding inside the if block. `guard let` creates a binding for the rest of the function and requires an early exit (return) if nil."
    }
  ]
}
```

**Step 6: Commit**

Run:
```bash
git add content/
git commit -m "feat: add sample articles, quiz, and flashcards for swift fundamentals"
```

---

## Phase 3: Core UI Components

### Task 6: Layout Shell — Sidebar + Main Content

**Files:**
- Create: `src/components/layout/sidebar.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/content-layout.tsx`
- Modify: `src/app/layout.tsx`

**Step 1: Create sidebar component**

Create `src/components/layout/sidebar.tsx`:
```tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TRACKS } from "@/lib/config";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  ChevronDown,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

interface SidebarSection {
  id: string;
  title: string;
  articles: {
    slug: string;
    title: string;
    completed?: boolean;
  }[];
}

interface SidebarProps {
  sections?: SidebarSection[];
  currentTrackId?: string;
}

export function Sidebar({ sections, currentTrackId }: SidebarProps) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set()
  );
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const nav = (
    <nav className="flex flex-col h-full">
      <div className="p-4 border-b border-[var(--border)]">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <BookOpen className="w-5 h-5 text-[var(--accent)]" />
          Swiftique
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Tracks
          </p>
          {TRACKS.map((track) => (
            <Link
              key={track.id}
              href={`/tracks/${track.id}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                currentTrackId === track.id
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
              )}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: track.color }}
              />
              {track.title}
            </Link>
          ))}
        </div>

        {sections && sections.length > 0 && (
          <div className="mt-6 space-y-1">
            <p className="px-3 py-2 text-xs font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
              Sections
            </p>
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-md text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  <span className="truncate">{section.title}</span>
                  {expandedSections.has(section.id) ? (
                    <ChevronDown className="w-4 h-4 shrink-0" />
                  ) : (
                    <ChevronRight className="w-4 h-4 shrink-0" />
                  )}
                </button>
                {expandedSections.has(section.id) && (
                  <div className="ml-3 pl-3 border-l border-[var(--border)] space-y-0.5">
                    {section.articles.map((article) => (
                      <Link
                        key={article.slug}
                        href={`/tracks/${currentTrackId}/${article.slug}`}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors",
                          pathname?.includes(article.slug)
                            ? "text-[var(--accent)]"
                            : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                        )}
                      >
                        <span
                          className={cn(
                            "w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0",
                            article.completed
                              ? "bg-[var(--success)] border-[var(--success)]"
                              : "border-[var(--border)]"
                          )}
                        >
                          {article.completed && (
                            <svg
                              className="w-2.5 h-2.5 text-white"
                              viewBox="0 0 12 12"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                            >
                              <path d="M2 6l3 3 5-5" />
                            </svg>
                          )}
                        </span>
                        <span className="truncate">{article.title}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </nav>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[var(--card)] border border-[var(--border)] lg:hidden"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen w-64 bg-[var(--card)] border-r border-[var(--border)] transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {nav}
      </aside>
    </>
  );
}
```

**Step 2: Create content layout wrapper**

Create `src/components/layout/content-layout.tsx`:
```tsx
interface ContentLayoutProps {
  children: React.ReactNode;
}

export function ContentLayout({ children }: ContentLayoutProps) {
  return (
    <div className="lg:pl-64">
      <main className="max-w-3xl mx-auto px-6 py-12 lg:py-16">
        {children}
      </main>
    </div>
  );
}
```

**Step 3: Create header component**

Create `src/components/layout/header.tsx`:
```tsx
import Link from "next/link";
import { formatDuration } from "@/lib/utils";

interface HeaderProps {
  title: string;
  description: string;
  readingTime?: string;
  trackTitle?: string;
  trackId?: string;
  sectionTitle?: string;
}

export function ArticleHeader({
  title,
  description,
  readingTime,
  trackTitle,
  trackId,
  sectionTitle,
}: HeaderProps) {
  return (
    <header className="mb-10">
      {trackTitle && (
        <div className="flex items-center gap-2 text-sm text-[var(--muted-foreground)] mb-3">
          <Link
            href={`/tracks/${trackId}`}
            className="hover:text-[var(--accent)] transition-colors"
          >
            {trackTitle}
          </Link>
          {sectionTitle && (
            <>
              <span>/</span>
              <span>{sectionTitle}</span>
            </>
          )}
        </div>
      )}
      <h1 className="text-3xl font-bold tracking-tight mb-3">{title}</h1>
      <p className="text-[var(--muted-foreground)] text-lg">{description}</p>
      {readingTime && (
        <p className="text-sm text-[var(--muted-foreground)] mt-2">
          {readingTime}
        </p>
      )}
    </header>
  );
}
```

**Step 4: Commit**

Run:
```bash
git add src/components/
git commit -m "feat: add sidebar, content layout, and article header components"
```

---

### Task 7: Article Page Route

**Files:**
- Create: `src/app/tracks/[trackId]/page.tsx`
- Create: `src/app/tracks/[trackId]/[slug]/page.tsx`
- Modify: `src/app/page.tsx`

**Step 1: Create home page**

Edit `src/app/page.tsx`:
```tsx
import Link from "next/link";
import { TRACKS } from "@/lib/config";
import { Sidebar } from "@/components/layout/sidebar";
import { ContentLayout } from "@/components/layout/content-layout";

export default function Home() {
  return (
    <>
      <Sidebar />
      <ContentLayout>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Learn iOS Development
        </h1>
        <p className="text-lg text-[var(--muted-foreground)] mb-10">
          A structured, AI-powered learning path from Swift fundamentals to App
          Store deployment.
        </p>

        <div className="grid gap-4">
          {TRACKS.map((track, i) => (
            <Link
              key={track.id}
              href={`/tracks/${track.id}`}
              className="group flex items-start gap-4 p-5 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors"
            >
              <span
                className="mt-1 flex items-center justify-center w-8 h-8 rounded-md text-sm font-semibold text-white shrink-0"
                style={{ backgroundColor: track.color }}
              >
                {i + 1}
              </span>
              <div>
                <h2 className="text-lg font-semibold group-hover:text-[var(--accent)] transition-colors">
                  {track.title}
                </h2>
                <p className="text-sm text-[var(--muted-foreground)] mt-1">
                  {track.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </ContentLayout>
    </>
  );
}
```

**Step 2: Create track overview page**

Create `src/app/tracks/[trackId]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { TRACKS } from "@/lib/config";
import { getTrackSections } from "@/lib/content";
import { Sidebar } from "@/components/layout/sidebar";
import { ContentLayout } from "@/components/layout/content-layout";
import Link from "next/link";

interface Props {
  params: Promise<{ trackId: string }>;
}

export default async function TrackPage({ params }: Props) {
  const { trackId } = await params;
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) notFound();

  const sections = getTrackSections(trackId);
  const sidebarSections = sections.map((s) => ({
    id: s.id,
    title: s.title,
    articles: s.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      completed: false,
    })),
  }));

  return (
    <>
      <Sidebar sections={sidebarSections} currentTrackId={trackId} />
      <ContentLayout>
        <div className="mb-8">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-lg text-white text-xl font-bold mb-4"
            style={{ backgroundColor: track.color }}
          >
            {TRACKS.indexOf(track) + 1}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{track.title}</h1>
          <p className="text-lg text-[var(--muted-foreground)] mt-2">
            {track.description}
          </p>
        </div>

        <div className="space-y-8">
          {sections.map((section) => (
            <div key={section.id}>
              <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
              <div className="space-y-2">
                {section.articles.map((article) => (
                  <Link
                    key={article.slug}
                    href={`/tracks/${trackId}/${article.slug}`}
                    className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)] hover:border-[var(--accent)] transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded border border-[var(--border)]" />
                      <span className="group-hover:text-[var(--accent)] transition-colors">
                        {article.title}
                      </span>
                    </div>
                    <span className="text-sm text-[var(--muted-foreground)]">
                      {article.readingTime}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </ContentLayout>
    </>
  );
}
```

**Step 3: Create article detail page**

Create `src/app/tracks/[trackId]/[slug]/page.tsx`:
```tsx
import { notFound } from "next/navigation";
import { TRACKS } from "@/lib/config";
import { getArticle, getTrackSections } from "@/lib/content";
import { renderMDX } from "@/lib/mdx";
import { Sidebar } from "@/components/layout/sidebar";
import { ContentLayout } from "@/components/layout/content-layout";
import { ArticleHeader } from "@/components/layout/header";

interface Props {
  params: Promise<{ trackId: string; slug: string }>;
}

export default async function ArticlePage({ params }: Props) {
  const { trackId, slug } = await params;
  const track = TRACKS.find((t) => t.id === trackId);
  if (!track) notFound();

  const article = getArticle(trackId, slug);
  if (!article) notFound();

  const sections = getTrackSections(trackId);
  const sidebarSections = sections.map((s) => ({
    id: s.id,
    title: s.title,
    articles: s.articles.map((a) => ({
      slug: a.slug,
      title: a.title,
      completed: false,
    })),
  }));

  const content = await renderMDX(article.content);

  return (
    <>
      <Sidebar sections={sidebarSections} currentTrackId={trackId} />
      <ContentLayout>
        <ArticleHeader
          title={article.title}
          description={article.description}
          readingTime={article.readingTime}
          trackTitle={track.title}
          trackId={track.id}
          sectionTitle={article.sectionTitle}
        />

        <article className="prose prose-invert prose-zinc max-w-none prose-headings:font-semibold prose-headings:tracking-tight prose-a:text-[var(--accent)] prose-code:text-[var(--accent-foreground)] prose-pre:bg-transparent prose-pre:p-0">
          {content}
        </article>
      </ContentLayout>
    </>
  );
}
```

**Step 4: Verify build**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

Run:
```bash
git add src/app/ src/components/
git commit -m "feat: add home, track overview, and article detail pages"
```

---

## Phase 4: Learning Features

### Task 8: Progress Tracking (Todo-like UI)

**Files:**
- Create: `src/app/api/progress/route.ts`
- Create: `src/components/learning/progress-checkbox.tsx`
- Create: `src/components/learning/track-progress.tsx`

**Step 1: Create progress API routes**

Create `src/app/api/progress/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { progress } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const all = await db.select().from(progress);
  return NextResponse.json(all);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { articleSlug, trackId, sectionId, completed } = body;

  const existing = await db
    .select()
    .from(progress)
    .where(eq(progress.articleSlug, articleSlug));

  if (existing.length > 0) {
    await db
      .update(progress)
      .set({
        completed,
        completedAt: completed ? new Date().toISOString() : null,
      })
      .where(eq(progress.articleSlug, articleSlug));
  } else {
    await db.insert(progress).values({
      articleSlug,
      trackId,
      sectionId,
      completed,
      completedAt: completed ? new Date().toISOString() : null,
    });
  }

  return NextResponse.json({ success: true });
}
```

**Step 2: Create progress checkbox component**

Create `src/components/learning/progress-checkbox.tsx`:
```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ProgressCheckboxProps {
  articleSlug: string;
  trackId: string;
  sectionId: string;
  initialCompleted?: boolean;
}

export function ProgressCheckbox({
  articleSlug,
  trackId,
  sectionId,
  initialCompleted = false,
}: ProgressCheckboxProps) {
  const [completed, setCompleted] = useState(initialCompleted);
  const [loading, setLoading] = useState(false);

  const toggle = async () => {
    setLoading(true);
    const newState = !completed;
    setCompleted(newState);

    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        articleSlug,
        trackId,
        sectionId,
        completed: newState,
      }),
    });

    setLoading(false);
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all",
        completed
          ? "bg-[var(--success)]/10 border-[var(--success)] text-[var(--success)]"
          : "border-[var(--border)] text-[var(--muted-foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
      )}
    >
      <span
        className={cn(
          "w-4 h-4 rounded border flex items-center justify-center transition-colors",
          completed
            ? "bg-[var(--success)] border-[var(--success)]"
            : "border-[var(--border)]"
        )}
      >
        {completed && (
          <svg
            className="w-3 h-3 text-white"
            viewBox="0 0 12 12"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M2 6l3 3 5-5" />
          </svg>
        )}
      </span>
      {completed ? "Learned" : "Mark as learned"}
    </button>
  );
}
```

**Step 3: Create track progress bar**

Create `src/components/learning/track-progress.tsx`:
```tsx
interface TrackProgressProps {
  completed: number;
  total: number;
  color: string;
}

export function TrackProgress({ completed, total, color }: TrackProgressProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-[var(--muted-foreground)]">
          {completed} of {total} articles
        </span>
        <span className="font-medium">{percentage}%</span>
      </div>
      <div className="h-2 rounded-full bg-[var(--muted)] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${percentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
```

**Step 4: Commit**

Run:
```bash
git add src/app/api/ src/components/learning/
git commit -m "feat: add progress tracking with todo-style checkbox UI"
```

---

### Task 9: Quiz System

**Files:**
- Create: `src/lib/quiz.ts`
- Create: `src/components/learning/quiz.tsx`
- Create: `src/app/api/quiz/route.ts`

**Step 1: Create quiz loader**

Create `src/lib/quiz.ts`:
```ts
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
```

**Step 2: Create quiz component**

Create `src/components/learning/quiz.tsx`:
```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import type { QuizQuestion } from "@/lib/quiz";

interface QuizProps {
  questions: QuizQuestion[];
  articleSlug: string;
}

export function Quiz({ questions, articleSlug }: QuizProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(
    new Array(questions.length).fill(null)
  );

  const current = questions[currentIndex];

  const handleSelect = (optionIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);

    const newAnswers = [...answers];
    newAnswers[currentIndex] = optionIndex;
    setAnswers(newAnswers);

    if (optionIndex === current.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setFinished(true);
      // Save results
      fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          articleSlug,
          score: score / questions.length,
          totalQuestions: questions.length,
          correctAnswers: score + (selectedAnswer === current.correctAnswer ? 1 : 0),
        }),
      });
    }
  };

  if (finished) {
    const finalScore = score;
    const percentage = Math.round((finalScore / questions.length) * 100);
    return (
      <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6 text-center">
        <h3 className="text-xl font-semibold mb-2">Quiz Complete</h3>
        <p className="text-4xl font-bold mb-2" style={{
          color: percentage >= 80 ? "var(--success)" : percentage >= 60 ? "var(--warning)" : "var(--error)",
        }}>
          {percentage}%
        </p>
        <p className="text-[var(--muted-foreground)]">
          {finalScore} out of {questions.length} correct
        </p>
        {percentage < 80 && (
          <p className="mt-4 text-sm text-[var(--warning)]">
            Consider reviewing this article before moving on.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-sm text-[var(--muted-foreground)]">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-medium">{score} correct</span>
      </div>

      <h3 className="text-lg font-medium mb-4">{current.question}</h3>

      <div className="space-y-2 mb-4">
        {current.options.map((option, i) => (
          <button
            key={i}
            onClick={() => handleSelect(i)}
            disabled={showExplanation}
            className={cn(
              "w-full text-left px-4 py-3 rounded-lg border text-sm transition-colors",
              showExplanation && i === current.correctAnswer
                ? "border-[var(--success)] bg-[var(--success)]/10 text-[var(--success)]"
                : showExplanation && i === selectedAnswer && i !== current.correctAnswer
                  ? "border-[var(--error)] bg-[var(--error)]/10 text-[var(--error)]"
                  : selectedAnswer === i
                    ? "border-[var(--accent)] bg-[var(--accent)]/10"
                    : "border-[var(--border)] hover:border-[var(--accent)]"
            )}
          >
            {option}
          </button>
        ))}
      </div>

      {showExplanation && (
        <div className="mb-4 p-4 rounded-lg bg-[var(--muted)] text-sm">
          <p className="font-medium mb-1">
            {selectedAnswer === current.correctAnswer ? "Correct!" : "Incorrect"}
          </p>
          <p className="text-[var(--muted-foreground)]">{current.explanation}</p>
        </div>
      )}

      {showExplanation && (
        <button
          onClick={handleNext}
          className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium text-sm hover:opacity-90 transition-opacity"
        >
          {currentIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
        </button>
      )}
    </div>
  );
}
```

**Step 3: Create quiz API**

Create `src/app/api/quiz/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { quizResults } from "@/db/schema";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { articleSlug, score, totalQuestions, correctAnswers } = body;

  await db.insert(quizResults).values({
    articleSlug,
    score,
    totalQuestions,
    correctAnswers,
  });

  return NextResponse.json({ success: true });
}
```

**Step 4: Commit**

Run:
```bash
git add src/lib/quiz.ts src/components/learning/quiz.tsx src/app/api/quiz/
git commit -m "feat: add multiple-choice quiz system with scoring"
```

---

### Task 10: Flashcard System with Spaced Repetition

**Files:**
- Create: `src/lib/flashcards.ts`
- Create: `src/lib/spaced-repetition.ts`
- Create: `src/components/learning/flashcard-deck.tsx`
- Create: `src/app/api/flashcards/route.ts`
- Create: `src/app/flashcards/page.tsx`

**Step 1: Create spaced repetition algorithm (SM-2)**

Create `src/lib/spaced-repetition.ts`:
```ts
/**
 * SM-2 Spaced Repetition Algorithm
 * Based on the SuperMemo 2 algorithm
 *
 * quality: 0-5 rating of how well you remembered
 *   0-2: Failed (reset interval)
 *   3: Barely remembered
 *   4: Remembered with effort
 *   5: Easily remembered
 */
export function calculateNextReview(
  quality: number,
  currentInterval: number,
  currentEaseFactor: number
): { interval: number; easeFactor: number } {
  let interval: number;
  let easeFactor = currentEaseFactor;

  if (quality < 3) {
    // Failed — reset to 1 day
    interval = 1;
  } else {
    if (currentInterval === 0) {
      interval = 1;
    } else if (currentInterval === 1) {
      interval = 6;
    } else {
      interval = Math.round(currentInterval * easeFactor);
    }
  }

  // Update ease factor
  easeFactor =
    easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { interval, easeFactor };
}

export function getNextReviewDate(intervalDays: number): string {
  const date = new Date();
  date.setDate(date.getDate() + intervalDays);
  return date.toISOString();
}
```

**Step 2: Create flashcard loader**

Create `src/lib/flashcards.ts`:
```ts
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
```

**Step 3: Create flashcard deck component**

Create `src/components/learning/flashcard-deck.tsx`:
```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Card {
  id: number;
  front: string;
  back: string;
}

interface FlashcardDeckProps {
  cards: Card[];
  articleSlug: string;
  onComplete?: (results: { cardId: number; quality: number }[]) => void;
}

export function FlashcardDeck({ cards, articleSlug, onComplete }: FlashcardDeckProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<{ cardId: number; quality: number }[]>([]);

  const current = cards[currentIndex];
  const isLast = currentIndex === cards.length - 1;

  const handleRate = async (quality: number) => {
    const newResults = [...results, { cardId: current.id, quality }];
    setResults(newResults);

    await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cardId: current.id,
        quality,
        articleSlug,
      }),
    });

    if (isLast) {
      onComplete?.(newResults);
    } else {
      setFlipped(false);
      setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    }
  };

  if (currentIndex >= cards.length) {
    return (
      <div className="text-center p-6">
        <p className="text-lg font-medium">Review complete!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between text-sm text-[var(--muted-foreground)]">
        <span>Card {currentIndex + 1} of {cards.length}</span>
      </div>

      <div
        onClick={() => !flipped && setFlipped(true)}
        className={cn(
          "min-h-[200px] p-6 rounded-lg border bg-[var(--card)] flex items-center justify-center text-center cursor-pointer transition-colors",
          flipped ? "border-[var(--accent)]" : "border-[var(--border)] hover:border-[var(--accent)]"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={flipped ? "back" : "front"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {flipped ? (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Answer</p>
                <p className="text-[var(--foreground)]">{current.back}</p>
              </div>
            ) : (
              <div>
                <p className="text-xs text-[var(--muted-foreground)] mb-2">Click to reveal</p>
                <p className="text-lg font-medium">{current.front}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {flipped && (
        <div className="flex gap-2">
          <button
            onClick={() => handleRate(1)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/30 hover:bg-[var(--error)]/20 transition-colors"
          >
            Forgot
          </button>
          <button
            onClick={() => handleRate(3)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/30 hover:bg-[var(--warning)]/20 transition-colors"
          >
            Hard
          </button>
          <button
            onClick={() => handleRate(4)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/20 transition-colors"
          >
            Good
          </button>
          <button
            onClick={() => handleRate(5)}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30 hover:bg-[var(--success)]/20 transition-colors"
          >
            Easy
          </button>
        </div>
      )}
    </div>
  );
}
```

**Step 4: Create flashcard API**

Create `src/app/api/flashcards/route.ts`:
```ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { flashcards } from "@/db/schema";
import { eq, and, lte } from "drizzle-orm";
import {
  calculateNextReview,
  getNextReviewDate,
} from "@/lib/spaced-repetition";

export async function GET() {
  const now = new Date().toISOString();
  const due = await db
    .select()
    .from(flashcards)
    .where(lte(flashcards.nextReviewAt, now));

  return NextResponse.json(due);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cardId, quality } = body;

  const card = await db
    .select()
    .from(flashcards)
    .where(eq(flashcards.id, cardId));

  if (card.length === 0) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const { interval, easeFactor } = calculateNextReview(
    quality,
    card[0].interval ?? 1,
    card[0].easeFactor ?? 2.5
  );

  await db
    .update(flashcards)
    .set({
      interval,
      easeFactor,
      nextReviewAt: getNextReviewDate(interval),
      lastReviewedAt: new Date().toISOString(),
      reviewCount: (card[0].reviewCount ?? 0) + 1,
    })
    .where(eq(flashcards.id, cardId));

  return NextResponse.json({ success: true, nextInterval: interval });
}
```

**Step 5: Create flashcard review page**

Create `src/app/flashcards/page.tsx`:
```tsx
import { Sidebar } from "@/components/layout/sidebar";
import { ContentLayout } from "@/components/layout/content-layout";

export default function FlashcardsPage() {
  return (
    <>
      <Sidebar />
      <ContentLayout>
        <h1 className="text-3xl font-bold tracking-tight mb-4">
          Flashcard Review
        </h1>
        <p className="text-[var(--muted-foreground)] mb-8">
          Cards due for review based on spaced repetition scheduling.
        </p>
        {/* Client component will fetch due cards and render FlashcardDeck */}
        <p className="text-sm text-[var(--muted-foreground)]">
          Complete articles with flashcards to start building your review deck.
        </p>
      </ContentLayout>
    </>
  );
}
```

**Step 6: Commit**

Run:
```bash
git add src/lib/spaced-repetition.ts src/lib/flashcards.ts src/components/learning/flashcard-deck.tsx src/app/api/flashcards/ src/app/flashcards/
git commit -m "feat: add flashcard system with SM-2 spaced repetition"
```

---

## Phase 5: AI Features

### Task 11: AI Provider Abstraction

**Files:**
- Create: `src/lib/ai/providers.ts`
- Create: `src/lib/ai/prompts.ts`

**Step 1: Create multi-provider AI wrapper**

Create `src/lib/ai/providers.ts`:
```ts
import { generateText, streamText } from "ai";
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

export function aiStream(task: AITask, messages: { role: "user" | "assistant" | "system"; content: string }[]) {
  const model = getModel(task);
  return streamText({
    model,
    messages,
  });
}
```

**Step 2: Create prompt templates**

Create `src/lib/ai/prompts.ts`:
```ts
export function tutorSystemPrompt(context: {
  articleTitle: string;
  articleContent: string;
  completedArticles: string[];
  weakTopics: string[];
  currentTrack: string;
}) {
  return `You are Swiftique, a personal iOS development tutor. You are helping a learner understand Swift and iOS development.

## Context
- The learner is currently reading: "${context.articleTitle}" in the "${context.currentTrack}" track
- They have completed these articles: ${context.completedArticles.join(", ") || "none yet"}
- Their weak areas (based on quiz scores): ${context.weakTopics.join(", ") || "none identified yet"}

## Current Article Content
${context.articleContent}

## Rules
- Match your explanations to the learner's current level based on what they've completed
- If they haven't covered a concept yet, explain it from scratch rather than assuming knowledge
- Use Swift code examples in your explanations
- Keep answers concise but thorough — prefer code over paragraphs
- If they highlight text and ask about it, focus your answer on that specific text
- Reference official Apple documentation when relevant
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
```

**Step 3: Create environment file template**

Create `.env.example`:
```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

Add `.env.local` to `.gitignore`.

**Step 4: Commit**

Run:
```bash
git add src/lib/ai/ .env.example
git commit -m "feat: add multi-provider AI abstraction with prompt templates"
```

---

### Task 12: Context-Aware AI Tutor Chat

**Files:**
- Create: `src/app/api/chat/route.ts`
- Create: `src/components/learning/ai-chat.tsx`
- Create: `src/components/learning/text-highlighter.tsx`

**Step 1: Create chat API route with streaming**

Create `src/app/api/chat/route.ts`:
```ts
import { NextRequest } from "next/server";
import { aiStream } from "@/lib/ai/providers";
import { tutorSystemPrompt } from "@/lib/ai/prompts";
import { db } from "@/db";
import { progress, quizResults, chatHistory } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    messages,
    articleTitle,
    articleContent,
    highlightedText,
    trackId,
    trackTitle,
  } = body;

  // Gather learner context
  const completedProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.completed, true));

  const completedArticles = completedProgress.map((p) => p.articleSlug);

  const allQuizResults = await db.select().from(quizResults);
  const weakTopics = allQuizResults
    .filter((r) => r.score < 0.7)
    .map((r) => r.articleSlug);

  const systemMessage = tutorSystemPrompt({
    articleTitle,
    articleContent,
    completedArticles,
    weakTopics,
    currentTrack: trackTitle,
  });

  const contextMessages = [
    { role: "system" as const, content: systemMessage },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
  ];

  // If there's highlighted text, prepend it to the last user message
  if (highlightedText && contextMessages.length > 0) {
    const lastMsg = contextMessages[contextMessages.length - 1];
    if (lastMsg.role === "user") {
      lastMsg.content = `[Highlighted text from article: "${highlightedText}"]\n\n${lastMsg.content}`;
    }
  }

  const result = aiStream("tutor", contextMessages);

  // Save to chat history (non-blocking)
  const lastUserMsg = messages[messages.length - 1];
  if (lastUserMsg) {
    db.insert(chatHistory)
      .values({
        articleSlug: articleTitle,
        highlightedText: highlightedText || null,
        role: "user",
        content: lastUserMsg.content,
      })
      .catch(() => {});
  }

  return result.toDataStreamResponse();
}
```

**Step 2: Create text highlighter component**

Create `src/components/learning/text-highlighter.tsx`:
```tsx
"use client";

import { useState, useCallback, useEffect } from "react";

interface TextHighlighterProps {
  children: React.ReactNode;
  onHighlight: (text: string) => void;
}

export function TextHighlighter({ children, onHighlight }: TextHighlighterProps) {
  const [showButton, setShowButton] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState("");

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 3) {
      const range = selection!.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setButtonPos({
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
      setSelectedText(text);
      setShowButton(true);
    } else {
      setShowButton(false);
      setSelectedText("");
    }
  }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-highlight-btn]")) {
        setShowButton(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div onMouseUp={handleMouseUp} className="relative">
      {children}
      {showButton && (
        <button
          data-highlight-btn
          onClick={() => {
            onHighlight(selectedText);
            setShowButton(false);
          }}
          className="fixed z-50 px-3 py-1.5 rounded-lg bg-[var(--accent)] text-white text-xs font-medium shadow-lg hover:opacity-90 transition-opacity -translate-x-1/2 -translate-y-full"
          style={{
            left: buttonPos.x,
            top: buttonPos.y + window.scrollY,
          }}
        >
          Ask AI about this
        </button>
      )}
    </div>
  );
}
```

**Step 3: Create AI chat panel**

Create `src/components/learning/ai-chat.tsx`:
```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useChat } from "ai/react";
import { cn } from "@/lib/utils";
import { X, Send, MessageCircle } from "lucide-react";

interface AIChatProps {
  articleTitle: string;
  articleContent: string;
  trackId: string;
  trackTitle: string;
  highlightedText?: string;
  onClose: () => void;
}

export function AIChat({
  articleTitle,
  articleContent,
  trackId,
  trackTitle,
  highlightedText,
  onClose,
}: AIChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useChat({
      api: "/api/chat",
      body: {
        articleTitle,
        articleContent,
        trackId,
        trackTitle,
        highlightedText,
      },
      initialMessages: highlightedText
        ? [
            {
              id: "highlight",
              role: "assistant",
              content: `I see you highlighted: *"${highlightedText}"*\n\nWhat would you like to know about this?`,
            },
          ]
        : [],
    });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="fixed right-0 top-0 h-screen w-96 bg-[var(--card)] border-l border-[var(--border)] flex flex-col z-50 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-[var(--accent)]" />
          <span className="font-medium text-sm">AI Tutor</span>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-[var(--muted)] transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "text-sm",
              msg.role === "user" ? "ml-8" : "mr-8"
            )}
          >
            <div
              className={cn(
                "rounded-lg px-4 py-3",
                msg.role === "user"
                  ? "bg-[var(--accent)] text-white"
                  : "bg-[var(--muted)]"
              )}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="mr-8">
            <div className="rounded-lg px-4 py-3 bg-[var(--muted)]">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce" />
                <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce delay-100" />
                <span className="w-2 h-2 rounded-full bg-[var(--muted-foreground)] animate-bounce delay-200" />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="p-4 border-t border-[var(--border)]"
      >
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask about this article..."
            className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--muted)] border border-[var(--border)] text-sm placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
```

**Step 4: Commit**

Run:
```bash
git add src/app/api/chat/ src/components/learning/ai-chat.tsx src/components/learning/text-highlighter.tsx
git commit -m "feat: add context-aware AI tutor with text highlighting"
```

---

### Task 13: Adaptive Learning — Gap Analysis

**Files:**
- Create: `src/app/api/gap-analysis/route.ts`
- Create: `src/lib/ai/gap-analyzer.ts`
- Create: `src/components/learning/recommendations.tsx`

**Step 1: Create gap analyzer**

Create `src/lib/ai/gap-analyzer.ts`:
```ts
import { aiGenerate } from "@/lib/ai/providers";
import { gapAnalysisPrompt } from "@/lib/ai/prompts";
import { db } from "@/db";
import { quizResults, progress } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface GapAnalysisResult {
  weakTopics: string[];
  recommendations: {
    topic: string;
    reason: string;
    suggestedResources: string[];
  }[];
  supplementaryArticleSuggestions: {
    title: string;
    focus: string;
    difficulty: string;
  }[];
}

export async function analyzeGaps(): Promise<GapAnalysisResult> {
  const allQuizResults = await db.select().from(quizResults);
  const completedProgress = await db
    .select()
    .from(progress)
    .where(eq(progress.completed, true));

  if (allQuizResults.length === 0) {
    return {
      weakTopics: [],
      recommendations: [],
      supplementaryArticleSuggestions: [],
    };
  }

  const quizData = allQuizResults.map((r) => ({
    topic: r.articleSlug,
    score: r.score,
  }));

  const completedArticles = completedProgress.map((p) => p.articleSlug);

  const prompt = gapAnalysisPrompt(quizData, completedArticles);
  const result = await aiGenerate("gap-analysis", prompt);

  try {
    return JSON.parse(result);
  } catch {
    return {
      weakTopics: [],
      recommendations: [],
      supplementaryArticleSuggestions: [],
    };
  }
}
```

**Step 2: Create gap analysis API**

Create `src/app/api/gap-analysis/route.ts`:
```ts
import { NextResponse } from "next/server";
import { analyzeGaps } from "@/lib/ai/gap-analyzer";

export async function GET() {
  const analysis = await analyzeGaps();
  return NextResponse.json(analysis);
}
```

**Step 3: Create recommendations component**

Create `src/components/learning/recommendations.tsx`:
```tsx
"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, BookOpen, ExternalLink } from "lucide-react";

interface Recommendation {
  topic: string;
  reason: string;
  suggestedResources: string[];
}

interface SupplementaryArticle {
  title: string;
  focus: string;
  difficulty: string;
}

interface GapAnalysis {
  weakTopics: string[];
  recommendations: Recommendation[];
  supplementaryArticleSuggestions: SupplementaryArticle[];
}

export function Recommendations() {
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gap-analysis")
      .then((r) => r.json())
      .then((data) => {
        setAnalysis(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (!analysis || analysis.weakTopics.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
        <h3 className="font-medium text-sm">Areas to Review</h3>
      </div>

      <div className="space-y-3">
        {analysis.recommendations.map((rec, i) => (
          <div key={i} className="text-sm">
            <p className="font-medium">{rec.topic}</p>
            <p className="text-[var(--muted-foreground)] mt-0.5">{rec.reason}</p>
            {rec.suggestedResources.length > 0 && (
              <div className="flex gap-2 mt-1">
                {rec.suggestedResources.map((url, j) => (
                  <a
                    key={j}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[var(--accent)] hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Resource {j + 1}
                  </a>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {analysis.supplementaryArticleSuggestions.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[var(--warning)]/20">
          <p className="text-xs font-medium text-[var(--muted-foreground)] mb-2">
            Suggested supplementary reading:
          </p>
          {analysis.supplementaryArticleSuggestions.map((article, i) => (
            <div key={i} className="flex items-start gap-2 text-sm mt-1">
              <BookOpen className="w-3.5 h-3.5 mt-0.5 text-[var(--accent)]" />
              <div>
                <span className="font-medium">{article.title}</span>
                <span className="text-[var(--muted-foreground)]"> — {article.focus}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

**Step 4: Commit**

Run:
```bash
git add src/lib/ai/gap-analyzer.ts src/app/api/gap-analysis/ src/components/learning/recommendations.tsx
git commit -m "feat: add adaptive learning with AI gap analysis and recommendations"
```

---

## Phase 6: Content Generation Pipeline

### Task 14: CLI Content Generator

**Files:**
- Create: `scripts/generate-content.ts`
- Create: `scripts/generate-quiz.ts`
- Create: `scripts/generate-flashcards.ts`
- Modify: `package.json` (add scripts)

**Step 1: Create content generation script**

Create `scripts/generate-content.ts`:
```ts
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const CURRICULUM: Record<string, { sectionId: string; sectionTitle: string; topics: { slug: string; title: string; description: string; order: number }[] }[]> = {
  "01-swift-fundamentals": [
    {
      sectionId: "1.1-getting-started",
      sectionTitle: "Getting Started",
      topics: [
        { slug: "01-about-swift", title: "About Swift", description: "Introduction to the Swift programming language", order: 1 },
        { slug: "02-xcode-setup", title: "Xcode & Swift Playgrounds", description: "Setting up your development environment", order: 2 },
      ],
    },
    {
      sectionId: "1.2-the-basics",
      sectionTitle: "The Basics",
      topics: [
        { slug: "03-constants-variables", title: "Constants & Variables", description: "Working with let, var, type annotations", order: 3 },
        { slug: "04-basic-types", title: "Basic Data Types", description: "Integers, floats, booleans, strings", order: 4 },
        { slug: "05-tuples-optionals", title: "Tuples & Optionals", description: "Compound values and handling nil", order: 5 },
        { slug: "06-type-safety", title: "Type Safety & Inference", description: "How Swift's type system keeps you safe", order: 6 },
      ],
    },
    // Additional sections follow the same pattern
    // The full curriculum from our syllabus would be listed here
  ],
  // Other tracks follow the same structure
};

async function generateArticle(
  trackId: string,
  sectionId: string,
  sectionTitle: string,
  topic: { slug: string; title: string; description: string; order: number }
) {
  console.log(`Generating: ${trackId}/${topic.slug}`);

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: `Write a comprehensive, beginner-friendly article about "${topic.title}" for learning Swift/iOS development.

Topic: ${topic.title}
Description: ${topic.description}

Requirements:
- Start with a clear introduction explaining what this concept is and why it matters
- Use practical Swift code examples throughout
- Include a summary table at the end
- Keep language clear and direct — no fluff
- Target audience: developer new to Swift (but not new to programming)
- Include edge cases and common mistakes
- Reference official Apple documentation where relevant

Format: MDX (Markdown with code blocks using \`\`\`swift)
Do NOT include frontmatter — it will be added separately.
Start directly with the # heading.`,
      },
    ],
  });

  const content = (message.content[0] as { text: string }).text;

  const frontmatter = `---
title: "${topic.title}"
description: "${topic.description}"
sectionId: "${sectionId}"
sectionTitle: "${sectionTitle}"
order: ${topic.order}
tags: []
videoResources: []
prerequisites: []
---

`;

  const dir = join(process.cwd(), "content/tracks", trackId);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(join(dir, `${topic.slug}.mdx`), frontmatter + content);
  console.log(`  ✓ Written: ${topic.slug}.mdx`);
}

async function main() {
  const trackId = process.argv[2];

  if (!trackId) {
    console.log("Usage: npx tsx scripts/generate-content.ts <track-id>");
    console.log("Available tracks:", Object.keys(CURRICULUM).join(", "));
    process.exit(1);
  }

  const sections = CURRICULUM[trackId];
  if (!sections) {
    console.error(`Unknown track: ${trackId}`);
    process.exit(1);
  }

  for (const section of sections) {
    for (const topic of section.topics) {
      await generateArticle(trackId, section.sectionId, section.sectionTitle, topic);
      // Rate limit
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  console.log("\nDone!");
}

main().catch(console.error);
```

**Step 2: Add scripts to package.json**

Add to `package.json` scripts:
```json
{
  "scripts": {
    "generate:content": "npx tsx scripts/generate-content.ts",
    "generate:quiz": "npx tsx scripts/generate-quiz.ts",
    "generate:flashcards": "npx tsx scripts/generate-flashcards.ts"
  }
}
```

**Step 3: Install tsx for running TypeScript scripts**

Run:
```bash
npm install -D tsx @anthropic-ai/sdk
```

**Step 4: Commit**

Run:
```bash
git add scripts/ package.json package-lock.json
git commit -m "feat: add CLI content generation pipeline"
```

---

## Phase 7: Integration & Polish

### Task 15: Wire Up Article Page with All Features

**Files:**
- Modify: `src/app/tracks/[trackId]/[slug]/page.tsx`
- Create: `src/components/learning/article-footer.tsx`

**Step 1: Create article footer with quiz, flashcards, progress, and recommendations**

Create `src/components/learning/article-footer.tsx`:
```tsx
"use client";

import { useState } from "react";
import { Quiz } from "./quiz";
import { FlashcardDeck } from "./flashcard-deck";
import { ProgressCheckbox } from "./progress-checkbox";
import { Recommendations } from "./recommendations";
import type { QuizQuestion } from "@/lib/quiz";

interface ArticleFooterProps {
  articleSlug: string;
  trackId: string;
  sectionId: string;
  quiz: { questions: QuizQuestion[] } | null;
  flashcards: { id: number; front: string; back: string }[] | null;
  nextArticle: { slug: string; title: string } | null;
  prevArticle: { slug: string; title: string } | null;
}

export function ArticleFooter({
  articleSlug,
  trackId,
  sectionId,
  quiz,
  flashcards,
  nextArticle,
  prevArticle,
}: ArticleFooterProps) {
  const [activeTab, setActiveTab] = useState<"quiz" | "flashcards" | null>(null);

  return (
    <footer className="mt-16 space-y-8 border-t border-[var(--border)] pt-8">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <ProgressCheckbox
          articleSlug={articleSlug}
          trackId={trackId}
          sectionId={sectionId}
        />
      </div>

      {/* Quiz & Flashcard tabs */}
      {(quiz || flashcards) && (
        <div>
          <div className="flex gap-2 mb-4">
            {quiz && (
              <button
                onClick={() => setActiveTab(activeTab === "quiz" ? null : "quiz")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "quiz"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Take Quiz ({quiz.questions.length} questions)
              </button>
            )}
            {flashcards && (
              <button
                onClick={() => setActiveTab(activeTab === "flashcards" ? null : "flashcards")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === "flashcards"
                    ? "bg-[var(--accent)] text-white"
                    : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
              >
                Flashcards ({flashcards.length} cards)
              </button>
            )}
          </div>

          {activeTab === "quiz" && quiz && (
            <Quiz questions={quiz.questions} articleSlug={articleSlug} />
          )}
          {activeTab === "flashcards" && flashcards && (
            <FlashcardDeck cards={flashcards} articleSlug={articleSlug} />
          )}
        </div>
      )}

      {/* Recommendations */}
      <Recommendations />

      {/* Navigation */}
      <div className="flex justify-between pt-4 border-t border-[var(--border)]">
        {prevArticle ? (
          <a
            href={`/tracks/${trackId}/${prevArticle.slug}`}
            className="text-sm text-[var(--muted-foreground)] hover:text-[var(--accent)] transition-colors"
          >
            ← {prevArticle.title}
          </a>
        ) : (
          <span />
        )}
        {nextArticle ? (
          <a
            href={`/tracks/${trackId}/${nextArticle.slug}`}
            className="text-sm text-[var(--accent)] hover:underline"
          >
            {nextArticle.title} →
          </a>
        ) : (
          <span />
        )}
      </div>
    </footer>
  );
}
```

**Step 2: Update article page to include all features**

Update `src/app/tracks/[trackId]/[slug]/page.tsx` to import and render `TextHighlighter`, `AIChat`, and `ArticleFooter`, passing the quiz and flashcard data from their respective loaders.

**Step 3: Verify full page renders**

Run: `npm run dev` — navigate to `/tracks/01-swift-fundamentals/02-the-basics`
Expected: Article renders with syntax highlighting, quiz, flashcards, progress checkbox, AI chat

**Step 4: Commit**

Run:
```bash
git add src/components/learning/article-footer.tsx src/app/tracks/
git commit -m "feat: integrate all learning features into article page"
```

---

### Task 16: Video Resources Embed

**Files:**
- Create: `src/components/learning/video-resources.tsx`

**Step 1: Create video resources sidebar/section**

Create `src/components/learning/video-resources.tsx`:
```tsx
import { ExternalLink, Play } from "lucide-react";

interface VideoResource {
  title: string;
  url: string;
  platform: string;
}

interface VideoResourcesProps {
  resources: VideoResource[];
}

export function VideoResources({ resources }: VideoResourcesProps) {
  if (!resources || resources.length === 0) return null;

  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] p-4 mb-8">
      <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
        <Play className="w-4 h-4 text-[var(--accent)]" />
        Video Resources
      </h3>
      <div className="space-y-2">
        {resources.map((video, i) => (
          <a
            key={i}
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-2 rounded-md hover:bg-[var(--muted)] transition-colors group"
          >
            <span className="text-sm text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">
              {video.title}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          </a>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

Run:
```bash
git add src/components/learning/video-resources.tsx
git commit -m "feat: add video resources component"
```

---

### Task 17: Typography & Prose Styling

**Files:**
- Install: `@tailwindcss/typography`
- Modify: `tailwind.config.ts`
- Modify: `src/app/globals.css`

**Step 1: Install typography plugin**

Run:
```bash
npm install @tailwindcss/typography
```

**Step 2: Configure dark prose styles**

Add to `src/app/globals.css` custom prose overrides for dark mode ensuring code blocks, tables, blockquotes, and links match the Swiftique dark theme.

**Step 3: Verify article typography**

Run: `npm run dev` — check article readability
Expected: Clean, readable articles with properly styled code, tables, and headings

**Step 4: Commit**

Run:
```bash
git add tailwind.config.ts src/app/globals.css package.json package-lock.json
git commit -m "feat: add typography styling for article prose"
```

---

### Task 18: Final Build Verification

**Step 1: Run full build**

Run: `npm run build`
Expected: Build succeeds with no errors

**Step 2: Run production server**

Run: `npm start`
Expected: App runs at localhost:3000

**Step 3: Manual smoke test**

- [ ] Home page shows 7 tracks
- [ ] Track page shows sections and articles
- [ ] Article renders with syntax highlighting
- [ ] Dark mode throughout
- [ ] Progress checkbox toggles
- [ ] Quiz renders and scores
- [ ] Flashcards flip and rate
- [ ] AI chat opens from text highlight
- [ ] Sidebar navigation works
- [ ] Mobile responsive sidebar

**Step 4: Final commit**

Run:
```bash
git add -A
git commit -m "feat: swiftique v1 — complete learning platform"
```

---

## Summary

| Phase | Tasks | What It Builds |
|-------|-------|----------------|
| 1. Foundation | Tasks 1-3 | Next.js project, dependencies, DB schema |
| 2. Content | Tasks 4-5 | MDX loader, renderer, sample articles |
| 3. Core UI | Tasks 6-7 | Sidebar, layout, article pages, routing |
| 4. Learning | Tasks 8-10 | Progress tracking, quizzes, flashcards |
| 5. AI | Tasks 11-13 | Multi-provider AI, tutor chat, gap analysis |
| 6. Pipeline | Task 14 | CLI content generation scripts |
| 7. Integration | Tasks 15-18 | Wire everything together, polish, verify |

**Total: 18 tasks, ~7 phases**

Each task is self-contained, testable, and commits independently. The feature-complete build includes all brainstormed features: adaptive learning, context-aware AI tutor, spaced repetition, quizzes, progress tracking, and the content generation pipeline.
