import { describe, it, expect } from "vitest";
import { calculateFasalCountdown } from "@/lib/fasal/calculator";
import {
  lookupEmpanelledInsurer,
  KNOWN_INSURERS
} from "@/lib/fasal/insurer-directory";
import { generateFasalIntimationLetter } from "@/lib/fasal/letter";
import { buildFasalDecision } from "@/lib/fasal/decision";
import { FasalDecisionSchema } from "@/lib/schemas";
import { RecordedProvider } from "@/lib/evidence/recorded";

describe("Fasal 72-Hour Kit Countdown Calculator", () => {
  it("calculates safe urgency for recent incident (< 24h ago, > 48h left)", () => {
    const now = Date.now();
    const incidentTime = new Date(now - 10 * 3600 * 1000).toISOString(); // 10h ago
    const status = calculateFasalCountdown(incidentTime, now, "en");

    expect(status.isExpired).toBe(false);
    expect(status.urgency).toBe("safe");
    expect(status.hoursLeft).toBe(62);
    expect(status.percentElapsed).toBeGreaterThanOrEqual(13);
  });

  it("calculates warning urgency when between 24h and 48h remain", () => {
    const now = Date.now();
    const incidentTime = new Date(now - 36 * 3600 * 1000).toISOString(); // 36h ago
    const status = calculateFasalCountdown(incidentTime, now, "hi");

    expect(status.isExpired).toBe(false);
    expect(status.urgency).toBe("warning");
    expect(status.hoursLeft).toBe(36);
    expect(status.formattedTimeLeft).toContain("घंटे");
  });

  it("calculates critical urgency when less than 24h remain", () => {
    const now = Date.now();
    const incidentTime = new Date(now - 60 * 3600 * 1000).toISOString(); // 60h ago
    const status = calculateFasalCountdown(incidentTime, now, "bn");

    expect(status.isExpired).toBe(false);
    expect(status.urgency).toBe("critical");
    expect(status.hoursLeft).toBe(12);
    expect(status.formattedTimeLeft).toContain("ঘণ্টা");
  });

  it("flags expired status when beyond 72 hours", () => {
    const now = Date.now();
    const incidentTime = new Date(now - 80 * 3600 * 1000).toISOString(); // 80h ago
    const status = calculateFasalCountdown(incidentTime, now, "en");

    expect(status.isExpired).toBe(true);
    expect(status.urgency).toBe("expired");
    expect(status.hoursLeft).toBe(0);
    expect(status.percentElapsed).toBe(100);
    expect(status.formattedTimeLeft).toContain("expired");
  });
});

describe("PMFBY Empanelled Insurer Directory", () => {
  it("resolves primary insurer for major agricultural states", () => {
    const mh = lookupEmpanelledInsurer("Maharashtra", "Pune");
    expect(mh.name).toContain("Agriculture Insurance Company");
    expect(mh.tollFree).toBeDefined();

    const rj = lookupEmpanelledInsurer("Rajasthan");
    expect(rj.name).toContain("HDFC ERGO");

    const up = lookupEmpanelledInsurer("Uttar Pradesh");
    expect(up.name).toContain("SBI General");
  });

  it("falls back safely with national helpline 14447 for unmapped states", () => {
    const fallback = lookupEmpanelledInsurer("Goa");
    expect(fallback.tollFree).toBeDefined();
    expect(fallback.isEmpanelled).toBe(true);
  });
});

