"use server";

import type { PodcastEpisode, ActionError } from "@/lib/types";

interface SpotifyTokenResponse {
  access_token: string;
}

interface SpotifyEpisodeItem {
  id: string;
  name: string;
  duration_ms: number;
  images: { url: string }[];
  show?: { name: string };
}

interface SpotifySearchResponse {
  episodes?: { items: SpotifyEpisodeItem[] };
}

// Client Credentials flow — app-only auth, no Spotify user login required
// for search. Token is short-lived; fetching a fresh one per search keeps
// this simple and avoids building a cache for a low-traffic personal app.
async function getAccessToken(
  clientId: string,
  clientSecret: string
): Promise<string | null> {
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${credentials}`,
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) return null;
  const data = (await response.json()) as SpotifyTokenResponse;
  return data.access_token;
}

export async function searchPodcast(
  topicTitle: string
): Promise<PodcastEpisode[] | ActionError> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { error: "SPOTIFY_CLIENT_ID/SPOTIFY_CLIENT_SECRET sind nicht gesetzt." };
  }

  let accessToken: string | null;
  try {
    accessToken = await getAccessToken(clientId, clientSecret);
  } catch {
    return { error: "Spotify-Authentifizierung fehlgeschlagen (Netzwerkfehler)." };
  }
  if (!accessToken) {
    return { error: "Spotify-Authentifizierung fehlgeschlagen." };
  }

  const searchParams = new URLSearchParams({
    q: topicTitle,
    type: "episode",
    market: "DE",
    limit: "6",
  });

  let response: Response;
  try {
    response = await fetch(
      `https://api.spotify.com/v1/search?${searchParams.toString()}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
  } catch {
    return { error: "Spotify-Suche fehlgeschlagen (Netzwerkfehler)." };
  }

  if (!response.ok) {
    return { error: `Spotify-API-Fehler: ${response.status}` };
  }

  const data = (await response.json()) as SpotifySearchResponse;
  const items = data.episodes?.items ?? [];
  if (items.length === 0) {
    return { error: "Keine Podcasts gefunden." };
  }

  return items.map((item) => ({
    id: item.id,
    name: item.name,
    showName: item.show?.name ?? "",
    durationMs: item.duration_ms,
    imageUrl: item.images?.[0]?.url ?? "",
  }));
}
