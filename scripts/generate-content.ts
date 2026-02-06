import { config } from "dotenv";
config({ path: ".env.local" });

import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join } from "path";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

type Section = { sectionId: string; sectionTitle: string; topics: { slug: string; title: string; description: string; order: number }[] };

const CURRICULUM: Record<string, Section[]> = {
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
    {
      sectionId: "1.3-operators-strings",
      sectionTitle: "Operators & Strings",
      topics: [
        { slug: "07-basic-operators", title: "Basic Operators", description: "Arithmetic, comparison, logical, and ternary operators", order: 7 },
        { slug: "08-strings-characters", title: "Strings & Characters", description: "String interpolation, Unicode, substrings, and manipulation", order: 8 },
      ],
    },
    {
      sectionId: "1.4-collections",
      sectionTitle: "Collection Types",
      topics: [
        { slug: "09-arrays", title: "Arrays", description: "Ordered collections with typed elements", order: 9 },
        { slug: "10-dictionaries-sets", title: "Dictionaries & Sets", description: "Key-value pairs and unique unordered collections", order: 10 },
      ],
    },
    {
      sectionId: "1.5-control-flow",
      sectionTitle: "Control Flow",
      topics: [
        { slug: "11-conditionals", title: "Conditionals", description: "if, else, switch statements and pattern matching", order: 11 },
        { slug: "12-loops", title: "Loops", description: "for-in, while, repeat-while loops and control transfer", order: 12 },
        { slug: "13-guard-early-exit", title: "Guard & Early Exit", description: "Using guard for cleaner control flow", order: 13 },
      ],
    },
    {
      sectionId: "1.6-functions-closures",
      sectionTitle: "Functions & Closures",
      topics: [
        { slug: "14-functions", title: "Functions", description: "Defining, calling, parameter labels, return values, and variadic parameters", order: 14 },
        { slug: "15-closures", title: "Closures", description: "Closure expressions, trailing closures, capturing values, and escaping closures", order: 15 },
      ],
    },
    {
      sectionId: "1.7-enums-structs-classes",
      sectionTitle: "Enumerations, Structures & Classes",
      topics: [
        { slug: "16-enumerations", title: "Enumerations", description: "Defining enums, associated values, raw values, and recursive enums", order: 16 },
        { slug: "17-structures-classes", title: "Structures & Classes", description: "Value vs reference types, properties, methods, and initializers", order: 17 },
        { slug: "18-properties-methods", title: "Properties & Methods", description: "Stored, computed, lazy properties, static methods, and subscripts", order: 18 },
      ],
    },
    {
      sectionId: "1.8-protocols-generics",
      sectionTitle: "Protocols & Generics",
      topics: [
        { slug: "19-protocols", title: "Protocols", description: "Defining protocols, conformance, delegation, and protocol extensions", order: 19 },
        { slug: "20-generics", title: "Generics", description: "Generic functions, types, constraints, and associated types", order: 20 },
        { slug: "21-extensions", title: "Extensions", description: "Adding functionality to existing types with extensions", order: 21 },
      ],
    },
    {
      sectionId: "1.9-error-handling-concurrency",
      sectionTitle: "Error Handling & Concurrency",
      topics: [
        { slug: "22-error-handling", title: "Error Handling", description: "Throwing, catching, do-try-catch, and Result type", order: 22 },
        { slug: "23-optionals-deep-dive", title: "Optionals Deep Dive", description: "Optional chaining, nil-coalescing, implicitly unwrapped optionals", order: 23 },
        { slug: "24-concurrency", title: "Swift Concurrency", description: "async/await, Task, actors, structured concurrency, and Sendable", order: 24 },
      ],
    },
    {
      sectionId: "1.10-memory-advanced",
      sectionTitle: "Memory & Advanced Topics",
      topics: [
        { slug: "25-arc-memory", title: "ARC & Memory Management", description: "Automatic Reference Counting, strong/weak/unowned references, and retain cycles", order: 25 },
        { slug: "26-access-control", title: "Access Control", description: "open, public, internal, fileprivate, private access levels", order: 26 },
        { slug: "27-type-casting-opaque", title: "Type Casting & Opaque Types", description: "is, as, any, some, and opaque return types", order: 27 },
      ],
    },
  ],
  "02-swiftui-essentials": [
    {
      sectionId: "2.1-introduction",
      sectionTitle: "Introduction to SwiftUI",
      topics: [
        { slug: "01-what-is-swiftui", title: "What is SwiftUI?", description: "Declarative UI framework, how it differs from UIKit", order: 1 },
        { slug: "02-swiftui-app-lifecycle", title: "App Lifecycle", description: "The @main entry point, App protocol, Scene, and WindowGroup", order: 2 },
        { slug: "03-views-modifiers", title: "Views & Modifiers", description: "Building blocks of SwiftUI — View protocol and modifier chains", order: 3 },
      ],
    },
    {
      sectionId: "2.2-layout",
      sectionTitle: "Layout & Composition",
      topics: [
        { slug: "04-stacks-spacers", title: "Stacks & Spacers", description: "HStack, VStack, ZStack, Spacer for layout composition", order: 4 },
        { slug: "05-grids-scrollviews", title: "Grids & ScrollViews", description: "LazyVGrid, LazyHGrid, ScrollView for scrollable layouts", order: 5 },
        { slug: "06-frames-alignment", title: "Frames & Alignment", description: "Frame modifiers, alignment guides, and GeometryReader", order: 6 },
      ],
    },
    {
      sectionId: "2.3-common-views",
      sectionTitle: "Common Views & Controls",
      topics: [
        { slug: "07-text-images", title: "Text & Images", description: "Text formatting, SF Symbols, Image views, and AsyncImage", order: 7 },
        { slug: "08-buttons-controls", title: "Buttons & Controls", description: "Button, Toggle, Slider, Stepper, Picker, and DatePicker", order: 8 },
        { slug: "09-textfield-forms", title: "TextField & Forms", description: "Text input, SecureField, Form, Section, and validation patterns", order: 9 },
        { slug: "10-lists-foreach", title: "Lists & ForEach", description: "List, ForEach, swipe actions, sections, and dynamic content", order: 10 },
      ],
    },
    {
      sectionId: "2.4-state-management",
      sectionTitle: "State Management",
      topics: [
        { slug: "11-state-binding", title: "@State & @Binding", description: "Local state management and two-way data flow", order: 11 },
        { slug: "12-observable", title: "@Observable & @Environment", description: "Observable macro, environment values, and shared state", order: 12 },
        { slug: "13-state-patterns", title: "State Management Patterns", description: "When to use each property wrapper, data flow best practices", order: 13 },
      ],
    },
    {
      sectionId: "2.5-navigation",
      sectionTitle: "Navigation",
      topics: [
        { slug: "14-navigation-stack", title: "NavigationStack", description: "NavigationStack, NavigationLink, navigation paths, and programmatic navigation", order: 14 },
        { slug: "15-tabview-sheets", title: "TabView & Sheets", description: "Tab-based navigation, modal sheets, popovers, and alerts", order: 15 },
      ],
    },
    {
      sectionId: "2.6-styling",
      sectionTitle: "Styling & Theming",
      topics: [
        { slug: "16-colors-shapes", title: "Colors & Shapes", description: "Color, Gradient, Shape protocol, Path, and custom shapes", order: 16 },
        { slug: "17-styling-views", title: "Styling Views", description: "ViewModifiers, ButtonStyle, custom styles, and conditional styling", order: 17 },
        { slug: "18-dark-mode", title: "Dark Mode & Dynamic Type", description: "Color scheme adaptation, accessibility, and dynamic type support", order: 18 },
      ],
    },
  ],
  "03-swiftui-advanced": [
    {
      sectionId: "3.1-animations",
      sectionTitle: "Animations & Transitions",
      topics: [
        { slug: "01-basic-animations", title: "Basic Animations", description: "withAnimation, implicit animations, Animation curves and timing", order: 1 },
        { slug: "02-transitions", title: "Transitions", description: "AnyTransition, custom transitions, matched geometry effect", order: 2 },
        { slug: "03-advanced-animations", title: "Advanced Animations", description: "Spring animations, keyframes, phaseAnimator, and AnimatableModifier", order: 3 },
      ],
    },
    {
      sectionId: "3.2-gestures",
      sectionTitle: "Gestures & Interactions",
      topics: [
        { slug: "04-gesture-basics", title: "Gesture Basics", description: "TapGesture, LongPressGesture, DragGesture, and gesture composition", order: 4 },
        { slug: "05-advanced-gestures", title: "Advanced Gestures", description: "MagnificationGesture, RotationGesture, simultaneous and sequenced gestures", order: 5 },
      ],
    },
    {
      sectionId: "3.3-custom-views",
      sectionTitle: "Custom Views & Graphics",
      topics: [
        { slug: "06-canvas-drawing", title: "Canvas & Drawing", description: "Canvas view, Path drawing, and custom shape rendering", order: 6 },
        { slug: "07-preference-keys", title: "PreferenceKey & Anchors", description: "Communicating up the view hierarchy with PreferenceKey", order: 7 },
        { slug: "08-view-builders", title: "ViewBuilder & Result Builders", description: "Creating custom container views with @ViewBuilder", order: 8 },
      ],
    },
    {
      sectionId: "3.4-advanced-patterns",
      sectionTitle: "Advanced Patterns",
      topics: [
        { slug: "09-environment-custom", title: "Custom Environment Values", description: "Creating and using custom environment keys", order: 9 },
        { slug: "10-focus-keyboard", title: "Focus & Keyboard Management", description: "@FocusState, focus management, and keyboard handling", order: 10 },
        { slug: "11-search-toolbar", title: "Search & Toolbars", description: "Searchable modifier, toolbar, and toolbar items", order: 11 },
        { slug: "12-performance", title: "SwiftUI Performance", description: "Avoiding unnecessary redraws, Equatable views, and profiling", order: 12 },
      ],
    },
  ],
  "04-data-networking": [
    {
      sectionId: "4.1-networking",
      sectionTitle: "Networking",
      topics: [
        { slug: "01-urlsession-basics", title: "URLSession Basics", description: "Making HTTP requests, GET/POST, and URLRequest configuration", order: 1 },
        { slug: "02-async-networking", title: "Async Networking", description: "Using async/await with URLSession, error handling, and timeouts", order: 2 },
        { slug: "03-rest-apis", title: "Working with REST APIs", description: "Headers, authentication, pagination, and API client patterns", order: 3 },
      ],
    },
    {
      sectionId: "4.2-json-codable",
      sectionTitle: "JSON & Codable",
      topics: [
        { slug: "04-codable", title: "Codable Protocol", description: "Encoding and decoding JSON with Codable, CodingKeys, and custom strategies", order: 4 },
        { slug: "05-advanced-codable", title: "Advanced Codable", description: "Nested containers, polymorphic decoding, and custom decoders", order: 5 },
      ],
    },
    {
      sectionId: "4.3-persistence",
      sectionTitle: "Data Persistence",
      topics: [
        { slug: "06-userdefaults", title: "UserDefaults & AppStorage", description: "Simple key-value storage and SwiftUI integration", order: 6 },
        { slug: "07-file-system", title: "File System & Documents", description: "Reading and writing files, document directory, and FileManager", order: 7 },
        { slug: "08-swiftdata", title: "SwiftData", description: "Modern data persistence with @Model, ModelContainer, and queries", order: 8 },
        { slug: "09-swiftdata-advanced", title: "SwiftData Advanced", description: "Relationships, migrations, CloudKit sync, and background operations", order: 9 },
      ],
    },
    {
      sectionId: "4.4-combine-observation",
      sectionTitle: "Combine & Observation",
      topics: [
        { slug: "10-combine-basics", title: "Combine Basics", description: "Publishers, subscribers, operators, and reactive data flow", order: 10 },
        { slug: "11-observation-framework", title: "Observation Framework", description: "@Observable macro, tracking changes, and migration from ObservableObject", order: 11 },
      ],
    },
  ],
  "05-app-architecture": [
    {
      sectionId: "5.1-design-patterns",
      sectionTitle: "Design Patterns",
      topics: [
        { slug: "01-mvvm", title: "MVVM Pattern", description: "Model-View-ViewModel architecture in SwiftUI apps", order: 1 },
        { slug: "02-dependency-injection", title: "Dependency Injection", description: "Managing dependencies with protocols, environment, and containers", order: 2 },
        { slug: "03-coordinator-pattern", title: "Navigation Patterns", description: "Coordinator pattern, router pattern, and deep linking", order: 3 },
        { slug: "04-repository-pattern", title: "Repository Pattern", description: "Abstracting data access behind clean interfaces", order: 4 },
      ],
    },
    {
      sectionId: "5.2-testing",
      sectionTitle: "Testing",
      topics: [
        { slug: "05-unit-testing", title: "Unit Testing", description: "XCTest basics, writing effective tests, and test organization", order: 5 },
        { slug: "06-testing-swiftui", title: "Testing SwiftUI Views", description: "ViewInspector, snapshot testing, and UI testing with XCUITest", order: 6 },
        { slug: "07-mocking-stubs", title: "Mocking & Test Doubles", description: "Protocols for testing, mock objects, and test fixtures", order: 7 },
      ],
    },
    {
      sectionId: "5.3-debugging-profiling",
      sectionTitle: "Debugging & Profiling",
      topics: [
        { slug: "08-xcode-debugger", title: "Xcode Debugger", description: "Breakpoints, LLDB commands, view debugging, and memory graph", order: 8 },
        { slug: "09-instruments", title: "Instruments & Profiling", description: "Time Profiler, Allocations, Leaks, and performance optimization", order: 9 },
        { slug: "10-logging", title: "Logging & OSLog", description: "Unified logging with os.Logger, log levels, and signposts", order: 10 },
      ],
    },
    {
      sectionId: "5.4-project-organization",
      sectionTitle: "Project Organization",
      topics: [
        { slug: "11-swift-packages", title: "Swift Packages", description: "Creating and consuming Swift packages with SPM", order: 11 },
        { slug: "12-modularization", title: "App Modularization", description: "Splitting apps into modules, feature modules, and shared libraries", order: 12 },
      ],
    },
  ],
  "06-platform-features": [
    {
      sectionId: "6.1-system-frameworks",
      sectionTitle: "System Frameworks",
      topics: [
        { slug: "01-notifications", title: "Push & Local Notifications", description: "UNUserNotificationCenter, notification content, and scheduling", order: 1 },
        { slug: "02-mapkit", title: "MapKit & Location", description: "Maps, annotations, CoreLocation, and geofencing", order: 2 },
        { slug: "03-camera-photos", title: "Camera & PhotosPicker", description: "Capturing photos, PHPickerViewController, and image handling", order: 3 },
      ],
    },
    {
      sectionId: "6.2-extensions-widgets",
      sectionTitle: "Extensions & Widgets",
      topics: [
        { slug: "04-widgetkit", title: "WidgetKit", description: "Building home screen widgets with timelines and configurations", order: 4 },
        { slug: "05-app-intents", title: "App Intents & Shortcuts", description: "Siri integration, App Intents framework, and Shortcuts", order: 5 },
        { slug: "06-share-extensions", title: "Share & Action Extensions", description: "Building share sheets and action extensions", order: 6 },
      ],
    },
    {
      sectionId: "6.3-monetization",
      sectionTitle: "Monetization",
      topics: [
        { slug: "07-storekit", title: "StoreKit 2", description: "In-app purchases, subscriptions, and transaction handling", order: 7 },
        { slug: "08-ads-monetization", title: "Ad Integration", description: "AdMob, SKAdNetwork, and monetization strategies", order: 8 },
      ],
    },
    {
      sectionId: "6.4-platform-specific",
      sectionTitle: "Platform-Specific Features",
      topics: [
        { slug: "09-core-haptics", title: "Haptics & Feedback", description: "Core Haptics, UIFeedbackGenerator, and tactile feedback", order: 9 },
        { slug: "10-accessibility", title: "Accessibility", description: "VoiceOver, Dynamic Type, accessibility labels, and inclusive design", order: 10 },
        { slug: "11-localization", title: "Localization", description: "String catalogs, locale formatting, and right-to-left support", order: 11 },
      ],
    },
  ],
  "07-production-deployment": [
    {
      sectionId: "7.1-app-store-prep",
      sectionTitle: "App Store Preparation",
      topics: [
        { slug: "01-app-icons-launch", title: "App Icons & Launch Screen", description: "Asset catalogs, icon guidelines, and launch screen configuration", order: 1 },
        { slug: "02-app-store-connect", title: "App Store Connect", description: "Setting up your app listing, metadata, screenshots, and pricing", order: 2 },
        { slug: "03-certificates-profiles", title: "Certificates & Provisioning", description: "Code signing, certificates, provisioning profiles, and entitlements", order: 3 },
      ],
    },
    {
      sectionId: "7.2-testing-distribution",
      sectionTitle: "Testing & Distribution",
      topics: [
        { slug: "04-testflight", title: "TestFlight", description: "Beta testing with internal and external testers", order: 4 },
        { slug: "05-app-review", title: "App Review Guidelines", description: "Common rejection reasons, guidelines compliance, and appeals", order: 5 },
      ],
    },
    {
      sectionId: "7.3-ci-cd",
      sectionTitle: "CI/CD & Automation",
      topics: [
        { slug: "06-xcode-cloud", title: "Xcode Cloud", description: "Automated builds, testing, and deployment with Xcode Cloud", order: 6 },
        { slug: "07-github-actions", title: "GitHub Actions for iOS", description: "Setting up CI/CD pipelines with GitHub Actions and Fastlane", order: 7 },
      ],
    },
    {
      sectionId: "7.4-post-launch",
      sectionTitle: "Post-Launch",
      topics: [
        { slug: "08-analytics-crashes", title: "Analytics & Crash Reporting", description: "Firebase Analytics, Crashlytics, and monitoring app health", order: 8 },
        { slug: "09-app-updates", title: "App Updates & Versioning", description: "Semantic versioning, phased releases, and backward compatibility", order: 9 },
        { slug: "10-growth-aso", title: "Growth & ASO", description: "App Store Optimization, ratings prompts, and user acquisition", order: 10 },
      ],
    },
  ],
};

