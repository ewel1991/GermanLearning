"use client";

import { useEffect, useState } from "react";
import { getReviewItems } from "@/app/actions/getReviewItems";
import { generateQuestions } from "@/app/actions/generateQuestions";
import { getTutorReply } from "@/app/actions/getTutorReply";
import type { ChatMessage } from "@/app/actions/getTutorReply";
import { generateFeedback } from "@/app/actions/generateFeedback";
import type { FeedbackResult } from "@/app/actions/generateFeedback";
import { updateSpacedRepetition } from "@/app/actions/updateSpacedRepetition";
import { readCurrentContent } from "@/lib/currentContent";
import type { VocabularyItem } from "@/lib/vocabulary";
import ChatPanel from "./components/ChatPanel";
import FeedbackPanel from "./components/FeedbackPanel";

const FALLBACK_TOPIC = "Allgemeines Thema";

// Case-insensitive substring check — same lightweight heuristic style as
// VocabCard.tsx's term highlighting, not a grammatical correctness check.
function containsTerm(text: string, term: string): boolean {
  return text.toLowerCase().includes(term.toLowerCase());
}

function determineQuality(term: string, userText: string, tutorText: string): number {
  if (containsTerm(userText, term)) return 5;
  if (containsTerm(tutorText, term)) return 3;
  return 2;
}

export default function Screen3Page() {
  const [reviewItems, setReviewItems] = useState<VocabularyItem[]>([]);
  const [topic, setTopic] = useState(FALLBACK_TOPIC);
  const [remainingQuestions, setRemainingQuestions] = useState<string[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [feedback, setFeedback] = useState<FeedbackResult | null>(null);
  const [initLoading, setInitLoading] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    async function init() {
      const items = await getReviewItems();
      setReviewItems(items);

      const topicTitle = readCurrentContent().topic?.title ?? FALLBACK_TOPIC;
      setTopic(topicTitle);

      const result = await generateQuestions({
        topic: topicTitle,
        terms: items.map((item) => item.term),
      });

      if ("error" in result) {
        setInitError(result.error);
      } else {
        setMessages([{ role: "tutor", text: result[0] }]);
        setRemainingQuestions(result.slice(1));
      }
      setInitLoading(false);
    }
    init();
  }, []);

  async function handleSend(text: string) {
    const userMessage: ChatMessage = { role: "user", text };
    const historyWithUser = [...messages, userMessage];
    setMessages(historyWithUser);
    setSending(true);

    const tutorResult = await getTutorReply({
      history: historyWithUser,
      topic,
      reviewTerms: reviewItems.map((item) => item.term),
      remainingQuestions,
    });

    let tutorReplyText = "";
    if ("error" in tutorResult) {
      setMessages([...historyWithUser, { role: "tutor", text: `⚠️ ${tutorResult.error}` }]);
    } else {
      tutorReplyText = tutorResult.reply;
      setMessages([...historyWithUser, { role: "tutor", text: tutorReplyText }]);
      // Assume the reply used the next queued question — best-effort, not verified.
      setRemainingQuestions((prev) => prev.slice(1));
    }

    const feedbackResult = await generateFeedback(text);
    if (!("error" in feedbackResult)) {
      setFeedback(feedbackResult);
    }

    // Sequential (not Promise.all) so each item's read-modify-write of
    // data/vocabulary.json can't race with another item's in-flight update.
    for (const item of reviewItems) {
      const quality = determineQuality(item.term, text, tutorReplyText);
      try {
        await updateSpacedRepetition({ itemId: item.id, qualityRating: quality });
      } catch {
        // Best-effort per item — one failure shouldn't block the others or the chat.
      }
    }

    setSending(false);
  }

  if (initLoading) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <p className="text-sm text-gray-600">Bereitet Gespräch vor…</p>
      </main>
    );
  }

  if (initError) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <p className="text-sm text-red-600">{initError}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-semibold">KI-Tutor</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
        <ChatPanel messages={messages} sending={sending} onSend={handleSend} />
        <FeedbackPanel feedback={feedback} />
      </div>
    </main>
  );
}
