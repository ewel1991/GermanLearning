// One-time migration: seeds the existing data/vocabulary.json entries into
// Upstash Redis. Run once, after setting UPSTASH_REDIS_REST_URL and
// UPSTASH_REDIS_REST_TOKEN in .env.local:
//
//   node scripts/migrate-vocabulary-to-redis.mjs
//
// Safe to re-run — it merges by id instead of duplicating.
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import nextEnv from "@next/env";
import { Redis } from "@upstash/redis";

const here = path.dirname(fileURLToPath(import.meta.url));
nextEnv.loadEnvConfig(path.join(here, ".."));

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
if (!url || !token) {
  console.error(
    "UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN sind nicht gesetzt — zuerst in .env.local eintragen."
  );
  process.exit(1);
}

const filePath = path.join(here, "..", "data", "vocabulary.json");
const fileItems = JSON.parse(readFileSync(filePath, "utf-8"));

const redis = new Redis({ url, token });
const existing = (await redis.get("vocabulary")) ?? [];

const byId = new Map(existing.map((item) => [item.id, item]));
for (const item of fileItems) {
  byId.set(item.id, item);
}
const merged = [...byId.values()];

await redis.set("vocabulary", merged);
console.log(`${fileItems.length} Einträge aus data/vocabulary.json übertragen.`);
console.log(`Redis enthält jetzt ${merged.length} Einträge insgesamt.`);
