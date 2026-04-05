"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
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
        <motion.div
          key={line.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.25 }}
          className={`text-sm ${
            line.role === "user" ? "text-blue-300" : "text-green-300"
          }`}
        >
          <span className="font-semibold">
            {line.role === "user" ? "Appelant" : "Montag"}
          </span>
          : {line.text}
        </motion.div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
