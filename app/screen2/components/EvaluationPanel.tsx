import type { EvaluationResult } from "@/app/actions/evaluateParaphrase";

function scoreColor(score: number): string {
  if (score >= 70) return "bg-green-100 text-green-700";
  if (score >= 40) return "bg-amber-100 text-amber-700";
  return "bg-red-100 text-red-700";
}

export default function EvaluationPanel({ result }: { result: EvaluationResult }) {
  // EvaluationResult only carries `is_correct` (a boolean), not a ready-made
  // sentence — Block 1's "one sentence" is composed here from that boolean
  // rather than adding a field the deliverable didn't ask for.
  const validitySentence = result.is_correct
    ? "Die Umformung ist grammatisch korrekt."
    : "Die Umformung ist noch nicht ganz korrekt.";

  return (
    <div className="mt-4 space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="font-semibold">Korrektheit</h3>
        <span
          className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${scoreColor(
            result.score
          )}`}
        >
          {result.score}/100
        </span>
        <p className="mt-2 text-sm text-gray-700">{validitySentence}</p>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="font-semibold">Grammatik-Feedback</h3>
        {result.feedback_correct.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {result.feedback_correct.map((point, index) => (
              <li key={index}>✅ {point}</li>
            ))}
          </ul>
        )}
        {result.feedback_errors.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm">
            {/* Each entry is already "<user version> → <correct version>" per the prompt */}
            {result.feedback_errors.map((point, index) => (
              <li key={index}>❌ {point}</li>
            ))}
          </ul>
        )}
        {result.feedback_errors.length === 0 && result.alternative && (
          <p className="mt-2 text-sm text-gray-700">
            Alternative Umformung: <em>{result.alternative}</em>
          </p>
        )}
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-semibold">C1-Politur</h3>
        <p className="mt-2 text-sm italic text-gray-800">
          „{result.c1_rewrite}"
        </p>
        <p className="mt-1 text-xs text-gray-600">{result.c1_explanation}</p>
      </div>
    </div>
  );
}
