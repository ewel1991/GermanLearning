"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { identifyGrammar } from "@/app/actions/identifyGrammar";
import type { GrammarResult } from "@/app/actions/identifyGrammar";
import { readCurrentContent } from "@/lib/currentContent";
import GrammarCard from "./components/GrammarCard";
import ParaphraseExercise from "./components/ParaphraseExercise";

export default function Screen2Page() {
  // null = not checked yet, "" = checked and empty, string = article text
  const [article, setArticle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [grammar, setGrammar] = useState<GrammarResult | null>(null);

  useEffect(() => {
    const { article: currentArticle } = readCurrentContent();
    const text = currentArticle ?? "";
    setArticle(text);

    if (text) {
      setLoading(true);
      identifyGrammar(text).then((result) => {
        if ("error" in result) {
          setError(result.error);
        } else {
          setGrammar(result);
        }
        setLoading(false);
      });
    }
  }, []);

  if (article === null) {
    return null; // still checking localStorage
  }

  if (article === "") {
    return (
      <main className="mx-auto max-w-2xl p-4 md:p-8">
        <p className="text-gray-700">
          Bitte zuerst einen Artikel in Screen 1 laden.
        </p>
        <Link href="/screen1" className="mt-2 inline-block text-blue-600 hover:underline">
          Zu Screen 1
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-4 md:p-8">
      <h1 className="mb-6 text-2xl font-semibold">Grammatik & Umformung</h1>

      {loading && <p className="text-sm text-gray-600">Analysiert Artikel…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {grammar && (
        <>
          <GrammarCard result={grammar} />
          <ParaphraseExercise
            baseSentence={grammar.base_sentence}
            structureName={grammar.structure_name}
          />
        </>
      )}
    </main>
  );
}
