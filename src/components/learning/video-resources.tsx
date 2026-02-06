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
