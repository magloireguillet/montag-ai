import { z } from "zod/v4";

export const IncidentLocationSchema = z.object({
  address: z.string().min(1, "Adresse requise"),
  city: z.string().min(1, "Ville requise"),
  postalCode: z.string().min(1, "Code postal requis"),
  lat: z.number().optional(),
  lng: z.number().optional(),
  complement: z.string().optional(),
});

export const VictimInfoSchema = z.object({
  count: z.number().int().min(0),
  injured: z.number().int().min(0),
  trapped: z.number().int().min(0),
  description: z.string(),
});

export const CisuAlertSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  nature: z.string().min(1, "Nature du sinistre requise"),
  severity: z.enum(["extreme", "severe", "moderate", "minor", "unknown"]),
  urgency: z.enum(["immediate", "expected", "future", "past", "unknown"]),
  location: IncidentLocationSchema,
  victims: VictimInfoSchema,
  callerDescription: z.string(),
  recommendedForces: z.array(z.string()),
});

/**
 * Check how complete a CISU alert is (percentage of required fields filled).
 * Used to show a progress indicator on the dashboard.
 */
export function getAlertCompleteness(alert: unknown): {
  percentage: number;
  missingFields: string[];
} {
  const result = CisuAlertSchema.safeParse(alert);
  if (result.success) {
    return { percentage: 100, missingFields: [] };
  }

  const allRequired = ["nature", "location.address", "location.city", "location.postalCode"];
  const missingFields: string[] = [];

  for (const issue of result.error.issues) {
    const path = issue.path.join(".");
    if (allRequired.includes(path)) {
      missingFields.push(path);
    }
  }

  const filled = allRequired.length - missingFields.length;
  const percentage = Math.round((filled / allRequired.length) * 100);

  return { percentage, missingFields };
}
