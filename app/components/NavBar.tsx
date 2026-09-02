"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PomodoroTimer from "./PomodoroTimer";
import SessionResetButton from "./SessionResetButton";

const TABS = [
  { href: "/screen1", label: "① Vokabular" },
  { href: "/screen2", label: "② Grammatik" },
  { href: "/screen3", label: "③ Tutor" },
  { href: "/screen4", label: "④ Wiederholung" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-surface text-fg">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <span className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue to-violet text-sm font-extrabold text-white">
              D
            </span>
            DeutschMeister
          </span>
          <div className="flex items-center gap-2 md:hidden">
            <PomodoroTimer />
            <SessionResetButton />
          </div>
        </div>

        <nav className="grid grid-cols-2 gap-1 sm:grid-cols-4 md:flex md:gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-xl px-3 py-2 text-center text-sm font-medium transition-colors md:text-left ${
                  active
                    ? "bg-blue text-white"
                    : "text-muted hover:bg-surface2 hover:text-fg"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <PomodoroTimer />
          <SessionResetButton />
        </div>
      </div>
    </header>
  );
}
