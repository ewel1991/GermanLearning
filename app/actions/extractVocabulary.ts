"use server";

import { getAnthropicClient, describeAnthropicError } from "@/lib/anthropicClient";
import { parseClaudeJson } from "@/lib/parseClaudeJson";
import type { VocabExtractionItem, ActionError } from "@/lib/types";

const SYSTEM_PROMPT = `Du bist ein Deutschlehrer für das Niveau B2/C1.
Extrahiere aus dem folgenden Text genau 10 Vokabeleinträge, die für Deutschlernende auf B2/C1-Niveau relevant sind.

Priorisiere:
- Nomen-Verb-Verbindungen (z. B. "eine Entscheidung treffen")
- Kollokationen und feste Wendungen
- idiomatische Ausdrücke
- formelle Konnektoren (z. B. "dennoch", "insofern", "nichtsdestotrotz")

Wenn der Text ein gesprochenes Transkript ist, beziehe zusätzlich Diskursmarker und
gesprochene, aber gehobene Register-Ausdrücke mit ein.

Gib ausschließlich ein rohes JSON-Array zurück, ohne Markdown, ohne Code-Fences, in genau diesem Format:
[{ "term": string, "definition_de": string, "example_sentence": string }]

"definition_de" ist eine deutschsprachige Definition (kein Englisch, keine Übersetzung).
"example_sentence" ist ein neuer Beispielsatz, der den Begriff im Kontext verwendet.`;

export async function extractVocabulary(
  text: string
): Promise<VocabExtractionItem[] | ActionError> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "ANTHROPIC_API_KEY ist nicht gesetzt." };
  }

  const client = getAnthropicClient();

  let raw: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 4096,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: text }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Claude hat keinen Text zurückgegeben." };
    }
    raw = textBlock.text;
  } catch (err) {
    console.error("extractVocabulary: Claude request failed:", err);
    return { error: describeAnthropicError(err) };
  }

  try {
    const parsed = parseClaudeJson<VocabExtractionItem[]>(raw);
    return parsed.slice(0, 10);
  } catch {
    return { error: "Antwort von Claude konnte nicht als JSON gelesen werden." };
  }
}
