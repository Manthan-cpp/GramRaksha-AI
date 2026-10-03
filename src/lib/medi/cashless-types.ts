import { z } from "zod";
import type { Evidence, EvidenceMetrics } from "@/lib/schemas";

export const CashlessEmpanelmentStatusSchema = z.enum([
  "empanelled_confirmed",
  "listed_in_registry",
  "verification_advisory"
]);
export type CashlessEmpanelmentStatus = z.infer<typeof CashlessEmpanelmentStatusSchema>;

export const CashlessEscalationTierSchema = z.object({
  tier: z.number().int().min(1).max(4),
  title: z.string(),
  authority: z.string(),
  actionText: z.string(),
  phone: z.string(),
  turnaround: z.string(),
  legalBasis: z.string()
});
export type CashlessEscalationTier = z.infer<typeof CashlessEscalationTierSchema>;

export const AyushmanCashlessRequestSchema = z.object({
  hospital: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  procedure: z.string().trim().min(1).max(120),
  depositDemanded: z.number().nonnegative(),
  patientName: z.string().trim().max(100).optional(),
  pmjayId: z.string().trim().max(100).optional(),
  demandedReason: z.string().trim().max(300).optional()
});
export type AyushmanCashlessRequest = z.infer<typeof AyushmanCashlessRequestSchema>;

export const AyushmanCashlessDecisionSchema = z.object({
  hospital: z.string(),
  city: z.string(),
  state: z.string(),
  procedure: z.string(),
  depositDemanded: z.number(),
  patientName: z.string(),
  pmjayId: z.string(),
  empanelmentStatus: CashlessEmpanelmentStatusSchema,
  empanelmentStatement: z.string(),
  statutoryClause: z.object({
    code: z.string(),
    title: z.string(),
    summary: z.string(),
    officialUrl: z.string()
  }),
  escalationLadder: z.array(CashlessEscalationTierSchema),
  letterEn: z.string(),
  letterHi: z.string(),
  letterBn: z.string(),
  speechSummary: z.string(),
  helplines: z.object({
    nationalTollFree: z.string(),
    nationalAlternate: z.string(),
    stateShaName: z.string(),
    stateShaTollFree: z.string(),
    statePortalUrl: z.string(),
    hospitalDeskNote: z.string()
  }),
  guidanceTips: z.array(z.string()),
  evidenceReferences: z.array(z.object({
    title: z.string(),
    url: z.string(),
    publisher: z.string(),
    snippet: z.string()
  }))
});
export type AyushmanCashlessDecision = z.infer<typeof AyushmanCashlessDecisionSchema>;

export interface BuildCashlessDecisionInput {
  request: AyushmanCashlessRequest;
  evidence: Evidence[];
  metrics?: EvidenceMetrics;
  warnings?: string[];
  locale?: "en" | "hi" | "bn";
}
