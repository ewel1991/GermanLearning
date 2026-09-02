"use client";

import { useEffect, useState } from "react";
import { extractVocabulary } from "@/app/actions/extractVocabulary";
import { generateVocabularyForTopic } from "@/app/actions/generateVocabularyForTopic";
import {
  CURRENT_CONTENT_EVENT,
  readCurrentContent,
  type ContentSource,
  type CurrentTopic,
} from "@/lib/currentContent";
import { useSession } from "@/app/context/SessionContext";
import VocabCard from "./VocabCard";

export default function VocabularyPanel() {
  // Extracted items live in SessionContext so they survive navigating away
  // and back; article/topic/source stay local, synced from localStorage —
  // see lib/currentContent.ts.
  const { vocab, setVocab } = useSession();
  const [article, setArticle] = useState<string | null>(null);
  const [topic, setTopic] = useState<CurrentTopic | null>(null);
  const [source, setSource] = useState<ContentSource>("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      const current = readCurrentContent();
      setArticle(current.article);
      setTopic(current.topic);
      setSource(current.source);
    }
    sync();
    window.addEventListener(CURRENT_CONTENT_EVENT, sync);
    return () => window.removeEventListener(CURRENT_CONTENT_EVENT, sync);
  }, []);

  const ready = source === "topic" ? !!topic : !!article;

  async function handleExtract() {
    if (!ready || !topic) return;
    setLoading(true);
    setError(null);
    setVocab({ items: null });

    const result =
      source === "topic"
        ? await generateVocabularyForTopic(topic.title)
        : await extractVocabulary(article!);

    if ("error" in result) {
      setError(result.error);
    } else {
      setVocab({ items: result });
    }
    setLoading(false);
  }

  return (
    <section>
      <h2 className="mb-3 font-display text-lg font-bold text-fg">
        3. Vokabular
      </h2>

      <div className="rounded-2xl border border-white/10 bg-surface p-4 md:p-5">
        <button
          type="button"
          onClick={handleExtract}
          disabled={!ready || loading}
          className="w-full rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:opacity-40 sm:w-auto"
        >
          {loading
            ? "Extrahiert…"
            : source === "topic"
              ? "Vokabular zum Thema generieren"
              : "Vokabular extrahieren"}
        </button>

        {source === "topic" && (
          <p className="mt-2 text-xs text-muted">
            Themenbasiert generiert (kein Transkript verfügbar) — nicht aus dem
            konkreten Podcast-Inhalt extrahiert.
          </p>
        )}

        {error && <p className="mt-2 text-sm text-rust">{error}</p>}

        {vocab.items && topic && (
          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {vocab.items.map((item, index) => (
              <VocabCard key={`${item.term}-${index}`} item={item} topic={topic} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
