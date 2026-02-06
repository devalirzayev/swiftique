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
