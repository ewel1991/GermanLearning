"use client";

import { useEffect, useState } from "react";
import { useTimer } from "@/app/context/TimerContext";

function formatTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default function PomodoroTimer() {
  const {
    timeRemaining,
    isRunning,
    activeSlotLabel,
    justFinishedSlot,
    start,
    pause,
    reset,
  } = useTimer();

  // Pulses for exactly 3s when a slot finishes, independent of the toast's
  // own (longer) auto-dismiss timer in TimerContext.
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (justFinishedSlot === null) return;
    setPulsing(true);
    const timeout = setTimeout(() => setPulsing(false), 3000);
    return () => clearTimeout(timeout);
  }, [justFinishedSlot]);

  return (
    <div className="relative flex items-center gap-2">
      <div
        className={`flex items-center gap-2 rounded px-2 py-1 text-sm ${
          pulsing ? "animate-pulse bg-green-100 text-green-700" : "bg-gray-100"
        }`}
      >
        <span className="font-medium">{activeSlotLabel}</span>
        <span className="tabular-nums">{formatTime(timeRemaining)}</span>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={isRunning}
        className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        Start
      </button>
      <button
        type="button"
        onClick={pause}
        disabled={!isRunning}
        className="rounded bg-gray-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
      >
        Pause
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded bg-gray-200 px-2 py-1 text-xs font-medium text-gray-700"
      >
        Reset
      </button>

      {justFinishedSlot !== null && (
        <div className="absolute right-0 top-full mt-2 rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          Zeit für Screen {justFinishedSlot + 1}!
        </div>
      )}
    </div>
  );
}
