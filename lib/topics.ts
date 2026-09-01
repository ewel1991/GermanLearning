import fs from "fs";
import path from "path";
import type { Topic } from "./types";

const TOPICS_FILE_PATH = path.join(process.cwd(), "data", "topics.json");

export function readTopics(): Topic[] {
  const raw = fs.readFileSync(TOPICS_FILE_PATH, "utf-8");
  return JSON.parse(raw) as Topic[];
}
