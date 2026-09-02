"use client";

import { useSession } from "@/app/context/SessionContext";

export default function SessionResetButton() {
  const { resetSession } = useSession();

  function handleReset() {
    const confirmed = window.confirm(
      "Sitzung zurücksetzen? Geladene Inhalte, extrahiertes Vokabular, die Grammatik-Übung und der Tutor-Chat gehen verloren."
    );
    if (!confirmed) return;
    resetSession();
  }

  return (
    <button
      type="button"
      onClick={handleReset}
      title="Sitzung zurücksetzen"
      className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-muted transition-colors hover:bg-surface2 hover:text-fg"
    >
      ↺ Sitzung
    </button>
  );
}
