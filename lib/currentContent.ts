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

export function saveCurrentContent(text: string, topic: CurrentTopic): void {
  localStorage.setItem("current_article", text);
  localStorage.setItem("current_topic", JSON.stringify(topic));
  window.dispatchEvent(new Event(CURRENT_CONTENT_EVENT));
}

export function readCurrentContent(): {
  article: string | null;
  topic: CurrentTopic | null;
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
  return { article, topic };
}
