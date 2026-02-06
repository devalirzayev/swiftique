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
