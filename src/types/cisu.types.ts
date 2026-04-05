export type Severity = "extreme" | "severe" | "moderate" | "minor" | "unknown";
export type Urgency = "immediate" | "expected" | "future" | "past" | "unknown";
export type DistributionStatus = "actual" | "exercise" | "system" | "test";
export type DistributionKind = "report" | "update" | "cancel" | "request" | "response";

export interface VictimInfo {
  count: number;
  injured: number;
  trapped: number;
  description: string;
}

export interface IncidentLocation {
  address: string;
  city: string;
  postalCode: string;
  lat?: number;
  lng?: number;
  complement?: string;
}

export interface CisuAlert {
  id: string;
  createdAt: string;
  updatedAt: string;
  nature: string;
  severity: Severity;
  urgency: Urgency;
  location: IncidentLocation;
  victims: VictimInfo;
  callerDescription: string;
  recommendedForces: string[];
}

export interface EdxlEnvelope {
  distributionId: string;
  senderId: string;
  dateTimeSent: string;
  dateTimeExpires: string;
  distributionStatus: DistributionStatus;
  distributionKind: DistributionKind;
  alert: CisuAlert;
}
