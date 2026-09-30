import { describe, expect, it } from "vitest";
import { EvidenceRunRequestSchema } from "../../src/lib/schemas";
import { FixtureProvider } from "../../src/lib/evidence/recorded";
import { runEvidencePipeline } from "../../src/lib/evidence/pipeline";
import { planEvidence } from "../../src/lib/evidence/planner";

describe("evidence pipeline", () => {
  it("streams kept and dropped sources and finishes with grounded claims", async () => {
    const input = EvidenceRunRequestSchema.parse({
      module: "krishi",
      locale: "en",
      crop: "Rice",
      state: "West Bengal",
      district: "Nadia",
      stage: "Flowering"
    });
    const plan = planEvidence(input, 1);
    const events: string[] = [];
    const provider = new FixtureProvider({
      [plan[0].id]: {
        organic_results: [
          {
            title: "Official advisory",
            link: "https://agri.example.gov.in/advisory",
            snippet: "Rice in Nadia at Flowering stage: monitor the crop after rainfall.",
            date: "2026-09-30"
          },
          {
            title: "Unapproved result",
            link: "https://example.com/advisory",
            snippet: "This result is not an official source."
          }
        ]
      }
    });

    const result = await runEvidencePipeline(input, (event) => {
      events.push(event.type);
    }, { provider, mode: "recorded", maxQueries: 1 });

    expect(result?.evidence).toHaveLength(1);
    expect(result?.claims).toHaveLength(1);
    expect(events).toEqual(["planning", "searching", "reading", "kept", "reading", "dropped", "synthesizing", "done"]);
  });
});
