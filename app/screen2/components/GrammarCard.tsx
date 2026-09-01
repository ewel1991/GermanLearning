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
      <span className="font-medium text-amber-600">
        {sentence.slice(index, index + term.length)}
      </span>
      {sentence.slice(index + term.length)}
    </>
  );
}

export default function GrammarCard({ result }: { result: GrammarResult }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <h2 className="text-lg font-semibold">{result.structure_name}</h2>
      <p className="mt-2 text-sm leading-relaxed text-gray-700">
        {result.explanation}
      </p>

      <ul className="mt-3 space-y-2">
        {result.example_sentences.map((sentence, index) => (
          <li
            key={index}
            className="rounded border border-gray-100 bg-gray-50 p-2 text-sm italic"
          >
            {/* key_clause is looked up independently in each sentence — see plan note */}
            {highlight(sentence, result.key_clause)}
          </li>
        ))}
      </ul>
    </div>
  );
}
