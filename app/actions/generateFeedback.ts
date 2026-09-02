"use server";

import Anthropic from "@anthropic-ai/sdk";
import { parseClaudeJson } from "@/lib/parseClaudeJson";
import type { ActionError } from "@/lib/types";

export interface FeedbackResult {
  grammar_errors: { user: string; correct: string }[];
  style_upgrades: { user: string; c1: string; note: string }[];
  fluency_comment: string;
}

const SYSTEM_PROMPT = `Du bist ein deutscher Sprachlehrer für das Niveau B2/C1 und analysierst die deutsche Antwort
eines Lernenden streng, aber fair, in drei Kategorien.

Gib ausschließlich ein rohes JSON-Objekt zurück, ohne Markdown, ohne Code-Fences, in genau diesem Format:
{
  "grammar_errors": [{ "user": string, "correct": string }],
  "style_upgrades": [{ "user": string, "c1": string, "note": string }],
  "fluency_comment": string
}

"grammar_errors": jeder Grammatik- oder Rechtschreibfehler als Paar (fehlerhafte Version des Lernenden,
korrigierte Version). Leeres Array, wenn keine Fehler vorliegen.

"style_upgrades": Formulierungen, die zwar korrekt, aber eher B2-Niveau sind, mit einer eleganteren
C1-Alternative und einer kurzen deutschen Erklärung, was dadurch verbessert wird. Leeres Array, wenn
der Text bereits durchgehend auf C1-Niveau formuliert ist.

"fluency_comment": 2–3 Sätze auf Deutsch (B2-Register) zu Satzvielfalt, Konsistenz des Registers und
natürlichem Sprachfluss.`;

export async function generateFeedback(
  userMessage: string
): Promise<FeedbackResult | ActionError> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "ANTHROPIC_API_KEY ist nicht gesetzt." };
  }

  const client = new Anthropic();

  let raw: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Claude hat keinen Text zurückgegeben." };
    }
    raw = textBlock.text;
  } catch {
    return { error: "Anfrage an Claude ist fehlgeschlagen." };
  }

  try {
    return parseClaudeJson<FeedbackResult>(raw);
  } catch {
    return { error: "Antwort von Claude konnte nicht als JSON gelesen werden." };
  }
}
