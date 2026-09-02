import type { FeedbackResult } from "@/app/actions/generateFeedback";
import CollapsibleSection from "./CollapsibleSection";

export default function FeedbackPanel({
  feedback,
}: {
  feedback: FeedbackResult | null;
}) {
  if (!feedback) {
    return (
      <section className="rounded-xl border border-white/10 bg-surface p-4">
        <h2 className="mb-3 font-display font-bold text-fg">Feedback</h2>
        <p className="text-sm text-muted">
          Sobald Sie eine Nachricht senden, erscheint hier Ihr Feedback.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="font-display font-bold text-fg">Feedback</h2>

      <CollapsibleSection title="Grammatik & Orthografie">
        {feedback.grammar_errors.length === 0 ? (
          <p>Keine Fehler. Weiter so!</p>
        ) : (
          <ul className="space-y-1">
            {feedback.grammar_errors.map((error, index) => (
              <li key={index}>
                ❌ {error.user} → ✅ {error.correct}
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Ausdruck & Eleganz (B2 → C1)">
        {feedback.style_upgrades.length === 0 ? (
          <p>Bereits auf C1-Niveau ausgedrückt.</p>
        ) : (
          <ul className="space-y-2">
            {feedback.style_upgrades.map((upgrade, index) => (
              <li key={index}>
                <div>
                  💬 {upgrade.user} → ✨ {upgrade.c1}
                </div>
                <div className="text-xs text-muted">{upgrade.note}</div>
              </li>
            ))}
          </ul>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Sprachfluss-Hinweis">
        <p>{feedback.fluency_comment}</p>
      </CollapsibleSection>
    </section>
  );
}
