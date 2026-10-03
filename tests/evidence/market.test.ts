import { describe, expect, it } from "vitest";
import { extractMarketPrice } from "../../src/lib/krishi/market";
import { buildCropBrief } from "../../src/lib/krishi/brief";
import { CropEvidenceRequestSchema, type Evidence } from "../../src/lib/schemas";
import { planEvidence } from "../../src/lib/evidence/planner";

const input = CropEvidenceRequestSchema.parse({
  module: "krishi", locale: "en", crop: "Rice", state: "West Bengal", district: "Nadia", stage: "Flowering"
});
const now = new Date("2026-09-30T12:00:00Z");

function source(snippet: string, overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: "synthetic-market", url: "https://agmarknet.gov.in/synthetic", title: "Synthetic mandi result",
    snippet, publisher: "Synthetic official source", engine: "google", trust: "official",
    retrievedAt: now.toISOString(), query: "synthetic", ...overrides
  };
}

describe("conservative mandi snippet fallback (synthetic fixtures)", () => {
  it("extracts all fields only from an explicit recent official snippet", () => {
    expect(extractMarketPrice(source(
      "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: ₹2,350 per quintal."
    ), input, now)).toEqual({
      price: "₹2,350", marketName: "Kalyani Mandi", date: "2026-09-29", unit: "quintal",
      source: "https://agmarknet.gov.in/synthetic", evidenceId: "synthetic-market"
    });
  });

  it.each<{ snippet: string; url?: string }>([
    { snippet: "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: ₹2,350." },
    { snippet: "Commodity: Rice, District: Nadia, Date: 2026-09-29, Modal price: ₹2,350 per quintal." },
    { snippet: "Commodity: Wheat, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: ₹2,350 per quintal." },
    { snippet: "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: ₹2,350 per quintal, max ₹2,500 per quintal." },
    { snippet: "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2025-09-29, Modal price: ₹2,350 per quintal." },
    { snippet: "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, arrivals 2350 per quintal." },
    { snippet: "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: ₹2,350 per quintal.", url: "https://example.com/not-official" }
  ])("returns empty when a required field is missing, stale, ambiguous, or unsafe", ({ snippet, url }) => {
    expect(extractMarketPrice(source(snippet, url ? { url } : {}), input, now)).toBeNull();
  });

  it("does not treat title, query, publisher, or unrelated numbers as fields", () => {
    const item = source("Rice in Nadia was reported on 2026-09-29; see bulletin 2350.", {
      title: "Kalyani Mandi market price", query: "Rice Nadia Kalyani Mandi ₹999 per quintal", publisher: "Kalyani Mandi"
    });
    expect(extractMarketPrice(item, input, now)).toBeNull();
  });

  it("keeps literal ton and tonne units distinct, and brief points to the retained source", () => {
    const ton = source("Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: INR 3000 per ton.");
    const tonne = source("Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: INR 3000 per tonne.");
    expect(extractMarketPrice(ton, input, now)?.unit).toBe("ton");
    expect(extractMarketPrice(tonne, input, now)?.unit).toBe("tonne");
    expect(buildCropBrief(input, [ton], now).market).toEqual([extractMarketPrice(ton, input, now)]);
  });

  it("rejects missing currency, missing price label and mismatched commodity field", () => {
    for (const snippet of [
      "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: 3000 per kg.",
      "Commodity: Rice, District: Nadia, Market: Kalyani Mandi, Date: 2026-09-29, arrivals: ₹3000 per kg.",
      "Commodity: Wheat, Rice in Nadia, Market: Kalyani Mandi, Date: 2026-09-29, Modal price: ₹3000 per kg."
    ]) expect(extractMarketPrice(source(snippet), input, now)).toBeNull();
  });

  it("adds the optional mandi search only after the unchanged first four", () => {
    const plan = planEvidence(input, 5);
    expect(plan.slice(0, 4).map((query) => query.engine)).toEqual(["google", "google_news", "google", "google_maps"]);
    expect(plan[4]).toMatchObject({ engine: "google", requireOfficial: true, purpose: "Official mandi market prices" });
    expect(plan[4].query).toContain("agmarknet.gov.in");
  });
});
