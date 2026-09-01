"use client";

import { useState } from "react";
import type { ArticleResult } from "@/lib/types";

const PREVIEW_LENGTH = 1500;

export default function ArticleCard({ article }: { article: ArticleResult }) {
  const [expanded, setExpanded] = useState(false);
  const isTruncated = article.content.length > PREVIEW_LENGTH;
  const shownText = expanded
    ? article.content
    : article.content.slice(0, PREVIEW_LENGTH);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">{article.title}</h2>
      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {article.url}
        </a>
        {article.published_date && <span>· {article.published_date}</span>}
      </div>

      <div className="mt-3 max-h-[60vh] overflow-y-auto rounded border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed">
        {shownText}
        {!expanded && isTruncated && "…"}
      </div>

      {isTruncated && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="mt-2 text-sm font-medium text-blue-600 hover:underline"
        >
          {expanded ? "Weniger anzeigen" : "Mehr anzeigen"}
        </button>
      )}
    </div>
  );
}
