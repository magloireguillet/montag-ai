"use client";

import { motion } from "framer-motion";
import { useCisuStore } from "@/store/cisu.store";
import { getAlertCompleteness } from "@/lib/cisu/validators";

export function CisuAlertCard() {
  const alert = useCisuStore((s) => s.currentAlert);

  if (!alert) {
    return (
      <div className="text-gray-500 text-sm italic p-4">
        En attente de fiche CISU...
      </div>
    );
  }

  const { percentage, missingFields } = getAlertCompleteness(alert);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white">Fiche CISU</h3>
        <span className="text-xs text-gray-400">{percentage}% complete</span>
      </div>

      <div className="w-full bg-gray-700 rounded-full h-1.5">
        <div
          className="bg-green-500 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <dl className="grid grid-cols-2 gap-2 text-sm">
        <Field label="Nature" value={alert.nature} />
        <Field label="Severite" value={alert.severity} />
        <Field label="Urgence" value={alert.urgency} />
        <Field label="Victimes" value={String(alert.victims.count)} />
        <Field label="Adresse" value={alert.location.address} span2 />
        <Field
          label="Ville"
          value={`${alert.location.postalCode} ${alert.location.city}`}
          span2
        />
        {alert.callerDescription && (
          <Field label="Description" value={alert.callerDescription} span2 />
        )}
      </dl>

      {missingFields.length > 0 && (
        <p className="text-xs text-yellow-500">
          Champs manquants : {missingFields.join(", ")}
        </p>
      )}
    </motion.div>
  );
}

function Field({
  label,
  value,
  span2,
}: {
  label: string;
  value: string;
  span2?: boolean;
}) {
  return (
    <div className={span2 ? "col-span-2" : ""}>
      <dt className="text-gray-500 text-xs">{label}</dt>
      <dd className="text-white">{value || "—"}</dd>
    </div>
  );
}
