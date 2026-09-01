"use client";

import { useState } from "react";
import { searchArticle } from "@/app/actions/searchArticle";
import { searchYouTube } from "@/app/actions/searchYouTube";
import { saveCurrentContent } from "@/lib/currentContent";
import type { ArticleResult, Topic, YouTubeVideo } from "@/lib/types";
import ArticleCard from "./ArticleCard";
import YouTubeSearch from "./YouTubeSearch";

type ContentType = "article" | "youtube";

// Fixed display order for the topic dropdown's <optgroup>s.
const CATEGORY_ORDER = ["Business", "Tech", "Lifestyle", "Culture", "Society"];

export default function ContentViewer({ topics }: { topics: Topic[] }) {
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(
    topics[0]?.id ?? null
  );
  const [contentType, setContentType] = useState<ContentType>("article");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [article, setArticle] = useState<ArticleResult | null>(null);
  const [videos, setVideos] = useState<YouTubeVideo[] | null>(null);
  const [ocrProgress, setOcrProgress] = useState<number | null>(null);

  const selectedTopic = topics.find((t) => t.id === selectedTopicId) ?? null;

  async function handleSearch() {
    if (!selectedTopic) return;
    setLoading(true);
    setError(null);
    setArticle(null);
    setVideos(null);

    if (contentType === "article") {
      const result = await searchArticle(selectedTopic.title);
      if ("error" in result) {
        setError(result.error);
      } else {
        setArticle(result);
        saveCurrentContent(result.content, {
          id: selectedTopic.id,
          title: selectedTopic.title,
        });
      }
    } else {
      const result = await searchYouTube(selectedTopic.title);
      if ("error" in result) {
        setError(result.error);
      } else {
        setVideos(result);
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
    <section className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-3 font-semibold">Content Viewer</h2>

      <select
        className="w-full rounded border border-gray-300 p-2 text-sm"
        value={selectedTopicId ?? ""}
        onChange={(e) => setSelectedTopicId(Number(e.target.value))}
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

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={() => setContentType("article")}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            contentType === "article"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          📄 Artikel
        </button>
        <button
          type="button"
          onClick={() => setContentType("youtube")}
          className={`rounded px-3 py-1.5 text-sm font-medium ${
            contentType === "youtube"
              ? "bg-gray-800 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          ▶ YouTube
        </button>
      </div>

      <button
        type="button"
        onClick={handleSearch}
        disabled={loading || !selectedTopic}
        className="mt-3 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Suche läuft…" : "Suchen"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {contentType === "article" && article && (
        <div className="mt-4">
          <ArticleCard article={article} />
        </div>
      )}

      {contentType === "youtube" && videos && selectedTopic && (
        <div className="mt-4">
          <YouTubeSearch
            videos={videos}
            topicId={selectedTopic.id}
            topicTitle={selectedTopic.title}
          />
        </div>
      )}

      <div className="mt-4 border-t border-gray-100 pt-4">
        <label className="block text-sm font-medium text-gray-700">
          Eigene Datei hochladen (.txt oder Bild)
        </label>
        <input
          type="file"
          accept=".txt,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
          className="mt-1 text-sm"
        />
        {ocrProgress !== null && (
          <div className="mt-2 h-2 w-full overflow-hidden rounded bg-gray-100">
            <div
              className="h-full bg-blue-600 transition-all"
              style={{ width: `${ocrProgress}%` }}
            />
          </div>
        )}
      </div>
    </section>
  );
}
