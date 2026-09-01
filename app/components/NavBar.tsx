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
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
        <span className="font-bold">DeutschMeister</span>

        <nav className="flex gap-4">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`border-b-2 pb-1 text-sm font-medium ${
                  active
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-600 hover:text-gray-900"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>

        <PomodoroTimer />
      </div>
    </header>
  );
}
