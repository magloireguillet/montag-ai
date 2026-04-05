"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/store/session.store";

export function TranscriptView() {
  const lines = useSessionStore((s) => s.transcriptLines);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [lines]);

  if (lines.length === 0) {
    return (
      <div className="text-gray-500 text-sm italic p-4">
        En attente de transcription...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-4 overflow-y-auto max-h-[300px]">
      {lines.map((line) => (
        <div
          key={line.id}
          className={`text-sm ${
            line.role === "user" ? "text-blue-300" : "text-green-300"
          }`}
        >
          <span className="font-semibold">
            {line.role === "user" ? "Appelant" : "Montag"}
          </span>
          : {line.text}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
