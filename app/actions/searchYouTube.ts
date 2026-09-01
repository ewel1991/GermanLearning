"use server";

import type { YouTubeVideo, ActionError } from "@/lib/types";

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: { medium?: { url: string }; default?: { url: string } };
  };
}

interface YouTubeVideoDetailsItem {
  id: string;
  contentDetails: { duration: string };
}

// Converts YouTube's ISO-8601 duration (e.g. "PT7M33S") into "M:SS".
function formatDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = Number(match?.[1] ?? 0);
  const minutes = Number(match?.[2] ?? 0);
  const seconds = Number(match?.[3] ?? 0);
  const totalMinutes = hours * 60 + minutes;
  return `${totalMinutes}:${String(seconds).padStart(2, "0")}`;
}

export async function searchYouTube(
  topicTitle: string
): Promise<YouTubeVideo[] | ActionError> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return { error: "YOUTUBE_API_KEY ist nicht gesetzt." };
  }

  const searchParams = new URLSearchParams({
    part: "snippet",
    q: topicTitle,
    type: "video",
    videoCaption: "closedCaption",
    videoDuration: "medium", // 4–20 minutes
    relevanceLanguage: "de",
    maxResults: "5",
    key: apiKey,
  });

  let searchResponse: Response;
  try {
    searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${searchParams.toString()}`
    );
  } catch {
    return { error: "YouTube-Suche fehlgeschlagen (Netzwerkfehler)." };
  }

  if (!searchResponse.ok) {
    return { error: `YouTube-API-Fehler: ${searchResponse.status}` };
  }

  const searchData = (await searchResponse.json()) as {
    items: YouTubeSearchItem[];
  };
  const items = searchData.items ?? [];
  if (items.length === 0) {
    return { error: "Keine Videos gefunden." };
  }

  // search.list doesn't return duration — a second call to videos.list is required.
  const ids = items.map((item) => item.id.videoId).join(",");
  const detailsParams = new URLSearchParams({
    part: "contentDetails",
    id: ids,
    key: apiKey,
  });
  const detailsResponse = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?${detailsParams.toString()}`
  );
  const detailsData = (await detailsResponse.json()) as {
    items: YouTubeVideoDetailsItem[];
  };
  const durationById = new Map(
    detailsData.items?.map((item) => [item.id, item.contentDetails.duration]) ?? []
  );

  return items.slice(0, 3).map((item) => ({
    videoId: item.id.videoId,
    title: item.snippet.title,
    channelTitle: item.snippet.channelTitle,
    duration: formatDuration(durationById.get(item.id.videoId) ?? "PT0S"),
    thumbnail:
      item.snippet.thumbnails.medium?.url ??
      item.snippet.thumbnails.default?.url ??
      "",
  }));
}
