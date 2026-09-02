"use client";

import { useState } from "react";
import { evaluateParaphrase } from "@/app/actions/evaluateParaphrase";
import { useSpeechToText } from "@/lib/useSpeechToText";
import { useSession } from "@/app/context/SessionContext";
import EvaluationPanel from "./EvaluationPanel";

interface Props {
  baseSentence: string;
  structureName: string;
}

export default function ParaphraseExercise({ baseSentence, structureName }: Props) {
  // Answer + evaluation live in SessionContext so they survive navigating
  // away and back, alongside the grammar result they belong to.
  const { grammar, setGrammar } = useSession();
  const answer = grammar.paraphraseAnswer;
  const evaluation = grammar.paraphraseEvaluation;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    supported: micSupported,
    recording,
    toggle: toggleRecording,
    stop: stopRecording,
  } = useSpeechToText(answer, (text) => setGrammar({ paraphraseAnswer: text }));

  async function handleSubmit() {
    if (recording) stopRecording();
    setLoading(true);
    setError(null);

    const result = await evaluateParaphrase({
      base_sentence: baseSentence,
      user_answer: answer,
      structure_name: structureName,
    });

    if ("error" in result) {
      setError(result.error);
    } else {
      setGrammar({ paraphraseEvaluation: result });
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 rounded-xl border border-white/10 bg-surface p-4">
      <h2 className="mb-2 font-display text-lg font-bold text-fg">Übung</h2>
      <p className="rounded-lg border border-white/10 bg-surface2 p-2 text-sm italic text-fg">
        {baseSentence}
      </p>
      <p className="mt-2 text-sm text-fg/80">
        Formen Sie den Satz um. Verwenden Sie: {structureName}.
      </p>

      {recording && (
        <div className="mt-2 flex items-center gap-2 text-xs font-medium text-rust">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rust" />
          Aufnahme läuft — sprechen Sie auf Deutsch…
        </div>
      )}

      <div className="mt-2 flex gap-2">
        <textarea
          value={answer}
          onChange={(e) => setGrammar({ paraphraseAnswer: e.target.value })}
          disabled={recording}
          rows={3}
          className="w-full flex-1 resize-y rounded-xl border border-white/10 bg-surface2 p-2.5 text-sm text-fg disabled:opacity-50"
          placeholder="Ihre Umformung…"
        />

        {micSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            title={recording ? "Aufnahme stoppen" : "Spracheingabe starten"}
            aria-pressed={recording}
            className={`shrink-0 self-start rounded-xl px-3 py-2.5 text-lg transition-colors ${
              recording
                ? "bg-rust text-white"
                : "bg-surface2 text-fg hover:bg-surface2/80"
            }`}
          >
            🎤
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || answer.trim().length === 0}
        className="mt-2 w-full rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:opacity-40 sm:w-auto"
      >
        {loading ? "Bewertet…" : "Bewertung anfordern"}
      </button>

      {error && <p className="mt-2 text-sm text-rust">{error}</p>}

      {evaluation && <EvaluationPanel result={evaluation} />}
    </div>
  );
}
