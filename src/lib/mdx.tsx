import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { createHighlighter } from "shiki";
import { CopyButton } from "@/components/ui/copy-button";

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: ["tokyo-night"],
      langs: ["swift", "bash", "json", "typescript", "yaml", "shell", "text", "xml"],
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
        remarkPlugins: [remarkGfm],
        rehypePlugins: [],
      },
    },
    components: {
      pre: ({ children, ...props }: React.ComponentPropsWithoutRef<"pre">) => {
        // Extract raw code text for the copy button
        let rawCode = "";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const child = children as any;
        if (child?.props?.children) {
          rawCode = String(child.props.children).trim();
        }

        return (
          <div className="group relative">
            <CopyButton text={rawCode} />
            <pre
              className="overflow-x-auto rounded-lg border border-[#1a1b2e] bg-[#1a1b2e] p-4 text-sm leading-relaxed"
              {...props}
            >
              {children}
            </pre>
          </div>
        );
      },
      code: ({ children, className, ...props }: React.ComponentPropsWithoutRef<"code">) => {
        const match = /language-(\w+)/.exec(className || "");
        if (match) {
          const lang = match[1];
          const html = highlighter.codeToHtml(String(children).trim(), {
            lang,
            theme: "tokyo-night",
          });
          return <div dangerouslySetInnerHTML={{ __html: html }} />;
        }
        return (
          <code
            className="rounded bg-[var(--muted)] px-1.5 py-0.5 text-sm font-mono text-[var(--accent-foreground)]"
            {...props}
          >
            {children}
          </code>
        );
      },
      table: ({ children, ...props }: React.ComponentPropsWithoutRef<"table">) => (
        <div className="not-prose overflow-x-auto my-6 rounded-lg border border-[var(--border)]">
          <table className="w-full text-sm" {...props}>
            {children}
          </table>
        </div>
      ),
      thead: ({ children, ...props }: React.ComponentPropsWithoutRef<"thead">) => (
        <thead className="bg-[var(--muted)] border-b border-[var(--border)]" {...props}>
          {children}
        </thead>
      ),
      th: ({ children, ...props }: React.ComponentPropsWithoutRef<"th">) => (
        <th className="px-4 py-2.5 text-left font-semibold text-[var(--foreground)]" {...props}>
          {children}
        </th>
      ),
      td: ({ children, ...props }: React.ComponentPropsWithoutRef<"td">) => (
        <td className="px-4 py-2.5 border-t border-[var(--border)] text-[var(--muted-foreground)]" {...props}>
          {children}
        </td>
      ),
      tr: ({ children, ...props }: React.ComponentPropsWithoutRef<"tr">) => (
        <tr className="hover:bg-[var(--muted)]/50 transition-colors" {...props}>
          {children}
        </tr>
      ),
    },
  });

  return content;
}
