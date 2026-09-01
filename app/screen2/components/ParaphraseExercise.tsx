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
    <div className="mt-4 rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="mb-2 font-semibold">Übung</h2>
      <p className="rounded border border-gray-100 bg-gray-50 p-2 text-sm italic">
        {baseSentence}
      </p>
      <p className="mt-2 text-sm text-gray-700">
        Formen Sie den Satz um. Verwenden Sie: {structureName}.
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={3}
        className="mt-2 w-full resize-y rounded border border-gray-300 p-2 text-sm"
        placeholder="Ihre Umformung…"
      />

      <button
        type="button"
        onClick={handleSubmit}
        disabled={loading || answer.trim().length === 0}
        className="mt-2 rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {loading ? "Bewertet…" : "Bewertung anfordern"}
      </button>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {evaluation && <EvaluationPanel result={evaluation} />}
    </div>
  );
}
