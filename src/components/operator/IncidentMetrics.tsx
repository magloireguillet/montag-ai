"use client";

import { motion } from "framer-motion";
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

  const badges = [
    { key: "severity", label: "Severite", value: alert.severity, colorMap: SEVERITY_COLORS },
    { key: "urgency", label: "Urgence", value: alert.urgency, colorMap: URGENCY_COLORS },
  ];

  return (
    <div className="flex flex-wrap gap-2 p-4">
      {badges.map((b, i) => (
        <motion.span
          key={b.key}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: i * 0.1, type: "spring", stiffness: 400, damping: 15 }}
          className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
            b.colorMap[b.value] ?? "bg-gray-600"
          }`}
        >
          {b.label}: {b.value}
        </motion.span>
      ))}
      {alert.victims.count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 400, damping: 15 }}
          className="px-3 py-1 rounded-full text-xs font-medium bg-red-800 text-white"
        >
          {alert.victims.count} victime{alert.victims.count > 1 ? "s" : ""}
        </motion.span>
      )}
      {alert.recommendedForces.map((force, i) => (
        <motion.span
          key={force}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 400, damping: 15 }}
          className="px-3 py-1 rounded-full text-xs font-medium bg-blue-800 text-white"
        >
          {force}
        </motion.span>
      ))}
    </div>
  );
}
