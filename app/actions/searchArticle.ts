"use server";

import type { ArticleResult, ActionError } from "@/lib/types";

interface TavilyResult {
  title: string;
  url: string;
  content: string;
  raw_content?: string;
  published_date?: string;
}

interface TavilyResponse {
  results: TavilyResult[];
}

export async function searchArticle(
  topicTitle: string
): Promise<ArticleResult | ActionError> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    return { error: "TAVILY_API_KEY ist nicht gesetzt." };
  }

  let response: Response;
  try {
    // Tavily authenticates via a Bearer token, not an api_key body field.
    response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        query: `${topicTitle} Deutsch`,
        search_depth: "advanced",
        include_raw_content: true,
        max_results: 5,
        language: "de",
      }),
    });
  } catch {
    return { error: "Tavily-Suche fehlgeschlagen (Netzwerkfehler)." };
  }

  if (!response.ok) {
    return { error: `Tavily-API-Fehler: ${response.status}` };
  }

  const data = (await response.json()) as TavilyResponse;

  // Prefer news/magazine sources over encyclopedia entries.
  const pick = data.results?.find((r) => !r.url.includes("wikipedia.org"));
  if (!pick) {
    return { error: "Kein passender Artikel gefunden." };
  }

  return {
    title: pick.title,
    url: pick.url,
    published_date: pick.published_date ?? null,
    content: pick.raw_content ?? pick.content,
  };
}
