import type { CisuAlert, EdxlEnvelope } from "@/types/cisu.types";

/**
 * Convert raw LLM client_tool parameters into a CisuAlert structure.
 * Called from the clientTools callback (plain JS, outside React).
 */
export function formatCisuAlert(params: Record<string, unknown>): Partial<CisuAlert> {
  return {
    nature: asString(params.nature),
    severity: parseSeverity(params.severity),
    urgency: parseUrgency(params.urgency),
    location: {
      address: asString(params.address),
      city: asString(params.city),
      postalCode: asString(params.postal_code || params.postalCode),
      lat: asNumber(params.lat),
      lng: asNumber(params.lng),
      complement: asString(params.complement),
    },
    victims: {
      count: asInt(params.victim_count ?? params.victims),
      injured: asInt(params.injured),
      trapped: asInt(params.trapped),
      description: asString(params.victim_description),
    },
    callerDescription: asString(params.caller_description || params.description),
    recommendedForces: parseForces(params.forces || params.recommended_forces),
  };
}

/**
 * Wrap a CisuAlert in an EDXL-DE envelope for SGE injection.
 */
export function wrapInEdxlEnvelope(alert: CisuAlert): EdxlEnvelope {
  const now = new Date();
  const expires = new Date(now.getTime() + 60 * 60 * 1000); // +1h

  return {
    distributionId: `MONTAG-${alert.id}`,
    senderId: "montag-agent@ansc.interieur.gouv.fr",
    dateTimeSent: now.toISOString(),
    dateTimeExpires: expires.toISOString(),
    distributionStatus: "actual",
    distributionKind: "report",
    alert,
  };
}

// --- helpers ---

function asString(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function asNumber(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function asInt(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? Math.round(n) : 0;
}

function parseSeverity(v: unknown) {
  const s = asString(v).toLowerCase();
  const valid = ["extreme", "severe", "moderate", "minor"] as const;
  return valid.includes(s as (typeof valid)[number])
    ? (s as (typeof valid)[number])
    : "unknown" as const;
}

function parseUrgency(v: unknown) {
  const s = asString(v).toLowerCase();
  const valid = ["immediate", "expected", "future", "past"] as const;
  return valid.includes(s as (typeof valid)[number])
    ? (s as (typeof valid)[number])
    : "unknown" as const;
}

function parseForces(v: unknown): string[] {
  if (Array.isArray(v)) return v.map(String);
  if (typeof v === "string") return v.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}
