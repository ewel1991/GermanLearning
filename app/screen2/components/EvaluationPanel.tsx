import type { EvaluationResult } from "@/app/actions/evaluateParaphrase";

function scoreColor(score: number): string {
  if (score >= 70) return "bg-moss/15 text-moss";
  if (score >= 40) return "bg-gold-light/40 text-gold-deep";
  return "bg-rust/10 text-rust";
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
      <div className="rounded-xl border border-ink/10 bg-paper p-4">
        <h3 className="font-display font-semibold text-ink">Korrektheit</h3>
        <span
          className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-bold ${scoreColor(
            result.score
          )}`}
        >
          {result.score}/100
        </span>
        <p className="mt-2 text-sm text-ink/80">{validitySentence}</p>
      </div>

      <div className="rounded-xl border border-ink/10 bg-paper p-4">
        <h3 className="font-display font-semibold text-ink">
          Grammatik-Feedback
        </h3>
        {result.feedback_correct.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-ink/80">
            {result.feedback_correct.map((point, index) => (
              <li key={index}>✅ {point}</li>
            ))}
          </ul>
        )}
        {result.feedback_errors.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-ink/80">
            {/* Each entry is already "<user version> → <correct version>" per the prompt */}
            {result.feedback_errors.map((point, index) => (
              <li key={index}>❌ {point}</li>
            ))}
          </ul>
        )}
        {result.feedback_errors.length === 0 && result.alternative && (
          <p className="mt-2 text-sm text-ink/80">
            Alternative Umformung: <em>{result.alternative}</em>
          </p>
        )}
      </div>

      <div className="rounded-xl border border-gold/30 bg-gold-light/20 p-4">
        <h3 className="font-display font-semibold text-ink">C1-Politur</h3>
        <p className="mt-2 text-sm italic text-ink">
          „{result.c1_rewrite}"
        </p>
        <p className="mt-1 text-xs text-slate">{result.c1_explanation}</p>
      </div>
    </div>
  );
}
