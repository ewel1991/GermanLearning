"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { ArticleResult, PodcastEpisode, VocabExtractionItem, YouTubeVideo } from "@/lib/types";
import type { GrammarResult } from "@/app/actions/identifyGrammar";
import type { EvaluationResult } from "@/app/actions/evaluateParaphrase";
import type { ChatMessage } from "@/app/actions/getTutorReply";
import type { FeedbackResult } from "@/app/actions/generateFeedback";
import type { VocabularyItem } from "@/lib/vocabulary";
import { clearCurrentContent } from "@/lib/currentContent";

// Holds each screen's in-progress results across client-side navigation.
// Next.js unmounts a route's component tree on every navigation, so any
// state living in useState there (a loaded article, extracted vocab, the
// tutor chat) is lost the moment you switch tabs. Lifting it here — a
// provider mounted once in the root layout, same as TimerContext — keeps it
// alive for the whole session; resetSession() is the explicit, opt-in way
// to clear it and start fresh.

export type ContentType = "article" | "youtube" | "podcast";

interface VocabSessionState {
  selectedTopicId: number | null;
  contentType: ContentType;
  article: ArticleResult | null;
  videos: YouTubeVideo[] | null;
  podcasts: PodcastEpisode[] | null;
  uploadedFile: { name: string; preview: string } | null;
  items: VocabExtractionItem[] | null;
}

interface GrammarSessionState {
  // The current_content "version" this result was generated for — lets
  // Screen2 tell a still-valid cached result from a stale one instead of
  // regenerating on every visit.
  generatedForVersion: number | null;
  grammar: GrammarResult | null;
  paraphraseAnswer: string;
  paraphraseEvaluation: EvaluationResult | null;
}

interface TutorSessionState {
  initialized: boolean;
  reviewItems: VocabularyItem[];
  topic: string;
  remainingQuestions: string[];
  messages: ChatMessage[];
  feedback: FeedbackResult | null;
}

interface FlashcardSessionState {
  cards: VocabularyItem[] | null;
  currentIndex: number;
  revealed: boolean;
}

const initialVocabState: VocabSessionState = {
  selectedTopicId: null,
  contentType: "article",
  article: null,
  videos: null,
  podcasts: null,
  uploadedFile: null,
  items: null,
};

const initialGrammarState: GrammarSessionState = {
  generatedForVersion: null,
  grammar: null,
  paraphraseAnswer: "",
  paraphraseEvaluation: null,
};

const initialTutorState: TutorSessionState = {
  initialized: false,
  reviewItems: [],
  topic: "",
  remainingQuestions: [],
  messages: [],
  feedback: null,
};

const initialFlashcardState: FlashcardSessionState = {
  cards: null,
  currentIndex: 0,
  revealed: false,
};

interface SessionContextValue {
  vocab: VocabSessionState;
  setVocab: (update: Partial<VocabSessionState>) => void;
  grammar: GrammarSessionState;
  setGrammar: (update: Partial<GrammarSessionState>) => void;
  tutor: TutorSessionState;
  setTutor: (update: Partial<TutorSessionState>) => void;
  flashcards: FlashcardSessionState;
  setFlashcards: (update: Partial<FlashcardSessionState>) => void;
  resetSession: () => void;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [vocab, setVocabState] = useState<VocabSessionState>(initialVocabState);
  const [grammar, setGrammarState] = useState<GrammarSessionState>(initialGrammarState);
  const [tutor, setTutorState] = useState<TutorSessionState>(initialTutorState);
  const [flashcards, setFlashcardsState] = useState<FlashcardSessionState>(initialFlashcardState);

  const setVocab = useCallback((update: Partial<VocabSessionState>) => {
    setVocabState((prev) => ({ ...prev, ...update }));
  }, []);
  const setGrammar = useCallback((update: Partial<GrammarSessionState>) => {
    setGrammarState((prev) => ({ ...prev, ...update }));
  }, []);
  const setTutor = useCallback((update: Partial<TutorSessionState>) => {
    setTutorState((prev) => ({ ...prev, ...update }));
  }, []);
  const setFlashcards = useCallback((update: Partial<FlashcardSessionState>) => {
    setFlashcardsState((prev) => ({ ...prev, ...update }));
  }, []);

  const resetSession = useCallback(() => {
    setVocabState(initialVocabState);
    setGrammarState(initialGrammarState);
    setTutorState(initialTutorState);
    setFlashcardsState(initialFlashcardState);
    clearCurrentContent();
  }, []);

  return (
    <SessionContext.Provider
      value={{
        vocab,
        setVocab,
        grammar,
        setGrammar,
        tutor,
        setTutor,
        flashcards,
        setFlashcards,
        resetSession,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return ctx;
}
