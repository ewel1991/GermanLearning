"use client";

import { useEffect, useState } from "react";
import { getReviewItems } from "@/app/actions/getReviewItems";
import { generateQuestions } from "@/app/actions/generateQuestions";
import { getTutorReply } from "@/app/actions/getTutorReply";
import type { ChatMessage } from "@/app/actions/getTutorReply";
import { generateFeedback } from "@/app/actions/generateFeedback";
import { updateSpacedRepetition } from "@/app/actions/updateSpacedRepetition";
import { readCurrentContent } from "@/lib/currentContent";
import { useSession } from "@/app/context/SessionContext";
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
  // The whole conversation lives in SessionContext so navigating away and
  // back doesn't restart it. `tutor.initialized` gates the one-time setup
  // below; resetting the session flips it back to false, which — since it's
  // a dependency here — re-runs this effect immediately even without a
  // remount.
  const { tutor, setTutor } = useSession();
  const [initLoading, setInitLoading] = useState(!tutor.initialized);
  const [initError, setInitError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (tutor.initialized) return;

    async function init() {
      setInitLoading(true);
      const items = await getReviewItems();
      const topicTitle = readCurrentContent().topic?.title ?? FALLBACK_TOPIC;

      const result = await generateQuestions({
        topic: topicTitle,
        terms: items.map((item) => item.term),
      });

      if ("error" in result) {
        setInitError(result.error);
        setInitLoading(false);
        return;
      }

      setTutor({
        initialized: true,
        reviewItems: items,
        topic: topicTitle,
        messages: [{ role: "tutor", text: result[0] }],
        remainingQuestions: result.slice(1),
      });
      setInitLoading(false);
    }
    init();
  }, [tutor.initialized, setTutor]);

  async function handleSend(text: string) {
    const userMessage: ChatMessage = { role: "user", text };
    const historyWithUser = [...tutor.messages, userMessage];
    setTutor({ messages: historyWithUser });
    setSending(true);

    const tutorResult = await getTutorReply({
      history: historyWithUser,
      topic: tutor.topic,
      reviewTerms: tutor.reviewItems.map((item) => item.term),
      remainingQuestions: tutor.remainingQuestions,
    });

    let tutorReplyText = "";
    if ("error" in tutorResult) {
      setTutor({
        messages: [...historyWithUser, { role: "tutor", text: `⚠️ ${tutorResult.error}` }],
      });
    } else {
      tutorReplyText = tutorResult.reply;
      setTutor({
        messages: [...historyWithUser, { role: "tutor", text: tutorReplyText }],
        // Assume the reply used the next queued question — best-effort, not verified.
        remainingQuestions: tutor.remainingQuestions.slice(1),
      });
    }

    const feedbackResult = await generateFeedback(text);
    if (!("error" in feedbackResult)) {
      setTutor({ feedback: feedbackResult });
    }

    // Sequential (not Promise.all) so each item's read-modify-write of
    // data/vocabulary.json can't race with another item's in-flight update.
    for (const item of tutor.reviewItems) {
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
        <p className="text-sm text-muted">Bereitet Gespräch vor…</p>
      </main>
    );
  }

  if (initError) {
    return (
      <main className="mx-auto max-w-6xl p-4 md:p-8">
        <p className="text-sm text-rust">{initError}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl p-4 md:p-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-fg">
        KI-Tutor
      </h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[3fr_2fr]">
        <ChatPanel messages={tutor.messages} sending={sending} onSend={handleSend} />
        <FeedbackPanel feedback={tutor.feedback} />
      </div>
    </main>
  );
}
