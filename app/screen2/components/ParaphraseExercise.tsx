"use client";

import { useState } from "react";
import { evaluateParaphrase } from "@/app/actions/evaluateParaphrase";
import type { EvaluationResult } from "@/app/actions/evaluateParaphrase";
import EvaluationPanel from "./EvaluationPanel";

interface Props {
  baseSentence: string;
  structureName: string;
}

export default function ParaphraseExercise({ baseSentence, structureName }: Props) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);

  async function handleSubmit() {
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
      setEvaluation(result);
    }
    setLoading(false);
  }

  return (
    <div className="mt-4 rounded-xl border border-ink/10 bg-paper p-4">
      <h2 className="mb-2 font-display text-lg font-semibold text-ink">
        Übung
      </h2>
      <p className="rounded-lg border border-ink/10 bg-parchment p-2 text-sm italic text-ink">
        {baseSentence}
      </p>
      <p className="mt-2 text-sm text-ink/80">
        Formen Sie den Satz um. Verwenden Sie: {structureName}.
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        className="mt-2 w-full resize-y rounded-xl border border-ink/15 bg-paper p-2.5 text-sm text-ink"
        placeholder="Ihre Umformung…"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || answer.trim().length === 0}
        className="mt-2 w-full rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-gold-deep disabled:opacity-40 sm:w-auto"
      >
        {loading ? "Bewertet…" : "Bewertung anfordern"}
      </button>

      {error && <p className="mt-2 text-sm text-rust">{error}</p>}

      {evaluation && <EvaluationPanel result={evaluation} />}
    </div>
  );
}
