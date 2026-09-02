"use client";

import { useState, type KeyboardEvent } from "react";
import type { ChatMessage } from "@/app/actions/getTutorReply";

interface Props {
  messages: ChatMessage[];
  sending: boolean;
  onSend: (text: string) => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-light text-xs font-medium text-ink">
        DE
      </div>
      <div className="flex gap-1 rounded-xl bg-parchment px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, sending, onSend }: Props) {
  const [input, setInput] = useState("");

  function submit() {
    const text = input.trim();
    if (!text || sending) return;
    onSend(text);
    setInput("");
  }

  // Enter sends; Shift+Enter inserts a newline, standard chat-input convention.
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  }

  return (
    <section className="flex h-[70vh] flex-col rounded-xl border border-ink/10 bg-paper">
      <h2 className="border-b border-ink/10 p-3 font-display font-semibold text-ink">
        Gespräch
      </h2>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((message, index) =>
          message.role === "tutor" ? (
            <div key={index} className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gold-light text-xs font-medium text-ink">
                DE
              </div>
              <div className="max-w-[80%] rounded-xl bg-parchment px-3 py-2 text-sm text-ink">
                {message.text}
              </div>
            </div>
          ) : (
            <div key={index} className="flex justify-end">
              <div className="max-w-[80%] rounded-xl bg-navy px-3 py-2 text-sm text-parchment">
                {message.text}
              </div>
            </div>
          )
        )}
        {sending && <TypingIndicator />}
      </div>

      <div className="flex gap-2 border-t border-ink/10 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          rows={2}
          className="flex-1 resize-none rounded-xl border border-ink/15 bg-paper p-2 text-sm text-ink disabled:opacity-50"
          placeholder="Ihre Antwort auf Deutsch…"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || input.trim().length === 0}
          className="rounded-xl bg-gold px-4 py-2 text-sm font-medium text-ink transition-colors hover:bg-gold-deep disabled:opacity-40"
        >
          Senden
        </button>
      </div>
    </section>
  );
}
