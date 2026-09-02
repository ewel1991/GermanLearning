"use client";

import { useState } from "react";
import { saveVocabItem } from "@/app/actions/saveVocabItem";
import type { VocabExtractionItem } from "@/lib/types";
import type { CurrentTopic } from "@/lib/currentContent";

interface Props {
  item: VocabExtractionItem;
  topic: CurrentTopic;
}

// Wraps the term's first occurrence in the example sentence with a mint
// highlight. Simple case-insensitive substring match — approximate for
// inflected word forms, which is acceptable for a first pass.
function highlightTerm(sentence: string, term: string): React.ReactNode {
  const index = sentence.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return sentence;
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

export default function VocabCard({ item, topic }: Props) {
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    await saveVocabItem({
      topic_id: topic.id,
      topic_title: topic.title,
      term: item.term,
      definition_de: item.definition_de,
      example_sentence: item.example_sentence,
    });
    setSaved(true);
    setSaving(false);
  }

  return (
    <div className="rounded-xl border border-white/10 bg-surface2 p-3">
      <div className="font-display text-base font-bold text-fg">
        {item.term}
      </div>
      <p className="mt-1 text-sm text-fg/80">{item.definition_de}</p>
      <p className="mt-1 text-sm italic text-muted">
        {highlightTerm(item.example_sentence, item.term)}
      </p>

      {saved ? (
        <span className="mt-2 inline-block rounded-full bg-mint/15 px-2.5 py-1 text-xs font-medium text-mint">
          ✓ Gespeichert
        </span>
      ) : (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-2 rounded-lg bg-blue px-3 py-1.5 text-xs font-medium text-white disabled:opacity-40"
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
      )}
    </div>
  );
}