// --- Progress bar ---

function progressBar(current: number, total: number, width = 30): string {
  const pct = Math.round((current / total) * 100);
  const filled = Math.round((current / total) * width);
  const bar = "\u2588".repeat(filled) + "\u2591".repeat(width - filled);
  return `[${bar}] ${pct}% (${current}/${total})`;
}

// --- Count total topics ---

function countTopics(trackIds: string[]): number {
  let total = 0;
  for (const id of trackIds) {
    for (const section of CURRICULUM[id]) {
      total += section.topics.length;
    }
  }
  return total;
}

// --- Article generation ---

async function generateArticle(
  trackId: string,
  sectionId: string,
  sectionTitle: string,
  topic: { slug: string; title: string; description: string; order: number }
) {
  const dir = join(process.cwd(), "content/tracks", trackId);
  const filePath = join(dir, `${topic.slug}.mdx`);

  // Skip if already exists
  if (existsSync(filePath)) {
    return "skipped";
  }

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

  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, frontmatter + content);
  return "generated";
}

// --- Main ---

async function main() {
  const filterTrackId = process.argv[2];

  const trackIds = filterTrackId ? [filterTrackId] : Object.keys(CURRICULUM);

  // Validate
  for (const id of trackIds) {
    if (!CURRICULUM[id]) {
      console.error(`Unknown track: ${id}`);
      console.error("Available tracks:", Object.keys(CURRICULUM).join(", "));
      process.exit(1);
    }
  }

  const totalTopics = countTopics(trackIds);
  let completed = 0;
  let generated = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`\nSwiftique Content Generator`);
  console.log(`===========================`);
  console.log(`Tracks:  ${trackIds.length}`);
  console.log(`Topics:  ${totalTopics}`);
  console.log(`\nExisting articles will be skipped.\n`);

  for (const trackId of trackIds) {
    const sections = CURRICULUM[trackId];
    const trackName = trackId.replace(/^\d+-/, "").replace(/-/g, " ");
    console.log(`\n-- ${trackName} --\n`);

    for (const section of sections) {
      for (const topic of section.topics) {
        process.stdout.write(`  ${progressBar(completed, totalTopics)}  ${topic.title}...`);

        try {
          const result = await generateArticle(trackId, section.sectionId, section.sectionTitle, topic);
          if (result === "skipped") {
            skipped++;
            process.stdout.write("\r\x1b[K");
            console.log(`  [skip] ${topic.title} (already exists)`);
          } else {
            generated++;
            process.stdout.write("\r\x1b[K");
            console.log(`  [done] ${topic.title}`);
          }
        } catch (err) {
          failed++;
          process.stdout.write("\r\x1b[K");
          console.error(`  [FAIL] ${topic.title}: ${err instanceof Error ? err.message : err}`);
        }

        completed++;

        // Rate limit between API calls
        if (generated > 0) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      }
    }
  }

  console.log(`\n===========================`);
  console.log(`${progressBar(completed, totalTopics)}`);
  console.log(`Generated: ${generated}  Skipped: ${skipped}  Failed: ${failed}`);
  console.log(`Done!\n`);
}

main().catch(console.error);
