"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { usePathname } from "next/navigation";

// Four independent per-screen countdowns (not one 25-minute clock) — each
// screen gets its own time budget, and only the slot matching the current
// route ticks down. Navigating away pauses it by substitution; navigating
// back resumes it right where it was, since the remaining values live here
// in Context rather than in a component that could unmount.
const SLOT_SECONDS = [8 * 60, 8 * 60, 9 * 60, 5 * 60]; // Screen 1, 2, 3, 4
const SLOT_LABELS = ["Vokabular", "Grammatik", "Tutor", "Wiederholung"];
const PATH_TO_SLOT: Record<string, number> = {
  "/screen1": 0,
  "/screen2": 1,
  "/screen3": 2,
  "/screen4": 3,
};

interface TimerContextValue {
  timeRemaining: number;
  isRunning: boolean;
  activeSlot: number;
  activeSlotLabel: string;
  justFinishedSlot: number | null;
  start: () => void;
  pause: () => void;
  reset: () => void;
}

const TimerContext = createContext<TimerContextValue | null>(null);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const activeSlot = PATH_TO_SLOT[pathname] ?? 0;

  const [isRunning, setIsRunning] = useState(false);
  const [justFinishedSlot, setJustFinishedSlot] = useState<number | null>(null);

  // The remaining-time array lives in a ref (not state) so the interval
  // callback below — created once per isRunning toggle — always reads and
  // mutates the current values directly instead of closing over a stale
  // array. `renderTick` just forces a re-render each second so the display
  // picks up the ref's new value.
  const slotRemainingRef = useRef<number[]>([...SLOT_SECONDS]);
  const [, setRenderTick] = useState(0);

  // Keeps the interval callback aware of route changes without recreating
  // the interval itself.
  const activeSlotRef = useRef(activeSlot);
  activeSlotRef.current = activeSlot;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = setInterval(() => {
      const slot = activeSlotRef.current;
      const remaining = slotRemainingRef.current;
      if (remaining[slot] <= 0) return;

      remaining[slot] -= 1;
      if (remaining[slot] === 0) {
        setJustFinishedSlot(slot);
      }
      setRenderTick((tick) => tick + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  // Auto-dismiss the "slot finished" toast/pulse after a few seconds.
  useEffect(() => {
    if (justFinishedSlot === null) return;
    const timeout = setTimeout(() => setJustFinishedSlot(null), 4000);
    return () => clearTimeout(timeout);
  }, [justFinishedSlot]);

  const start = useCallback(() => setIsRunning(true), []);
  const pause = useCallback(() => setIsRunning(false), []);
  const reset = useCallback(() => {
    setIsRunning(false);
    slotRemainingRef.current = [...SLOT_SECONDS];
    setJustFinishedSlot(null);
    setRenderTick((tick) => tick + 1);
  }, []);

  return (
    <TimerContext.Provider
      value={{
        timeRemaining: slotRemainingRef.current[activeSlot],
        isRunning,
        activeSlot,
        activeSlotLabel: SLOT_LABELS[activeSlot],
        justFinishedSlot,
        start,
        pause,
        reset,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer(): TimerContextValue {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error("useTimer must be used within a TimerProvider");
  }
  return ctx;
}