describe("PMFBY Formal Claim Intimation Letter Generator", () => {
  const sampleIncident = {
    calamityType: "hailstorm" as const,
    incidentTime: "2026-09-30T10:00:00.000Z",
    state: "Maharashtra",
    district: "Pune",
    village: "Baramati",
    khasraNo: "142/3A",
    applicationNo: "PMFBY-2026-MH-99482",
    crop: "Onion",
    areaAcres: 3.5,
    lossPercentage: 75,
    farmerName: "Ramesh Tukaram Patil",
    farmerPhone: "9876543210"
  };

  it("generates a comprehensive legal-grade English notice citing Clause 15.3", () => {
    const letter = generateFasalIntimationLetter({
      incident: sampleIncident,
      insurer: KNOWN_INSURERS.aic,
      daoOfficeName: "Office of District Superintendent Agriculture Officer, Pune",
      locale: "en"
    });

    expect(letter).toContain("STATUTORY 72-HOUR NOTICE");
    expect(letter).toContain("Clause 15.3");
    expect(letter).toContain("Ramesh Tukaram Patil");
    expect(letter).toContain("142/3A");
    expect(letter).toContain("Onion");
    expect(letter).toContain("75%");
    expect(letter).toContain("Joint Loss Assessment Committee");
  });

  it("generates a high-quality Hindi statutory letter", () => {
    const letter = generateFasalIntimationLetter({
      incident: { ...sampleIncident, farmerName: "रमेश तुकाराम पाटिल" },
      insurer: KNOWN_INSURERS.aic,
      locale: "hi"
    });

    expect(letter).toContain("72-घंटे की अग्रिम सूचना");
    expect(letter).toContain("धारा 15.3");
    expect(letter).toContain("ओलावृष्टि");
    expect(letter).toContain("रमेश तुकाराम पाटिल");
    expect(letter).toContain("संयुक्त सर्वेक्षण");
  });

  it("generates a high-quality Bengali statutory letter", () => {
    const letter = generateFasalIntimationLetter({
      incident: { ...sampleIncident, state: "West Bengal", district: "Nadia", village: "Kalyani" },
      insurer: KNOWN_INSURERS.aic,
      locale: "bn"
    });

    expect(letter).toContain("৭২ ঘণ্টার পূর্ব নোটিশ");
    expect(letter).toContain("১৫.৩");
    expect(letter).toContain("শিলাবৃষ্টি");
    expect(letter).toContain("যৌথ পরিদর্শন");
  });
});

describe("Fasal Decision Synthesizer & Schema Compliance", () => {
  it("synthesizes valid FasalDecision complying with FasalDecisionSchema", () => {
    const decision = buildFasalDecision({
      incident: {
        calamityType: "hailstorm",
        incidentTime: new Date().toISOString(),
        state: "Maharashtra",
        district: "Pune",
        village: "Baramati",
        crop: "Onion",
        lossPercentage: 80,
        farmerName: "Ramesh Patil"
      },
      evidence: [],
      metrics: {
        queriesPlanned: 4,
        queriesRun: 4,
        liveSearches: 0,
        cacheHits: 0,
        sourcesKept: 0,
        sourcesDropped: 0,
        mode: "recorded"
      },
      warnings: [],
      locale: "en"
    });

    const parsed = FasalDecisionSchema.parse(decision);
    expect(parsed.countdown.urgency).toBe("safe");
    expect(parsed.insurer.name).toBeDefined();
    expect(parsed.actions.some((a) => a.actionValue?.includes("14447"))).toBe(true);
    expect(parsed.speechSummary).toContain("Onion");
  });
});

describe("Recorded Fasal SerpApi Integration", () => {
  it("resolves recorded PMFBY queries for Maharashtra Pune Hailstorm", async () => {
    const provider = new RecordedProvider({
      module: "fasal",
      state: "Maharashtra",
      district: "Pune",
      calamityType: "hailstorm",
      locale: "en"
    });

    const result = await provider.search({
      id: "fasal-1",
      engine: "google",
      query: 'PMFBY empanelled insurance company "Pune" "Maharashtra" (site:pmfby.gov.in OR site:gov.in OR site:nic.in)',
      parameters: { gl: "in", hl: "en" },
      purpose: "Official empanelled PMFBY crop insurer for district",
      requireOfficial: true
    });

    expect(result.raw).toBeDefined();
    const raw = result.raw as { organic_results: Array<{ title: string; snippet: string }> };
    expect(raw.organic_results[0].snippet).toContain("Agriculture Insurance Company");
  });
});
