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
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs">
        DE
      </div>
      <div className="flex gap-1 rounded-lg bg-gray-100 px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400"
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
    <section className="flex h-[70vh] flex-col rounded-lg border border-gray-200 bg-white">
      <h2 className="border-b border-gray-100 p-3 font-semibold">Gespräch</h2>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((message, index) =>
          message.role === "tutor" ? (
            <div key={index} className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs">
                DE
              </div>
              <div className="max-w-[80%] rounded-lg bg-gray-100 px-3 py-2 text-sm">
                {message.text}
              </div>
            </div>
          ) : (
            <div key={index} className="flex justify-end">
              <div className="max-w-[80%] rounded-lg bg-blue-600 px-3 py-2 text-sm text-white">
                {message.text}
              </div>
            </div>
          )
        )}
        {sending && <TypingIndicator />}
      </div>

      <div className="flex gap-2 border-t border-gray-100 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          rows={2}
          className="flex-1 resize-none rounded border border-gray-300 p-2 text-sm disabled:opacity-50"
          placeholder="Ihre Antwort auf Deutsch…"
        />
        <button
          type="button"
          onClick={submit}
          disabled={sending || input.trim().length === 0}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          Senden
        </button>
      </div>
    </section>
  );
}
