"use client";

import { useState } from "react";
import { getRandomVocabularyItems } from "@/app/actions/getRandomVocabularyItems";
import { updateSpacedRepetition } from "@/app/actions/updateSpacedRepetition";
import { useSession } from "@/app/context/SessionContext";

const CARD_COUNT = 3;

// Quality ratings feed the same SM-2-style algorithm updateSpacedRepetition.ts
// already uses for the Tutor screen (0–5; below 3 resets the interval).
const RATINGS = [
  { label: "Nochmal", quality: 2, className: "bg-rust text-white hover:bg-rust/80" },
  { label: "Gut", quality: 4, className: "bg-blue text-white hover:bg-blue-deep" },
  { label: "Leicht", quality: 5, className: "bg-mint text-bg hover:bg-mint/80" },
];

export default function Screen4Page() {
  const { flashcards, setFlashcards } = useSession();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startReview() {
    setLoading(true);
    setError(null);
    const result = await getRandomVocabularyItems(CARD_COUNT);
    if ("error" in result) {
      setError(result.error);
    } else {
      setFlashcards({ cards: result, currentIndex: 0, revealed: false });
    }
    setLoading(false);
  }

  async function handleRate(itemId: string, quality: number) {
    setRating(true);
    try {
      await updateSpacedRepetition({ itemId, qualityRating: quality });
    } catch {
      // Best-effort — a failed stats update shouldn't block moving on.
    }
    setFlashcards({
      currentIndex: flashcards.currentIndex + 1,
      revealed: false,
    });
    setRating(false);
  }

  return (
    <main className="mx-auto max-w-2xl p-4 md:p-8">
      <h1 className="mb-6 font-display text-2xl font-bold text-fg">
        Wiederholung
      </h1>

      {flashcards.cards === null && (
        <div className="rounded-2xl border border-white/10 bg-surface p-4 md:p-5">
          <p className="text-sm text-fg/80">
            Übe bis zu {CARD_COUNT} zufällig ausgewählte Vokabeln aus deiner
            gespeicherten Liste.
          </p>
          <button
            type="button"
            onClick={startReview}
            disabled={loading}
            className="mt-3 rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:opacity-40"
          >
            {loading ? "Lädt…" : "Wiederholung starten"}
          </button>
          {error && <p className="mt-2 text-sm text-rust">{error}</p>}
        </div>
      )}

      {flashcards.cards !== null && flashcards.currentIndex >= flashcards.cards.length && (
        <div className="rounded-2xl border border-white/10 bg-surface p-4 md:p-5">
          <p className="text-sm text-fg/80">
            Fertig! Du hast {flashcards.cards.length}{" "}
            {flashcards.cards.length === 1 ? "Vokabel" : "Vokabeln"} wiederholt.
          </p>
          <button
            type="button"
            onClick={startReview}
            disabled={loading}
            className="mt-3 rounded-xl bg-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:opacity-40"
          >
            {loading ? "Lädt…" : "Neue Wiederholung starten"}
          </button>
        </div>
      )}

      {flashcards.cards !== null && flashcards.currentIndex < flashcards.cards.length && (
        <div className="rounded-2xl border border-white/10 bg-surface p-4 md:p-5">
          <p className="mb-3 text-xs font-medium text-muted">
            Karte {flashcards.currentIndex + 1} von {flashcards.cards.length}
          </p>

          {(() => {
            const card = flashcards.cards![flashcards.currentIndex];
            return (
              <>
                <div className="font-display text-2xl font-bold text-fg">
                  {card.term}
                </div>

                {!flashcards.revealed ? (
                  <button
                    type="button"
                    onClick={() => setFlashcards({ revealed: true })}
                    className="mt-4 w-full rounded-xl bg-surface2 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-surface2/80"
                  >
                    Antwort zeigen
                  </button>
                ) : (
                  <>
                    <p className="mt-3 text-sm text-fg/80">{card.definition_de}</p>
                    <p className="mt-2 rounded-lg border border-white/10 bg-surface2 p-2 text-sm italic text-fg">
                      {card.example_sentence}
                    </p>

                    <p className="mt-4 mb-2 text-xs font-medium text-muted">
                      Wie gut kanntest du diese Vokabel?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {RATINGS.map((r) => (
                        <button
                          key={r.label}
                          type="button"
                          onClick={() => handleRate(card.id, r.quality)}
                          disabled={rating}
                          className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors disabled:opacity-40 ${r.className}`}
                        >
                          {r.label}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </>
            );
          })()}
        </div>
      )}
    </main>
  );
}
