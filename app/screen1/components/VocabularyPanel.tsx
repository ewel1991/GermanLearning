"use client";

import { useEffect, useState } from "react";
import { extractVocabulary } from "@/app/actions/extractVocabulary";
import {
  CURRENT_CONTENT_EVENT,
  readCurrentContent,
  type CurrentTopic,
} from "@/lib/currentContent";
import type { VocabExtractionItem } from "@/lib/types";
import VocabCard from "./VocabCard";

export default function VocabularyPanel() {
  const [article, setArticle] = useState<string | null>(null);
  const [topic, setTopic] = useState<CurrentTopic | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<VocabExtractionItem[] | null>(null);

  useEffect(() => {
    function sync() {
      const current = readCurrentContent();
      setArticle(current.article);
      setTopic(current.topic);
    }
    sync();
    window.addEventListener(CURRENT_CONTENT_EVENT, sync);
    return () => window.removeEventListener(CURRENT_CONTENT_EVENT, sync);
  }, []);

  async function handleExtract() {
    if (!article) return;
    setLoading(true);
    setError(null);
    setItems(null);

    const result = await extractVocabulary(article);
    if ("error" in result) {
      setError(result.error);
    } else {
      setItems(result);
    }
    setLoading(false);
  }

  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">Vokabular-Extraktion</h2>

      <button
        type="button"
        onClick={handleExtract}
        disabled={!article || loading}
        className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Extrahiert…" : "Vokabular extrahieren"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {items && topic && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, index) => (
            <VocabCard key={`${item.term}-${index}`} item={item} topic={topic} />
          ))}
        </div>
      )}
    </section>
  );
}
