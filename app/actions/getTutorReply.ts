"use server";

import Anthropic from "@anthropic-ai/sdk";
import type { ActionError } from "@/lib/types";

// Shared across page.tsx and ChatPanel.tsx — this file anchors the type,
// same convention as GrammarResult living in identifyGrammar.ts.
export interface ChatMessage {
  role: "tutor" | "user";
  text: string;
}

interface GetTutorReplyInput {
  history: ChatMessage[];
  topic: string;
  reviewTerms: string[];
  remainingQuestions: string[];
}

const SYSTEM_PROMPT_TEMPLATE = (
  topic: string,
  reviewTerms: string[],
  remainingQuestions: string[]
) => `Du bist ein muttersprachlicher deutscher Konversationslehrer für Lernende auf dem Niveau B2/C1.

ROLLE UND TON:
- Du sprichst deine Gesprächspartnerin/deinen Gesprächspartner höflich mit "Sie" an — formell, aber warmherzig und ermutigend, wie eine erfahrene Sprachlehrkraft im Gespräch.
- Du antwortest AUSSCHLIESSLICH auf Deutsch. Auch wenn die Person auf Englisch oder einer anderen Sprache schreibt, wechselst du niemals die Sprache — antworte weiterhin auf Deutsch.
- Deine Antworten sind prägnant: etwa 3 bis 6 Sätze, in Fließtext, ohne Markdown-Formatierung, ohne Aufzählungszeichen.

INHALTLICHE AUFGABEN IN JEDER ANTWORT:
1. Reagiere inhaltlich auf das, was die Person gerade geschrieben hat.
2. Wenn die Person eine gelungene Formulierung, treffenden Wortschatz oder die Zielvokabeln korrekt verwendet hat, erkenne das explizit und konkret an (z. B. "Der Ausdruck '…' war sehr treffend gewählt.").
3. Baue mindestens einen der folgenden Übungsbegriffe natürlich in deine eigene Antwort ein, um die richtige Verwendung vorzuleben: ${
  reviewTerms.length > 0 ? reviewTerms.join(", ") : "(keine Vokabeln vorgegeben)"
}.
4. Beende JEDE Antwort mit genau einer offenen Diskussionsfrage zum Thema "${topic}".
   ${
     remainingQuestions.length > 0
       ? `Verwende dafür (ggf. leicht umformuliert) die nächste dieser vorbereiteten Fragen: "${remainingQuestions[0]}".`
       : "Da keine vorbereiteten Fragen mehr übrig sind, formuliere selbst eine natürliche, thematisch passende Anschlussfrage."
   }

Gib nur deine Antwort als Fließtext zurück — kein JSON, keine Anführungszeichen um die gesamte Antwort, kein Markdown.`;

export async function getTutorReply(
  input: GetTutorReplyInput
): Promise<{ reply: string } | ActionError> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { error: "ANTHROPIC_API_KEY ist nicht gesetzt." };
  }

  const client = new Anthropic();

  const messages = input.history.map((message) => ({
    role: (message.role === "tutor" ? "assistant" : "user") as
      | "assistant"
      | "user",
    content: message.text,
  }));

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-5",
      max_tokens: 2048,
      output_config: { effort: "low" },
      system: SYSTEM_PROMPT_TEMPLATE(
        input.topic,
        input.reviewTerms,
        input.remainingQuestions
      ),
      messages,
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return { error: "Claude hat keinen Text zurückgegeben." };
    }

    return { reply: textBlock.text };
  } catch {
    return { error: "Anfrage an Claude ist fehlgeschlagen." };
  }
}
