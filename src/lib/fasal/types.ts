import {
  FasalCalamityType,
  FasalPhotoEvidence,
  FasalCountdownStatus,
  FasalDecision
} from "@/lib/schemas";

export interface FasalIncidentInput {
  calamityType: FasalCalamityType;
  incidentTime: string; // ISO string
  state: string;
  district: string;
  village: string;
  khasraNo?: string;
  applicationNo?: string;
  bankAccountRef?: string;
  crop: string;
  areaAcres?: number;
  lossPercentage: number;
  farmerName: string;
  farmerPhone?: string;
}

export type {
  FasalCalamityType,
  FasalPhotoEvidence,
  FasalCountdownStatus,
  FasalDecision
};
