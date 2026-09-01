"use server";

import { getItemsDueForReview } from "@/lib/vocabulary";
import type { VocabularyItem } from "@/lib/vocabulary";

// Thin wrapper so the (client) Screen 3 page can reach the fs-based
// lib/vocabulary.ts read — mirrors getTopics.ts's role for Screen 1.
export async function getReviewItems(): Promise<VocabularyItem[]> {
  return getItemsDueForReview(3);
}
