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
