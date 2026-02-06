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
