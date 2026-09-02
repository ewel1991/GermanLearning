import type { GrammarResult } from "@/app/actions/identifyGrammar";

// Highlights the first case-insensitive occurrence of `term` inside `sentence`.
// Same approach as VocabCard.tsx's highlightTerm — approximate, but good
// enough for a single-word/short-clause visual cue.
function highlight(sentence: string, term: string): React.ReactNode {
  const index = sentence.toLowerCase().indexOf(term.toLowerCase());
  if (!term || index === -1) return sentence;
  return (
    <>
      {sentence.slice(0, index)}
      <span className="font-medium text-gold-deep">
        {sentence.slice(index, index + term.length)}
      </span>
      {sentence.slice(index + term.length)}
    </>
  );
}

export default function GrammarCard({ result }: { result: GrammarResult }) {
  return (
    <div className="rounded-xl border border-ink/10 bg-paper p-4">
      <h2 className="font-display text-lg font-semibold text-ink">
        {result.structure_name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-ink/80">
        {result.explanation}
      </p>

      <ul className="mt-3 space-y-2">
        {result.example_sentences.map((sentence, index) => (
          <li
            key={index}
            className="rounded-lg border border-ink/10 bg-parchment p-2 text-sm italic text-ink"
          >
            {/* key_clause is looked up independently in each sentence — see plan note */}
            {highlight(sentence, result.key_clause)}
          </li>
        ))}
      </ul>
    </div>
  );
}
