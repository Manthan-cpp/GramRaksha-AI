import { describe, expect, it } from "vitest";
import { EvidenceRunRequestSchema } from "../../src/lib/schemas";
import { planEvidence } from "../../src/lib/evidence/planner";

describe("evidence planner", () => {
  it("creates bounded crop searches for Search, News, and Maps", () => {
    const input = EvidenceRunRequestSchema.parse({
      module: "krishi",
      locale: "en",
      crop: "Rice",
      state: "West Bengal",
      district: "Nadia",
      stage: "Flowering",
      concern: "brown spots"
    });
    const plan = planEvidence(input, 3);

    expect(plan).toHaveLength(3);
    expect(plan.map((query) => query.engine)).toEqual(["google", "google_news", "google"]);
    expect(plan[0].query).toContain("Nadia");
    expect(plan[0].requireOfficial).toBe(true);
    expect(planEvidence(input, 20).map((query) => query.engine)).toEqual([
      "google", "google_news", "google", "google_maps", "google", "google_trends", "youtube"
    ]);
    expect(planEvidence(input, 20)[5].parameters).toMatchObject({ geo: "IN-WB", data_type: "TIMESERIES" });
  });

  it("does not put bill amounts or line-item fields into bill queries", () => {
    const input = EvidenceRunRequestSchema.parse({
      module: "medi",
      locale: "en",
      hospital: "Example Hospital",
      city: "Kolkata",
      procedure: "Appendectomy"
    });
    const plan = planEvidence(input, 6);
    const combined = plan.map((query) => query.query).join(" ");

    expect(combined).toContain("Example Hospital");
    expect(combined).toContain("Appendectomy");
    expect(combined).not.toContain("amount");
    expect(combined).not.toContain("line item");
    expect(plan.map((query) => query.id)).toEqual(["medi-1", "medi-2", "medi-3", "medi-4"]);
  });

  it("plans scheme, news alert, google_play check, and chakshu reporting for suraksha queries", () => {
    const input = EvidenceRunRequestSchema.parse({
      module: "suraksha",
      locale: "en",
      content: "PM Kisan Yojana ₹2000 bonus received. Download PMKisan.apk immediately and pay ₹250 registration fee."
    });
    const plan = planEvidence(input, 5);
    expect(plan).toHaveLength(4);
    expect(plan.map((q) => q.engine)).toEqual(["google", "google_news", "google_play", "google"]);
    expect(plan.map((q) => q.id)).toEqual(["suraksha-1", "suraksha-2", "suraksha-3", "suraksha-4"]);
    expect(plan[0].query).toContain("PM-Kisan");
    expect(plan[0].requireOfficial).toBe(true);
    expect(plan[1].query).toContain("scam");
    expect(plan[2].engine).toBe("google_play");
    expect(plan[3].query).toContain("Chakshu");
    expect(plan[3].requireOfficial).toBe(true);
  });
});
