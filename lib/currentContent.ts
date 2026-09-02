"use client";

// Shared helpers for the "current article" hand-off between ContentViewer /
// YouTubeSearch (writers) and VocabularyPanel (reader) via localStorage.
// A custom window event notifies the reader immediately, since the two
// components don't share React state (see app/screen1/page.tsx).

export const CURRENT_CONTENT_EVENT = "current-article-updated";

export interface CurrentTopic {
  id: number;
  title: string;
}

// "text" = real source text is available (article/transcript/upload) — feed
// it to extractVocabulary/identifyGrammar. "topic" = no source text exists
// (Spotify podcasts have no transcript) — generate content for the topic
// name instead, via generateVocabularyForTopic/generateGrammarForTopic.
export type ContentSource = "text" | "topic";

export function saveCurrentContent(
  text: string,
  topic: CurrentTopic,
  source: ContentSource = "text"
): void {
  // Bumped on every save so consumers (Grammatik) can tell whether a cached
  // result still matches the content it was generated from, or is stale.
  const version = Number(localStorage.getItem("current_version") ?? "0") + 1;
  localStorage.setItem("current_article", text);
  localStorage.setItem("current_topic", JSON.stringify(topic));
  localStorage.setItem("current_source", source);
  localStorage.setItem("current_version", String(version));
  window.dispatchEvent(new Event(CURRENT_CONTENT_EVENT));
}

export function clearCurrentContent(): void {
  localStorage.removeItem("current_article");
  localStorage.removeItem("current_topic");
  localStorage.removeItem("current_source");
  localStorage.removeItem("current_version");
  window.dispatchEvent(new Event(CURRENT_CONTENT_EVENT));
}

export function readCurrentContent(): {
  article: string | null;
  topic: CurrentTopic | null;
  source: ContentSource;
  version: number;
} {
  const article = localStorage.getItem("current_article");
  const rawTopic = localStorage.getItem("current_topic");
  let topic: CurrentTopic | null = null;
  if (rawTopic) {
    try {
      topic = JSON.parse(rawTopic) as CurrentTopic;
    } catch {
      topic = null;
    }
  }
  const source = (localStorage.getItem("current_source") as ContentSource | null) ?? "text";
  const version = Number(localStorage.getItem("current_version") ?? "0");
  return { article, topic, source, version };
}
