"use server";

import { readTopics } from "@/lib/topics";
import type { Topic } from "@/lib/types";

// Reads all 100 topics from data/topics.json. Grouping by category for the
// dropdown happens client-side in ContentViewer — this just returns the flat list.
export async function getTopics(): Promise<Topic[]> {
  return readTopics();
}
