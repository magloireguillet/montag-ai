"use client";

import { useState } from "react";
import { useCisuStore } from "@/store/cisu.store";
import { wrapInEdxlEnvelope } from "@/lib/cisu/formatter";

export function JsonPreview() {
  const alert = useCisuStore((s) => s.currentAlert);
  const [open, setOpen] = useState(false);

  if (!alert) return null;

  const envelope = wrapInEdxlEnvelope(alert);
  const json = JSON.stringify(envelope, null, 2);

  return (
    <div className="p-4">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-white transition-colors"
      >
        {open ? "Masquer" : "Afficher"} le JSON EDXL-DE
      </button>
      {open && (
        <pre className="mt-2 p-3 bg-gray-900 rounded text-xs text-green-400 overflow-x-auto max-h-[400px]">
          {json}
        </pre>
      )}
    </div>
  );
}
