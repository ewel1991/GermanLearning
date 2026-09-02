import { Redis } from "@upstash/redis";

// All saved items live under one Redis key, as a single JSON array — the fs
// version of this file used a single JSON file the same way. This works
// on Vercel where the deployed filesystem is read-only (fs.writeFileSync
// would fail there); Upstash's REST API works from any serverless runtime.
const VOCABULARY_KEY = "vocabulary";

/**
 * Shape of one saved vocabulary item.
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

function getRedis(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error(
      "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN sind nicht gesetzt."
    );
  }
  return new Redis({ url, token });
}

export async function readVocabulary(): Promise<VocabularyItem[]> {
  const items = await getRedis().get<VocabularyItem[]>(VOCABULARY_KEY);
  return items ?? [];
}

export async function writeVocabulary(items: VocabularyItem[]): Promise<void> {
  await getRedis().set(VOCABULARY_KEY, items);
}

export async function addVocabItem(item: VocabularyItem): Promise<void> {
  const items = await readVocabulary();
  items.push(item);
  await writeVocabulary(items);
}

export async function getItemsDueForReview(limit: number): Promise<VocabularyItem[]> {
  const now = new Date().toISOString();
  const items = await readVocabulary();
  return items
    .filter((item) => item.next_review_at <= now)
    .sort((a, b) => a.next_review_at.localeCompare(b.next_review_at))
    .slice(0, limit);
}
