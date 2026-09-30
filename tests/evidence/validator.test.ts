import { describe, expect, it } from "vitest";
import { validateGroundedClaims } from "../../src/lib/evidence/validator";
import type { Claim, Evidence } from "../../src/lib/schemas";

const evidence: Evidence = {
  id: "e-1",
  url: "https://example.gov.in/advisory",
  title: "Advisory",
  snippet: "Monitor the crop after rainfall and consult the local office.",
  publisher: "Example Department",
  engine: "google",
  trust: "official",
  retrievedAt: "2026-09-30T00:00:00.000Z",
  query: "advisory"
};

describe("grounding validator", () => {
  it("keeps a claim whose quote occurs in the source snippet", () => {
    const claim: Claim = {
      text: "Monitor the crop after rainfall.",
      evidenceIds: [evidence.id],
      quote: "Monitor the crop after rainfall"
    };
    expect(validateGroundedClaims([claim], [evidence]).claims).toHaveLength(1);
  });

  it("drops claims with missing evidence ids or invented quotes", () => {
    const claims: Claim[] = [
      { text: "Invented", evidenceIds: ["missing"], quote: "Invented" },
      { text: "Also invented", evidenceIds: [evidence.id], quote: "This is not in the snippet" }
    ];
    const result = validateGroundedClaims(claims, [evidence]);
    expect(result.claims).toHaveLength(0);
    expect(result.dropped).toHaveLength(2);
  });

  it("drops verdict language even when it is quoted", () => {
    const claim: Claim = {
      text: "The hospital committed fraud.",
      evidenceIds: [evidence.id],
      quote: evidence.snippet
    };
    expect(validateGroundedClaims([claim], [evidence]).claims).toHaveLength(0);
  });
});
