import type { Claim, Evidence } from "@/lib/schemas";
import { lintClaim, lintEvidenceText } from "@/lib/llm/safety";

function comparable(value: string): string {
  return value.replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

export interface ClaimValidationResult {
  claims: Claim[];
  dropped: Array<{ claim: Claim; reason: string }>;
}

export function validateGroundedClaims(
  claims: Claim[],
  evidence: Evidence[],
  options: { allowOfficialCropRecommendations?: boolean } = {}
): ClaimValidationResult {
  const byId = new Map(evidence.map((item) => [item.id, item]));
  const valid: Claim[] = [];
  const dropped: Array<{ claim: Claim; reason: string }> = [];

  for (const claim of claims) {
    const linkedEvidence = claim.evidenceIds.map((id) => byId.get(id)).filter((item): item is Evidence => Boolean(item));
    if (linkedEvidence.length !== claim.evidenceIds.length || linkedEvidence.length === 0) {
      dropped.push({ claim, reason: "missing evidence id" });
      continue;
    }

    const quote = comparable(claim.quote);
    if (!quote || !linkedEvidence.some((item) => comparable(item.snippet).includes(quote))) {
      dropped.push({ claim, reason: "quote not found in the kept evidence snippet" });
      continue;
    }

    const safety = options.allowOfficialCropRecommendations && linkedEvidence.some((item) => item.trust === "official")
      ? lintEvidenceText(`${claim.text}\n${claim.quote}`)
      : lintClaim(claim);
    if (!safety.safe) {
      dropped.push({ claim, reason: safety.reasons.join(", ") });
      continue;
    }

    valid.push(claim);
  }

  return { claims: valid, dropped };
}

export function claimsFromEvidence(evidence: Evidence[]): Claim[] {
  return evidence.map((item) => ({
    text: item.snippet,
    evidenceIds: [item.id],
    quote: item.snippet
  }));
}
