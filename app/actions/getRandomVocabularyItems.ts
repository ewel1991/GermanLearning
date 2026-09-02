"use server";

import { readVocabulary } from "@/lib/vocabulary";
import type { VocabularyItem } from "@/lib/vocabulary";
import type { ActionError } from "@/lib/types";

// Fisher-Yates shuffle — unbiased, unlike naively sorting on Math.random().
function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export async function getRandomVocabularyItems(
  count: number
): Promise<VocabularyItem[] | ActionError> {
  let all: VocabularyItem[];
  try {
    all = await readVocabulary();
  } catch {
    return { error: "Vokabular-Speicher ist nicht konfiguriert (Redis)." };
  }

  if (all.length === 0) {
    return { error: "Noch keine gespeicherten Vokabeln." };
  }
  return shuffle(all).slice(0, count);
}
