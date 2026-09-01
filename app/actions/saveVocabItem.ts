"use server";

import { addVocabItem } from "@/lib/vocabulary";
import type { VocabularyItem } from "@/lib/vocabulary";

interface SaveVocabItemInput {
  topic_id: number;
  topic_title: string;
  term: string;
  definition_de: string;
  example_sentence: string;
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

export async function saveVocabItem(
  input: SaveVocabItemInput
): Promise<{ success: true }> {
  const now = new Date();

  // Standard SM-2 first interval: a freshly saved item is due again in 1 day.
  const item: VocabularyItem = {
    id: crypto.randomUUID(),
    topic_id: input.topic_id,
    topic_title: input.topic_title,
    term: input.term,
    definition_de: input.definition_de,
    example_sentence: input.example_sentence,
    saved_at: now.toISOString(),
    next_review_at: new Date(now.getTime() + ONE_DAY_MS).toISOString(),
    review_interval_days: 1,
    ease_factor: 2.5,
    review_count: 0,
  };

  addVocabItem(item);

  return { success: true };
}
