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
  content: string;
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  duration: string;
  thumbnail: string;
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
