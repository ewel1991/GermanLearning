"use server";

import { getItemsDueForReview } from "@/lib/vocabulary";
import type { VocabularyItem } from "@/lib/vocabulary";

// Thin wrapper so the (client) Screen 3 page can reach the Redis-backed
// lib/vocabulary.ts read — mirrors getTopics.ts's role for Screen 1.
export async function getReviewItems(): Promise<VocabularyItem[]> {
  try {
    return await getItemsDueForReview(3);
  } catch {
    // Redis not configured (yet) — the Tutor screen works fine without
    // review terms, so degrade quietly rather than blocking the chat.
    return [];
  }
}
