"use client";

import { useState } from "react";
import type { ArticleResult } from "@/lib/types";

const PREVIEW_LENGTH = 1500;

export default function ArticleCard({ article }: { article: ArticleResult }) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = article.preview.length > PREVIEW_LENGTH;
  const shownText = expanded
    ? article.preview
    : article.preview.slice(0, PREVIEW_LENGTH);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <h2 className="font-display text-lg font-bold text-fg">
        {article.title}
      </h2>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue hover:underline"
        >
          {article.url}
        </a>
        {article.published_date && <span>· {article.published_date}</span>}
      </div>

      <div className="mt-3 max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-surface2 p-3 text-sm leading-relaxed text-fg">
        {shownText}
        {!expanded && isTruncated && "…"}
      </div>

      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-medium text-blue hover:underline"
        >
          {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
        </button>
      )}
    </div>
  );
}
