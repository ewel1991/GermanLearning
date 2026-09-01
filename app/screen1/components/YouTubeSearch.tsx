"use client";

import { useState } from "react";
import { fetchTranscript } from "@/app/actions/fetchTranscript";
import { saveCurrentContent } from "@/lib/currentContent";
import type { YouTubeVideo } from "@/lib/types";

interface Props {
  videos: YouTubeVideo[];
  topicId: number;
  topicTitle: string;
}

export default function YouTubeSearch({ videos, topicId, topicTitle }: Props) {
  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [transcriptUnavailable, setTranscriptUnavailable] = useState(false);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  function selectVideo(videoId: string) {
    setSelectedVideoId(videoId);
    setTranscript(null);
    setTranscriptUnavailable(false);
  }

  async function handleLoadTranscript() {
    if (!selectedVideoId) return;
    setLoadingTranscript(true);
    setTranscriptUnavailable(false);

    const result = await fetchTranscript(selectedVideoId);

    if ("error" in result) {
      setTranscriptUnavailable(true);
    } else {
      setTranscript(result.transcript);
      saveCurrentContent(result.transcript, { id: topicId, title: topicTitle });
    }
    setLoadingTranscript(false);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {videos.map((video) => (
          <button
            key={video.videoId}
            type="button"
            onClick={() => selectVideo(video.videoId)}
            className={`rounded-lg border p-2 text-left text-xs transition ${
              selectedVideoId === video.videoId
                ? "border-amber-500 ring-2 ring-amber-300"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.thumbnail}
              alt={video.title}
              className="mb-1 w-full rounded"
            />
            <div className="line-clamp-2 font-medium">{video.title}</div>
            <div className="text-gray-500">
              {video.channelTitle} · {video.duration}
            </div>
          </button>
        ))}
      </div>

      {selectedVideoId && (
        <div className="mt-4">
          <div className="aspect-video w-full overflow-hidden rounded-lg">
            <iframe
              className="h-full w-full"
              src={`https://www.youtube.com/embed/${selectedVideoId}?hl=de&cc_lang_pref=de&cc_load_policy=1`}
              title="YouTube video player"
              allowFullScreen
            />
          </div>

          <button
            type="button"
            onClick={handleLoadTranscript}
            disabled={loadingTranscript}
            className="mt-2 rounded bg-gray-800 px-3 py-1.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {loadingTranscript ? "Lädt…" : "Transkript laden"}
          </button>

          {transcriptUnavailable && (
            <p className="mt-2 text-sm text-red-600">
              Kein Transkript verfügbar. Bitte ein anderes Video wählen.
            </p>
          )}

          {transcript && (
            <div className="mt-3 max-h-[60vh] overflow-y-auto rounded border border-gray-100 bg-gray-50 p-3 text-sm leading-relaxed">
              {transcript}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
