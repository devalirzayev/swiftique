"use client";

import ReactMarkdown from "react-markdown";

export function ChatMarkdown({ content }: { content: string }) {
  return (
    <div className="chat-markdown">
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold text-[var(--foreground)]">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <code className="block my-2 p-3 rounded-md bg-black/30 text-xs font-mono overflow-x-auto whitespace-pre">
                  {children}
                </code>
              );
            }
            return (
              <code className="rounded bg-black/30 px-1 py-0.5 text-xs font-mono text-[var(--accent-foreground)]">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <>{children}</>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li>{children}</li>,
          h1: ({ children }) => <p className="font-bold text-base mb-1">{children}</p>,
          h2: ({ children }) => <p className="font-bold text-sm mb-1">{children}</p>,
          h3: ({ children }) => <p className="font-semibold text-sm mb-1">{children}</p>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)] hover:underline">
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[var(--accent)] pl-3 my-2 text-[var(--muted-foreground)]">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2 rounded border border-white/10">
              <table className="w-full text-xs">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="px-2 py-1.5 text-left font-semibold bg-black/20 border-b border-white/10">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-2 py-1.5 border-t border-white/5">{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
