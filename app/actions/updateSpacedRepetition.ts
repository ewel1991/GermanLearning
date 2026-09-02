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
  try {
    // Callers are expected to sequence per-item updates themselves (await
    // each one before starting the next, as Screen 3 already does) — Redis
    // reads/writes are real network round trips, so two truly concurrent
    // calls could otherwise race on this read-modify-write.
    const items = await readVocabulary();
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

    await writeVocabulary(items);

    return { success: true };
  } catch {
    return { error: "Vokabular-Speicher ist nicht konfiguriert (Redis)." };
  }
}
