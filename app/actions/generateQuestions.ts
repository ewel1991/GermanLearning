"use server";

import Anthropic from "@anthropic-ai/sdk";
import { parseClaudeJson } from "@/lib/parseClaudeJson";
import type { ActionError } from "@/lib/types";

interface GenerateQuestionsInput {
  topic: string;
  terms: string[];
}

const SYSTEM_PROMPT = `Du bist ein deutscher Muttersprachler und Sprachlehrer für das Niveau B2/C1.
Generiere genau 3 offene Diskussionsfragen zum gegebenen Thema.

Baue die gegebenen Vokabeln natürlich in die Fragen ein, ohne anzukündigen, dass du das tust
(erwähne z. B. nicht "unter Verwendung des Begriffs X").

Die Fragen müssen sprachlich auf B2/C1-Niveau sein (komplexer Satzbau, gehobener Wortschatz).

Gib ausschließlich ein rohes JSON-Array von genau 3 Strings zurück, ohne Markdown, ohne Code-Fences:
["Frage 1", "Frage 2", "Frage 3"]`;

export async function generateQuestions(
  input: GenerateQuestionsInput
): Promise<string[] | ActionError> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "ANTHROPIC_API_KEY ist nicht gesetzt." };
  }

  const client = new Anthropic();

  const userMessage = `Thema: ${input.topic}
Vokabeln: ${input.terms.length > 0 ? input.terms.join(", ") : "(keine)"}`;

  let raw: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
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
    return parseClaudeJson<string[]>(raw);
  } catch {
    return { error: "Antwort von Claude konnte nicht als JSON gelesen werden." };
  }
}
