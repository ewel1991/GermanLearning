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
    <div className="relative flex items-center gap-1.5">
      <div
        className={`flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-sm ${
          pulsing ? "animate-pulse bg-moss text-white" : "bg-navy-light text-parchment"
        }`}
      >
        <span className="font-medium">{activeSlotLabel}</span>
        <span className="tabular-nums">{formatTime(timeRemaining)}</span>
      </div>

      <button
        type="button"
        onClick={start}
        disabled={isRunning}
        className="rounded-xl bg-gold px-2.5 py-1.5 text-xs font-medium text-ink disabled:opacity-40"
      >
        Start
      </button>
      <button
        type="button"
        onClick={pause}
        disabled={!isRunning}
        className="rounded-xl bg-navy-light px-2.5 py-1.5 text-xs font-medium text-parchment disabled:opacity-40"
      >
        Pause
      </button>
      <button
        type="button"
        onClick={reset}
        className="rounded-xl px-2.5 py-1.5 text-xs font-medium text-parchment/70 hover:text-parchment"
      >
        Reset
      </button>

      {justFinishedSlot !== null && (
        <div className="absolute right-0 top-full mt-2 rounded-xl bg-moss px-3 py-1.5 text-xs font-medium text-white shadow-lg">
          Zeit für Screen {justFinishedSlot + 1}!
        </div>
      )}
    </div>
  );
}
