"use client";

import { useConversationContext } from "@/components/providers/ConversationWrapper";
import { TranscriptView } from "./TranscriptView";
import { CisuAlertCard } from "./CisuAlertCard";
import { IncidentMetrics } from "./IncidentMetrics";
import { JsonPreview } from "./JsonPreview";

export function OperatorDashboard() {
  const { status } = useConversationContext();

  return (
    <div className="h-full bg-gray-900 border-l border-gray-800 flex flex-col overflow-y-auto">
      <header className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white">Console SGO</h2>
        <StatusDot status={status} />
      </header>

      <section className="border-b border-gray-800">
        <SectionTitle>Transcription</SectionTitle>
        <TranscriptView />
      </section>

      <section className="border-b border-gray-800">
        <SectionTitle>Fiche CISU</SectionTitle>
        <IncidentMetrics />
        <CisuAlertCard />
      </section>

      <section>
        <JsonPreview />
      </section>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="px-4 pt-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
      {children}
    </h3>
  );
}

function StatusDot({ status }: { status: string }) {
  const color =
    status === "connected"
      ? "bg-green-500"
      : status === "connecting"
        ? "bg-yellow-500 animate-pulse"
        : "bg-gray-600";

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${color}`} />
      <span className="text-xs text-gray-400">{status}</span>
    </div>
  );
}
