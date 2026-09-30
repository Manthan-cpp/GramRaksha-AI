import { describe, expect, it } from "vitest";
import { buildMediDecision } from "@/lib/medi/decision";
import { RecordedProvider } from "@/lib/evidence/recorded";
import { planEvidence } from "@/lib/evidence/planner";
import { EvidenceRunRequestSchema, type Bill } from "@/lib/schemas";

describe("MediShield Decision Engine", () => {
  const sampleBill: Bill = {
    hospital: "City Care Hospital",
    city: "Pune",
    procedure: "Laparoscopic Appendectomy",
    date: "2026-09-30",
    total: 88500,
    confidence: {},
    confirmed: true,
    items: [
      { label: "Room Rent (Semi-Private, 3 days)", category: "bed", qty: 3, unit: "days", amount: 15000 },
      { label: "Surgeon Consultation & Procedure Fee", category: "consultation", qty: 1, unit: "case", amount: 28000 },
      { label: "OT & Equipment Charges", category: "ot", qty: 1, unit: "case", amount: 14000 },
      { label: "Pharmacy & Injections (Lump Sum)", category: "pharmacy", qty: 1, unit: "lump sum", amount: 16500 },
      { label: "Surgical Consumables & PPE", category: "consumables", qty: 1, unit: "kit", amount: 7500 },
      { label: "Miscellaneous Administration Charges", category: "misc", qty: 1, unit: "fee", amount: 7500 }
    ]
  };

  const dummyMetrics = {
    queriesPlanned: 4,
    queriesRun: 4,
    liveSearches: 0,
    cacheHits: 0,
    sourcesKept: 5,
    sourcesDropped: 0,
    mode: "recorded" as const
  };

  it("identifies vague miscellaneous charges, high consumables, and unitemised pharmacy", () => {
    const decision = buildMediDecision(sampleBill, [], dummyMetrics, [], "en");

    expect(decision.headline).toContain("City Care Hospital");
    expect(decision.flags.length).toBeGreaterThanOrEqual(3);

    const vagueFlag = decision.flags.find((f) => f.type === "vague");
    expect(vagueFlag).toBeDefined();
    expect(vagueFlag?.message).toContain("Miscellaneous Administration Charges");

    const pharmacyFlag = decision.flags.find((f) => f.type === "missingQty");
    expect(pharmacyFlag).toBeDefined();

    const consumableFlag = decision.flags.find((f) => f.type === "dataQuality");
    expect(consumableFlag).toBeDefined();

    expect(decision.benchmarkRange).toContain("18,000");
    expect(decision.actions).toHaveLength(4);
    expect(decision.actions[0].urgent).toBe(true);
  });

  it("detects arithmetic mismatch when total does not equal item sum", () => {
    const mismatchBill: Bill = {
      ...sampleBill,
      total: 95000 // sum of items is 88,500 -> 6,500 mismatch
    };

    const decision = buildMediDecision(mismatchBill, [], dummyMetrics, [], "en");
    const mathFlag = decision.flags.find((f) => f.type === "totalMismatch");
    expect(mathFlag).toBeDefined();
    expect(mathFlag?.message).toContain("6,500");
  });

  it("generates speech text with Serp API (with space) and no minus ranges", () => {
    const decision = buildMediDecision(sampleBill, [], dummyMetrics, [], "en");
    expect(decision.speechSummary).toContain("Serp API");
    expect(decision.speechSummary).not.toMatch(/\d+\s*-\s*\d+/);
  });

  it("localizes decision and action steps into Hindi and Bengali", () => {
    const hiDecision = buildMediDecision(sampleBill, [], dummyMetrics, [], "hi");
    expect(hiDecision.headline).toContain("City Care Hospital के बिल का विश्लेषण");
    expect(hiDecision.actions[0].badge).toBe("कदम 1");
    expect(hiDecision.labels.speechButton).toBe("बिल की सलाह सुनें");

    const bnDecision = buildMediDecision(sampleBill, [], dummyMetrics, [], "bn");
    expect(bnDecision.headline).toContain("City Care Hospital-এর বিল বিশ্লেষণ");
    expect(bnDecision.actions[0].badge).toBe("পদক্ষেপ ১");
  });
});

describe("MediShield Recorded Provider Integration", () => {
  it("replays recorded capture for City Care Hospital Pune scenario offline", async () => {
    const request = EvidenceRunRequestSchema.parse({
      module: "medi",
      locale: "en",
      hospital: "City Care Hospital",
      city: "Pune",
      procedure: "Laparoscopic Appendectomy"
    });

    const plan = planEvidence(request, 4);
    expect(plan).toHaveLength(4);

    const provider = new RecordedProvider(request);
    const q1Result = await provider.search(plan[0]);
    expect(q1Result.source).toBe("recorded");
    expect(q1Result.raw).toBeDefined();

    const q4Result = await provider.search(plan[3]);
    expect(q4Result.source).toBe("recorded");
    expect(q4Result.raw).toBeDefined();
  });
});
