// Shared shapes used across Server Actions and Screen 1 components.

export interface Topic {
  id: number;
  title: string;
  category: string;
}

export interface ArticleResult {
  title: string;
  url: string;
  published_date: string | null;
  // Full raw scrape (includes site nav/boilerplate) — feeds vocabulary and
  // grammar extraction, where quantity of text matters more than tidiness.
  content: string;
  // Tavily's own cleaned extract — short and free of nav/boilerplate, so
  // it's what ArticleCard actually displays to the reader.
  preview: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  thumbnail: string;
}

// Spotify gives no transcript for episodes (audio is DRM-streamed, not
// downloadable) — this only powers search + the embedded player, never the
// vocabulary/grammar extraction pipeline.
export interface PodcastEpisode {
  id: string;
  name: string;
  showName: string;
  durationMs: number;
  imageUrl: string;
}

export interface VocabExtractionItem {
  term: string;
  definition_de: string;
  example_sentence: string;
}

// Every Server Action in this app returns either its result or this shape,
// so components can check `"error" in result` instead of relying on thrown exceptions.
export interface ActionError {
  error: string;
}
