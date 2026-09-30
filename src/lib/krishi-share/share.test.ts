import { describe, expect, it } from "vitest";
import { safePhone, safeWebUrl, sourcedSummary } from "./index";
import { CropBriefSchema } from "@/lib/schemas";
import { SavedCropCaseSchema } from "@/lib/storage/crop-cases";

const brief = CropBriefSchema.parse({ actions: [{ text: "Inspect leaves", quote: "Inspect leaves", evidenceIds: ["official-1"] }, { text: "Unsupported claim", quote: "", evidenceIds: ["missing"] }], alerts: [], market: [], schemes: [], support: [], disclaimers: ["Ask a local expert."], sources: [{ id: "official-1", title: "Advisory", snippet: "Inspect leaves", publisher: "Extension service", url: "https://example.gov.in/advisory", engine: "google", trust: "official", retrievedAt: "2026-09-30T00:00:00Z", query: "private concern must never be shared" }] });
describe("crop sharing boundaries", () => {
  it("shares citations and safety notes but not queries or unsupported claims", () => {
    const text = sourcedSummary(brief, "Rice brief", "Source");
    expect(text).toContain("https://example.gov.in/advisory");
    expect(text).toContain("Ask a local expert.");
    expect(text).not.toContain("Unsupported claim");
    expect(text).not.toContain("private concern");
  });
  it("rejects executable URLs, credentials and malformed phone links", () => {
    for (const value of ["javascript:alert(1)", "data:text/html,bad", "https://user:password@example.com", "/relative"]) expect(safeWebUrl(value)).toBeUndefined();
    expect(safeWebUrl("https://example.gov.in")).toBe("https://example.gov.in/");
    expect(safePhone("+91 (98765) 43210")).toBe("+919876543210");
    for (const value of ["123", "1234567890;ext=1", "javascript:1234567890"]) expect(safePhone(value)).toBeUndefined();
  });
});
describe("local crop case contract", () => {
  const record = { id: "4a6ac22b-9832-4540-85c1-7d746d990201", module: "krishi", version: 1, createdAt: "2026-09-30T00:00:00.000Z", locale: "hi", profile: { crop: "Rice", state: "West Bengal", district: "Nadia", stage: "Flowering" }, brief, mode: "recorded", warnings: [] };
  it("round trips crop briefs and rejects health/image/concern payloads", () => {
    expect(SavedCropCaseSchema.parse(record).brief.sources).toEqual(brief.sources);
    expect(SavedCropCaseSchema.safeParse({ ...record, module: "medi" }).success).toBe(false);
    expect(SavedCropCaseSchema.safeParse({ ...record, image: "data:image/png,..." }).success).toBe(false);
    expect(SavedCropCaseSchema.safeParse({ ...record, profile: { ...record.profile, concern: "private" } }).success).toBe(false);
    expect(SavedCropCaseSchema.safeParse({ ...record, brief: { bill: {} } }).success).toBe(false);
  });
});
