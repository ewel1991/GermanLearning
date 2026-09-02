"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { identifyGrammar } from "@/app/actions/identifyGrammar";
import { generateGrammarForTopic } from "@/app/actions/generateGrammarForTopic";
import {
  CURRENT_CONTENT_EVENT,
  readCurrentContent,
  type ContentSource,
} from "@/lib/currentContent";
import { useSession } from "@/app/context/SessionContext";
import GrammarCard from "./components/GrammarCard";
import ParaphraseExercise from "./components/ParaphraseExercise";

export default function Screen2Page() {
  // The generated grammar (+ the exercise's answer/evaluation) lives in
  // SessionContext, keyed to the content "version" it was generated for —
  // so returning to this screen reuses it instead of paying for a fresh
  // (and non-deterministic) generation every time.
  const { grammar: grammarState, setGrammar } = useSession();
  const [status, setStatus] = useState<"checking" | "empty" | "ready">("checking");
  const [source, setSource] = useState<ContentSource>("text");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    function sync() {
      const { article, topic, source: currentSource, version } = readCurrentContent();
      const hasText = currentSource === "text" && !!article;
      const hasTopic = currentSource === "topic" && !!topic;

      if (!hasText && !hasTopic) {
        setStatus("empty");
        return;
      }

      setSource(currentSource);
      setStatus("ready");

      // Already generated for this exact content — reuse it, no new request.
      if (grammarState.grammar && grammarState.generatedForVersion === version) {
        return;
      }

      setError(null);
      setLoading(true);
      const request =
        currentSource === "topic" && topic
          ? generateGrammarForTopic(topic.title)
          : identifyGrammar(article ?? "");

      request.then((result) => {
        if ("error" in result) {
          setError(result.error);
        } else {
          setGrammar({
            grammar: result,
            generatedForVersion: version,
            paraphraseAnswer: "",
            paraphraseEvaluation: null,
          });
        }
        setLoading(false);
      });
    }

    sync();
    window.addEventListener(CURRENT_CONTENT_EVENT, sync);
    return () => window.removeEventListener(CURRENT_CONTENT_EVENT, sync);
    // Runs once on mount (plus on content-change events) by design — re-reads
    // grammarState fresh from context each time via the closure below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === "checking") {
    return null; // still checking localStorage
  }

  if (status === "empty") {
    return (
      <main className="mx-auto max-w-2xl p-4 md:p-8">
        <p className="text-muted">
          Bitte zuerst einen Artikel in Screen 1 laden.
        </p>
        <Link href="/screen1" className="mt-2 inline-block text-sm font-medium text-blue hover:underline">
          Zu Screen 1
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-fg">
        Grammatik &amp; Umformung
      </h1>

      {source === "topic" && (
        <p className="mb-4 text-xs text-muted">
          Themenbasiert generiert (kein Transkript verfügbar) — nicht aus dem
          konkreten Podcast-Inhalt analysiert.
        </p>
      )}

      {loading && <p className="text-sm text-muted">Analysiert Artikel…</p>}
      {error && <p className="text-sm text-rust">{error}</p>}

      {grammarState.grammar && (
        <>
          <GrammarCard result={grammarState.grammar} />
          <ParaphraseExercise
            baseSentence={grammarState.grammar.base_sentence}
            structureName={grammarState.grammar.structure_name}
          />
        </>
      )}
    </main>
  );
}
