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
    <div className="rounded-lg border border-gray-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between p-3 text-left font-semibold"
      >
        {title}
        <span
          className={`transition-transform ${open ? "rotate-180" : "rotate-0"}`}
        >
          ▾
        </span>
      </button>
      {open && <div className="border-t border-gray-100 p-3 text-sm">{children}</div>}
    </div>
  );
}
