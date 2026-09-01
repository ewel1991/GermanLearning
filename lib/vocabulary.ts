import fs from "fs";
import path from "path";

const VOCABULARY_FILE_PATH = path.join(process.cwd(), "data", "vocabulary.json");

/**
 * Shape of one saved vocabulary item, as persisted in data/vocabulary.json.
 *
 * {
 *   "id": "uuid-string",
 *   "topic_id": number,
 *   "topic_title": string,
 *   "term": string,
 *   "definition_de": string,
 *   "example_sentence": string,
 *   "saved_at": "ISO datetime",
 *   "next_review_at": "ISO datetime",
 *   "review_interval_days": number,
 *   "ease_factor": number,
 *   "review_count": number
 * }
 */
export interface VocabularyItem {
  id: string;
  topic_id: number;
  topic_title: string;
  term: string;
  definition_de: string;
  example_sentence: string;
  saved_at: string;
  next_review_at: string;
  review_interval_days: number;
  ease_factor: number;
  review_count: number;
}

export function readVocabulary(): VocabularyItem[] {
  const raw = fs.readFileSync(VOCABULARY_FILE_PATH, "utf-8");
  return JSON.parse(raw) as VocabularyItem[];
}

export function writeVocabulary(items: VocabularyItem[]): void {
  fs.writeFileSync(VOCABULARY_FILE_PATH, JSON.stringify(items, null, 2));
}

export function addVocabItem(item: VocabularyItem): void {
  const items = readVocabulary();
  items.push(item);
  writeVocabulary(items);
}

export function getItemsDueForReview(limit: number): VocabularyItem[] {
  const now = new Date().toISOString();
  return readVocabulary()
    .filter((item) => item.next_review_at <= now)
    .sort((a, b) => a.next_review_at.localeCompare(b.next_review_at))
    .slice(0, limit);
}
