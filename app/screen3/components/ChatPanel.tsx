"use client";

import { useState, type KeyboardEvent } from "react";
import type { ChatMessage } from "@/app/actions/getTutorReply";
import { useSpeechToText } from "@/lib/useSpeechToText";

interface Props {
  messages: ChatMessage[];
  sending: boolean;
  onSend: (text: string) => void;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet/20 text-xs font-medium text-violet">
        DE
      </div>
      <div className="flex gap-1 rounded-xl bg-surface2 px-3 py-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

export default function ChatPanel({ messages, sending, onSend }: Props) {
  const [input, setInput] = useState("");
  const { supported: micSupported, recording, toggle: toggleRecording, stop: stopRecording } =
    useSpeechToText(input, setInput);

  function submit() {
    if (recording) stopRecording();
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
    <section className="flex h-[70vh] flex-col rounded-xl border border-white/10 bg-surface">
      <h2 className="border-b border-white/10 p-3 font-display font-bold text-fg">
        Gespräch
      </h2>

      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {messages.map((message, index) =>
          message.role === "tutor" ? (
            <div key={index} className="flex items-start gap-2">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-violet/20 text-xs font-medium text-violet">
                DE
              </div>
              <div className="max-w-[80%] rounded-xl bg-surface2 px-3 py-2 text-sm text-fg">
                {message.text}
              </div>
            </div>
          ) : (
            <div key={index} className="flex justify-end">
              <div className="max-w-[80%] rounded-xl bg-blue px-3 py-2 text-sm text-white">
                {message.text}
              </div>
            </div>
          )
        )}
        {sending && <TypingIndicator />}
      </div>

      {recording && (
        <div className="flex items-center gap-2 border-t border-white/10 px-3 pt-2 text-xs font-medium text-rust">
          <span className="h-2 w-2 animate-pulse rounded-full bg-rust" />
          Aufnahme läuft — sprechen Sie auf Deutsch…
        </div>
      )}

      <div className="flex gap-2 border-t border-white/10 p-3">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending || recording}
          rows={2}
          className="flex-1 resize-none rounded-xl border border-white/10 bg-surface2 p-2 text-sm text-fg disabled:opacity-50"
          placeholder="Ihre Antwort auf Deutsch…"
        />

        {micSupported && (
          <button
            type="button"
            onClick={toggleRecording}
            disabled={sending}
            title={recording ? "Aufnahme stoppen" : "Spracheingabe starten"}
            aria-pressed={recording}
            className={`shrink-0 rounded-xl px-3 text-lg transition-colors disabled:opacity-40 ${
              recording
                ? "bg-rust text-white"
                : "bg-surface2 text-fg hover:bg-surface2/80"
            }`}
          >
            🎤
          </button>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={sending || input.trim().length === 0}
          className="rounded-xl bg-blue px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-deep disabled:opacity-40"
        >
          Senden
        </button>
      </div>
    </section>
  );
}
