"use client";

import { useState } from "react";
import { saveVocabItem } from "@/app/actions/saveVocabItem";
import type { VocabExtractionItem } from "@/lib/types";
import type { CurrentTopic } from "@/lib/currentContent";

interface Props {
  item: VocabExtractionItem;
  topic: CurrentTopic;
}

// Wraps the term's first occurrence in the example sentence with a gold
// highlight. Simple case-insensitive substring match — approximate for
// inflected word forms, which is acceptable for a first pass.
function highlightTerm(sentence: string, term: string): React.ReactNode {
  const index = sentence.toLowerCase().indexOf(term.toLowerCase());
  if (index === -1) return sentence;
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
    <div className="rounded-xl border border-ink/10 bg-parchment p-3">
      <div className="font-display text-base font-semibold text-ink">
        {item.term}
      </div>
      <p className="mt-1 text-sm text-ink/80">{item.definition_de}</p>
      <p className="mt-1 text-sm italic text-slate">
        {highlightTerm(item.example_sentence, item.term)}
      </p>

      {saved ? (
        <span className="mt-2 inline-block rounded-full bg-moss/15 px-2.5 py-1 text-xs font-medium text-moss">
          ✓ Gespeichert
        </span>
      ) : (
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mt-2 rounded-lg bg-navy px-3 py-1.5 text-xs font-medium text-parchment disabled:opacity-40"
        >
          {saving ? "Speichert…" : "Speichern"}
        </button>
      )}
    </div>
  );
}
