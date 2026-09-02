"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import PomodoroTimer from "./PomodoroTimer";

const TABS = [
  { href: "/screen1", label: "① Vokabular" },
  { href: "/screen2", label: "② Grammatik" },
  { href: "/screen3", label: "③ Tutor" },
];

export default function NavBar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b-2 border-gold bg-navy text-parchment">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:justify-between md:gap-4 md:px-8">
        <div className="flex items-center justify-between gap-4">
          <span className="font-display text-lg font-semibold tracking-tight">
            DeutschMeister
          </span>
          <div className="md:hidden">
            <PomodoroTimer />
          </div>
        </div>

        <nav className="grid grid-cols-3 gap-1 md:flex md:gap-1">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`rounded-xl px-3 py-2 text-center text-sm font-medium transition-colors md:text-left ${
                  active
                    ? "bg-gold text-ink"
                    : "text-parchment/80 hover:bg-navy-light hover:text-parchment"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block">
          <PomodoroTimer />
        </div>
      </div>
    </header>
  );
}
