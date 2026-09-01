"use server";

import { YoutubeTranscript } from "youtube-transcript";
import type { ActionError } from "@/lib/types";

const MAX_TRANSCRIPT_CHARS = 3000;

export async function fetchTranscript(
  videoId: string
): Promise<{ transcript: string } | ActionError> {
  try {
    // youtube-transcript scrapes YouTube's own transcript feature — no API key needed.
    const segments = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "de",
    });

    const text = segments
      .map((segment) => segment.text)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_TRANSCRIPT_CHARS);

    if (!text) {
      return { error: "unavailable" };
    }

    return { transcript: text };
  } catch {
    return { error: "unavailable" };
  }
}
