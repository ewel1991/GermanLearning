"use server";

import { getAnthropicClient, describeAnthropicError } from "@/lib/anthropicClient";
import { parseClaudeJson } from "@/lib/parseClaudeJson";
import type { ActionError } from "@/lib/types";

export interface EvaluationResult {
  score: number;
  is_correct: boolean;
  feedback_correct: string[];
  feedback_errors: string[];
  alternative?: string;
  c1_rewrite: string;
  c1_explanation: string;
}

interface EvaluateParaphraseInput {
  base_sentence: string;
  user_answer: string;
  structure_name: string;
}

const SYSTEM_PROMPT = `Du bist ein Deutschlehrer für das Niveau B2/C1 und bewertest eine Umformungsübung streng, aber fair.

Der Lernende bekam einen einfachen Basissatz und sollte ihn unter Verwendung einer bestimmten Zielstruktur umformen.

Gib ausschließlich ein rohes JSON-Objekt zurück, ohne Markdown, ohne Code-Fences, in genau diesem Format:
{
  "score": number,                  // 0–100
  "is_correct": boolean,            // dein eigenes grammatisches Urteil, unabhängig vom score
  "feedback_correct": string[],     // kurze Punkte, was richtig gemacht wurde (ohne ✅-Symbol, das fügt die UI hinzu)
  "feedback_errors": string[],      // kurze Punkte für Fehler, JEDER EINTRAG im Format "<Version des Lernenden> → <korrekte Version>"
  "alternative": string,            // NUR wenn is_correct=true: eine weitere gültige Umformung; sonst weglassen
  "c1_rewrite": string,             // der Satz des Lernenden, auf C1-Eleganz-Niveau umgeschrieben
  "c1_explanation": string          // ein Einzeiler auf Deutsch, was stilistisch verbessert wurde
}`;

export async function evaluateParaphrase(
  input: EvaluateParaphraseInput
): Promise<EvaluationResult | ActionError> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "ANTHROPIC_API_KEY ist nicht gesetzt." };
  }

  const client = getAnthropicClient();

  const userMessage = `Zielstruktur: ${input.structure_name}
Basissatz: ${input.base_sentence}
Antwort des Lernenden: ${input.user_answer}`;

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
  } catch (err) {
    console.error("evaluateParaphrase: Claude request failed:", err);
    return { error: describeAnthropicError(err) };
  }

  try {
    return parseClaudeJson<EvaluationResult>(raw);
  } catch {
    return { error: "Antwort von Claude konnte nicht als JSON gelesen werden." };
  }
}
