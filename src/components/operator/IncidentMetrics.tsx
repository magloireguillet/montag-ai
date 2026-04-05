"use client";

import { useCisuStore } from "@/store/cisu.store";

const SEVERITY_COLORS: Record<string, string> = {
  extreme: "bg-red-600",
  severe: "bg-orange-600",
  moderate: "bg-yellow-600",
  minor: "bg-green-600",
  unknown: "bg-gray-600",
};

const URGENCY_COLORS: Record<string, string> = {
  immediate: "bg-red-600",
  expected: "bg-orange-600",
  future: "bg-yellow-600",
  past: "bg-gray-600",
  unknown: "bg-gray-600",
};

export function IncidentMetrics() {
  const alert = useCisuStore((s) => s.currentAlert);

  if (!alert) return null;

  return (
    <div className="flex flex-wrap gap-2 p-4">
      <Badge label="Severite" value={alert.severity} colorMap={SEVERITY_COLORS} />
      <Badge label="Urgence" value={alert.urgency} colorMap={URGENCY_COLORS} />
      {alert.victims.count > 0 && (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-red-800 text-white">
          {alert.victims.count} victime{alert.victims.count > 1 ? "s" : ""}
        </span>
      )}
      {alert.recommendedForces.map((force) => (
        <span
          key={force}
          className="px-3 py-1 rounded-full text-xs font-medium bg-blue-800 text-white"
        >
          {force}
        </span>
      ))}
    </div>
  );
}

function Badge({
  label,
  value,
  colorMap,
}: {
  label: string;
  value: string;
  colorMap: Record<string, string>;
}) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
        colorMap[value] ?? "bg-gray-600"
      }`}
    >
      {label}: {value}
    </span>
  );
}
