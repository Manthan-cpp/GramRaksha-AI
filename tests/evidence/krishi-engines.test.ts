import { describe, expect, it } from "vitest";
import { buildCropBrief } from "../../src/lib/krishi/brief";
import { classifyEvidence } from "../../src/lib/evidence/trust";
import { normalizeSerpApiResponse } from "../../src/lib/evidence/normalize";
import { planEvidence } from "../../src/lib/evidence/planner";
import { CropEvidenceRequestSchema } from "../../src/lib/schemas";

const input = CropEvidenceRequestSchema.parse({
  module: "krishi",
  locale: "en",
  crop: "Rice",
  state: "West Bengal",
  district: "Nadia",
  stage: "Flowering",
  concern: "brown spots"
});

describe("Phase 3 SerpApi engines", () => {
  it("normalizes a Trends timeseries as a labelled proxy", () => {
    const query = planEvidence(input, 7)[5];
    const [candidate] = normalizeSerpApiResponse({
      search_metadata: { google_trends_url: "https://trends.google.com/trends/explore?geo=IN-WB&q=Rice" },
      interest_over_time: {
        timeline_data: [
          { values: [{ extracted_value: 10 }] },
          { values: [{ extracted_value: 20 }] },
          { values: [{ extracted_value: 40 }] },
          { values: [{ extracted_value: 80 }] }
        ]
      }
    }, query, "2026-09-30T12:00:00.000Z");
    expect(candidate.trend).toMatchObject({ signal: "rising", value: 80, region: "IN-WB" });
    expect(candidate.snippet).toContain("not a confirmed crop alert");
  });

  it("keeps only allowlisted official agriculture YouTube channels", () => {
    const query = planEvidence(input, 7)[6];
    const [candidate] = normalizeSerpApiResponse({
      video_results: [{
        title: "Rice Nadia flowering stage advisory",
        link: "https://www.youtube.com/watch?v=official",
        description: "Inspect Rice in Nadia with your local agriculture officer.",
        channel: { name: "ICAR Official", link: "https://www.youtube.com/@icarofficial" },
        length: "4:10"
      }]
    }, query, "2026-09-30T12:00:00.000Z");
    const classification = classifyEvidence(candidate, query);
    expect(classification.action).toBe("keep");
    expect(classification.action === "keep" && classification.evidence.trust).toBe("official");
    const brief = buildCropBrief(input, [classification.action === "keep" ? classification.evidence : candidate]);
    expect(brief.videos[0]).toMatchObject({ channelName: "ICAR Official" });
  });

  it("hides thin Trends data instead of manufacturing a signal", () => {
    const query = planEvidence(input, 7)[5];
    expect(normalizeSerpApiResponse({ interest_over_time: { timeline_data: [{ values: [{ extracted_value: 0 }] }] } }, query, "2026-09-30T12:00:00.000Z")).toEqual([]);
  });
});
