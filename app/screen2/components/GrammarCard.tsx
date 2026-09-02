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
      <span className="font-medium text-mint">
        {sentence.slice(index, index + term.length)}
      </span>
      {sentence.slice(index + term.length)}
    </>
  );
}

export default function GrammarCard({ result }: { result: GrammarResult }) {
  return (
    <div className="rounded-xl border border-white/10 bg-surface p-4">
      <h2 className="font-display text-lg font-bold text-fg">
        {result.structure_name}
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-fg/80">
        {result.explanation}
      </p>

      <ul className="mt-3 space-y-2">
        {result.example_sentences.map((sentence, index) => (
          <li
            key={index}
            className="rounded-lg border border-white/10 bg-surface2 p-2 text-sm italic text-fg"
          >
            {/* key_clause is looked up independently in each sentence — see plan note */}
            {highlight(sentence, result.key_clause)}
          </li>
        ))}
      </ul>
    </div>
  );
}
