"use client";

import { useState } from "react";
import type { PodcastEpisode } from "@/lib/types";

interface Props {
  episodes: PodcastEpisode[];
}

function formatDuration(ms: number): string {
  return `${Math.round(ms / 60000)} Min.`;
}

export default function PodcastSearch({ episodes }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
        {episodes.map((episode) => (
          <button
            key={episode.id}
            type="button"
            onClick={() => setSelectedId(episode.id)}
            className={`rounded-xl border p-2 text-left text-xs transition ${
              selectedId === episode.id
                ? "border-blue ring-2 ring-blue/40"
                : "border-white/10 hover:border-white/25"
            }`}
          >
            {episode.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={episode.imageUrl}
                alt={episode.name}
                className="mb-1 aspect-square w-full rounded-lg object-cover"
              />
            )}
            <div className="line-clamp-2 font-medium text-fg">{episode.name}</div>
            <div className="text-muted">
              {episode.showName} · {formatDuration(episode.durationMs)}
            </div>
          </button>
        ))}
      </div>

      {selectedId && (
        <div className="mt-4">
          <iframe
            className="w-full rounded-xl"
            style={{ height: 152 }}
            src={`https://open.spotify.com/embed/episode/${selectedId}?theme=0`}
            title="Spotify-Player"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
          <p className="mt-2 text-xs text-muted">
            Spotify liefert keine Transkription — Vokabular-Extraktion und
            Grammatik-Analyse stehen für Podcasts nicht zur Verfügung.
          </p>
        </div>
      )}
    </div>
  );
}
