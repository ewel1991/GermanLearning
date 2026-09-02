"use client";

import { useState, type ReactNode } from "react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}

export default function CollapsibleSection({
  title,
  defaultOpen = true,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-ink/10 bg-paper">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-3 text-left font-display font-semibold text-ink"
      >
        {title}
        <span
          className={`text-slate transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        >
          ▾
        </span>
      </button>
      {open && (
        <div className="border-t border-ink/10 p-3 text-sm text-ink/80">
          {children}
        </div>
      )}
    </div>
  );
}
