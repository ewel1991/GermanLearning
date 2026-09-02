"use client";

import { useState } from "react";
import { searchArticle } from "@/app/actions/searchArticle";
import { searchYouTube } from "@/app/actions/searchYouTube";
import { searchPodcast } from "@/app/actions/searchPodcast";
import { saveCurrentContent } from "@/lib/currentContent";
import { useSession } from "@/app/context/SessionContext";
import type { Topic } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import YouTubeSearch from "./YouTubeSearch";
import PodcastSearch from "./PodcastSearch";

// Fixed display order for the topic dropdown's <optgroup>s — must match the
// category strings in data/topics.json exactly.
const CATEGORY_ORDER = [
  "Alltag & Gewohnheiten",
  "Arbeit & Karriere",
  "Technologie & Innovation",
  "Reisen & Architektur",
  "Gesundheit & Wellness",
  "Kunst & Unterhaltung",
  "Gesellschaft & Philosophie",
];

export default function ContentViewer({ topics }: { topics: Topic[] }) {
  // Search/topic/result state lives in SessionContext, not useState, so it
  // survives navigating to Grammatik/Tutor and back — only the in-flight
  // request state below (loading/error/OCR progress) resets on remount.
  const { vocab, setVocab } = useSession();
  const { contentType, article, videos, podcasts } = vocab;
  const selectedTopicId = vocab.selectedTopicId ?? topics[0]?.id ?? null;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;

  async function handleSearch() {
    if (!selectedTopic) return;
    setLoading(true);
    setError(null);
    setVocab({ article: null, videos: null, podcasts: null, items: null });

    if (contentType === "article") {
      const result = await searchArticle(selectedTopic.title);
      if ("error" in result) {
        setError(result.error);
      } else {
        setVocab({ article: result });
        saveCurrentContent(result.content, {
          id: selectedTopic.id,
          title: selectedTopic.title,
        });
      }
    } else if (contentType === "youtube") {
      const result = await searchYouTube(selectedTopic.title);
      if ("error" in result) {
        setError(result.error);
      } else {
        setVocab({ videos: result });
      }
    } else {
      const result = await searchPodcast(selectedTopic.title);
      if ("error" in result) {
        setError(result.error);
      } else {
        setVocab({ podcasts: result });
        // No transcript exists for a podcast episode — flag the topic itself
        // as the source, so Vokabular/Grammatik generate for it instead.
        saveCurrentContent(
          "",
          { id: selectedTopic.id, title: selectedTopic.title },
          "topic"
        );
      }
    }

    setLoading(false);
  }

  async function handleTextFile(file: File) {
    const text = await file.text();
    const topic = selectedTopic ?? { id: 0, title: "Hochgeladene Datei" };
    saveCurrentContent(text, { id: topic.id, title: topic.title });
  }

  async function handleImageFile(file: File) {
    setOcrProgress(0);
    // Loaded dynamically — Tesseract's worker code doesn't run server-side.
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker("deu", 1, {
      logger: (message) => {
        if (message.status === "recognizing text") {
          setOcrProgress(Math.round(message.progress * 100));
        }
      },
    });
    const {
      data: { text },
    } = await worker.recognize(file);
    await worker.terminate();

    const topic = selectedTopic ?? { id: 0, title: "Hochgeladene Datei" };
    saveCurrentContent(text, { id: topic.id, title: topic.title });
    setOcrProgress(null);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      await handleTextFile(file);
    } else {
      await handleImageFile(file);
    }
    event.target.value = "";
  }

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-surface p-4 md:p-5">
        <h2 className="mb-3 font-display text-lg font-bold text-fg">
          1. Quelle wählen
        </h2>

        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="md:flex-1">
            <label className="mb-1 block text-sm font-medium text-muted">
              Thema
            </label>
            <select
              className="w-full rounded-xl border border-white/10 bg-surface2 p-2.5 text-sm text-fg"
              value={selectedTopicId ?? ""}
              onChange={(e) => setVocab({ selectedTopicId: Number(e.target.value) })}
            >
              {CATEGORY_ORDER.map((category) => (
                <optgroup key={category} label={category}>
                  {topics
                    .filter((t) => t.category === category)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-1 rounded-xl bg-surface2 p-1 md:w-72">
            <button
              type="button"
              onClick={() => setVocab({ contentType: "article" })}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                contentType === "article"
                  ? "bg-blue text-white"
                  : "text-muted hover:text-fg"
              }`}
            >
              Artikel
            </button>
            <button
              type="button"
              onClick={() => setVocab({ contentType: "youtube" })}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                contentType === "youtube"
                  ? "bg-blue text-white"
                  : "text-muted hover:text-fg"
              }`}
            >
              YouTube
            </button>
            <button
              type="button"
              onClick={() => setVocab({ contentType: "podcast" })}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                contentType === "podcast"
                  ? "bg-blue text-white"
                  : "text-muted hover:text-fg"
              }`}
            >
              Podcast
            </button>
          </div>

          <button
            type="button"
            onClick={handleSearch}
            disabled={loading || !selectedTopic}
            className="rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:opacity-40 md:px-6"
          >
            {loading ? "Suche läuft…" : "Suchen"}
          </button>
        </div>

        {error && <p className="mt-2 text-sm text-rust">{error}</p>}

        <div className="mt-4 border-t border-white/10 pt-4">
          <label className="block text-sm font-medium text-muted">
            Oder eigene Datei hochladen (.txt oder Bild)
          </label>
          <input
            type="file"
            accept=".txt,.png,.jpg,.jpeg,.webp"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm text-muted file:mr-3 file:rounded-lg file:border-0 file:bg-surface2 file:px-3 file:py-2 file:text-sm file:font-medium file:text-fg"
          />
          {ocrProgress !== null && (
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface2">
              <div
                className="h-full bg-blue transition-all"
                style={{ width: `${ocrProgress}%` }}
              />
            </div>
          )}
        </div>
      </section>

      {contentType === "article" && article && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-fg">
            2. Inhalt
          </h2>
          <ArticleCard article={article} />
        </section>
      )}

      {contentType === "youtube" && videos && selectedTopic && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-fg">
            2. Inhalt
          </h2>
          <YouTubeSearch
            videos={videos}
            topicId={selectedTopic.id}
            topicTitle={selectedTopic.title}
          />
        </section>
      )}

      {contentType === "podcast" && podcasts && (
        <section>
          <h2 className="mb-3 font-display text-lg font-bold text-fg">
            2. Inhalt
          </h2>
          <PodcastSearch episodes={podcasts} />
        </section>
      )}
    </>
  );
}
