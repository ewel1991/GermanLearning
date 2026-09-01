"use server";

import { readVocabulary, writeVocabulary } from "@/lib/vocabulary";
import type { ActionError } from "@/lib/types";

const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const MIN_EASE = 1.3;
const MAX_EASE = 2.5;

interface UpdateSpacedRepetitionInput {
  itemId: string;
  qualityRating: number; // 0–5
}

export async function updateSpacedRepetition(
  input: UpdateSpacedRepetitionInput
): Promise<{ success: true } | ActionError> {
  // No `await` between this read and the write below — the whole
  // read-modify-write runs synchronously so concurrent calls for
  // different items can't interleave and clobber each other's write.
  const items = readVocabulary();
  const item = items.find((entry) => entry.id === input.itemId);
  if (!item) {
    return { error: "Vokabeleintrag nicht gefunden." };
  }

  const q = input.qualityRating;

  let newEase =
    item.ease_factor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  newEase = Math.min(MAX_EASE, Math.max(MIN_EASE, newEase));

  let newInterval: number;
  if (q < 3) {
    newInterval = 1;
  } else if (item.review_count === 0) {
    newInterval = 1;
  } else if (item.review_count === 1) {
    newInterval = 6;
  } else {
    newInterval = Math.round(item.review_interval_days * newEase);
  }

  item.ease_factor = newEase;
  item.review_interval_days = newInterval;
  item.next_review_at = new Date(Date.now() + newInterval * ONE_DAY_MS).toISOString();
  item.review_count += 1;

  writeVocabulary(items);

  return { success: true };
}
