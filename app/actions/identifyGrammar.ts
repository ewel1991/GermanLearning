"use server";

import { getAnthropicClient, describeAnthropicError } from "@/lib/anthropicClient";
import { parseClaudeJson } from "@/lib/parseClaudeJson";
import type { ActionError } from "@/lib/types";

// Interfaces are erased at compile time, so exporting one alongside the
// file's single "use server" async function doesn't violate the
// server-action-file export rule (only runtime bindings must be async fns).
export interface GrammarResult {
  structure_name: string;
  explanation: string;
  example_sentences: string[];
  key_clause: string;
  base_sentence: string;
}

const SYSTEM_PROMPT = `Du bist ein Deutschlehrer für das Niveau B2/C1.
Identifiziere im folgenden Artikeltext die EINE auffälligste B2/C1-Grammatikstruktur.

Bevorzuge in dieser Reihenfolge, je nachdem was im Text tatsächlich vorkommt:
- Partizipialattribute
- Passiversatzformen (sein + zu / lassen + sich)
- Nomen-Verb-Verbindungen
- Konzessivsätze mit "obwohl" oder "wenngleich"
- Genitivattribut-Ketten

Gib ausschließlich ein rohes JSON-Objekt zurück, ohne Markdown, ohne Code-Fences, in genau diesem Format:
{
  "structure_name": string,        // der deutsche linguistische Fachbegriff
  "explanation": string,           // ein Absatz auf Deutsch, B2-Register, erklärt die Struktur
  "example_sentences": string[],   // genau 2 Sätze WÖRTLICH aus dem Artikel, die die Struktur enthalten
  "key_clause": string,            // der Satzteil, der in beiden Beispielsätzen hervorgehoben werden soll
  "base_sentence": string          // einer der Beispielsätze, umgeschrieben in eine einfache Version OHNE die Zielstruktur
}`;

export async function identifyGrammar(
  articleText: string
): Promise<GrammarResult | ActionError> {
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
      messages: [{ role: "user", content: articleText }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Claude hat keinen Text zurückgegeben." };
    }
    raw = textBlock.text;
  } catch (err) {
    console.error("identifyGrammar: Claude request failed:", err);
    return { error: describeAnthropicError(err) };
  }

  try {
    return parseClaudeJson<GrammarResult>(raw);
  } catch {
    return { error: "Antwort von Claude konnte nicht als JSON gelesen werden." };
  }
}
