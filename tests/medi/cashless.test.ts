import { describe, expect, it } from "vitest";
import { getStateHealthAgency, NATIONAL_PMJAY_HELPLINE } from "@/lib/medi/cashless-directory";
import { generateCashlessLetter, generateCashlessLetterBn, generateCashlessLetterEn, generateCashlessLetterHi } from "@/lib/medi/cashless-letter";
import { buildAyushmanCashlessDecision } from "@/lib/medi/cashless-decision";
import { planEvidence } from "@/lib/evidence/planner";
import { runEvidencePipeline } from "@/lib/evidence/pipeline";
import { RecordedProvider } from "@/lib/evidence/recorded";
import type { Evidence, EvidenceEvent } from "@/lib/schemas";

describe("Ayushman Cashless Shield — Directory & Mappings", () => {
  it("resolves State Health Agency for Uttar Pradesh (SACHIS)", () => {
    const sha = getStateHealthAgency("Uttar Pradesh");
    expect(sha.state).toBe("Uttar Pradesh");
    expect(sha.shaName).toContain("SACHIS");
    expect(sha.tollFree).toBe("1800-1800-4444");
    expect(sha.portalUrl).toContain("sachis.up.gov.in");
  });

  it("resolves State Health Agency for Bihar (BSSS)", () => {
    const sha = getStateHealthAgency("Bihar");
    expect(sha.state).toBe("Bihar");
    expect(sha.shaName).toContain("Bihar Swasthya Suraksha Samiti");
    expect(sha.tollFree).toBe("104");
  });

  it("falls back to National Health Authority (14555) for unmapped regions", () => {
    const sha = getStateHealthAgency("Goa");
    expect(sha.tollFree).toBe(NATIONAL_PMJAY_HELPLINE);
    expect(sha.cmoAuthority).toContain("Chief Medical Officer");
  });
});

describe("Ayushman Cashless Shield — Statutory Representation Notice", () => {
  const sampleData = {
    hospital: "Apex Multispeciality Hospital",
    city: "Varanasi",
    state: "Uttar Pradesh",
    procedure: "Emergency C-Section",
    depositDemanded: 20000,
    patientName: "Sunita Devi",
    pmjayId: "PMJAY-UP-88421-A",
    demandedReason: "Bed allotment deposit"
  };

  it("generates formal English statutory notice citing Clause 8.2 & Clause 23", () => {
    const letter = generateCashlessLetterEn(sampleData);
    expect(letter).toContain("FORMAL STATUTORY REPRESENTATION");
    expect(letter).toContain("Apex Multispeciality Hospital");
    expect(letter).toContain("Sunita Devi");
    expect(letter).toContain("PMJAY-UP-88421-A");
    expect(letter).toContain("₹20,000");
    expect(letter).toContain("Clause 8.2");
    expect(letter).toContain("Clause 23");
    expect(letter).toContain("14555");
  });

  it("generates formal Hindi notice with appropriate legal vocabulary", () => {
    const letter = generateCashlessLetterHi(sampleData);
    expect(letter).toContain("औपचारिक विधिक प्रतिवेदन");
    expect(letter).toContain("Sunita Devi");
    expect(letter).toContain("₹20,000");
    expect(letter).toContain("खंड 8.2");
    expect(letter).toContain("कैशलेस");
    expect(letter).toContain("आरोग्य मित्र");
  });

  it("generates formal Bengali notice", () => {
    const letter = generateCashlessLetterBn(sampleData);
    expect(letter).toContain("বিধিবদ্ধ আনুষ্ঠানিক আবেদন");
    expect(letter).toContain("Apex Multispeciality Hospital");
    expect(letter).toContain("ধারা ৮.২");
    expect(letter).toContain("₹20,000");
  });

  it("uses generateCashlessLetter helper for locale routing", () => {
    expect(generateCashlessLetter(sampleData, "hi")).toContain("विधिक प्रतिवेदन");
    expect(generateCashlessLetter(sampleData, "bn")).toContain("বিধিবদ্ধ আনুষ্ঠানিক আবেদন");
    expect(generateCashlessLetter(sampleData, "en")).toContain("FORMAL STATUTORY REPRESENTATION");
  });
});

describe("Ayushman Cashless Shield — Decision Synthesizer", () => {
  const dummyEvidence: Evidence[] = [
    {
      id: "ev-1",
      url: "https://sachis.up.gov.in/empanelled-hospitals-varanasi",
      title: "SACHIS Empanelled Hospitals Varanasi",
      snippet: "Apex Multispeciality Hospital, Varanasi is actively empanelled under PM-JAY with specialty codes for Gynaecology. Treatment is cashless.",
      publisher: "sachis.up.gov.in",
      engine: "google",
      trust: "official",
      retrievedAt: "2026-10-01T00:00:00Z",
      query: "test"
    },
    {
      id: "ev-2",
      url: "https://nha.gov.in/guidelines/cashless",
      title: "PM-JAY Cashless Clause 8.2",
      snippet: "Hospitals shall not charge any deposit from beneficiaries.",
      publisher: "nha.gov.in",
      engine: "google",
      trust: "official",
      retrievedAt: "2026-10-01T00:00:00Z",
      query: "test"
    }
  ];

  it("identifies confirmed empanelment and produces 4-tier escalation ladder", () => {
    const decision = buildAyushmanCashlessDecision({
      request: {
        hospital: "Apex Multispeciality Hospital",
        city: "Varanasi",
        state: "Uttar Pradesh",
        procedure: "Emergency C-Section",
        depositDemanded: 20000,
        patientName: "Sunita Devi",
        pmjayId: "PMJAY-UP-88421-A"
      },
      evidence: dummyEvidence,
      metrics: {
        queriesPlanned: 4,
        queriesRun: 4,
        liveSearches: 0,
        cacheHits: 0,
        sourcesKept: 2,
        sourcesDropped: 0,
        mode: "recorded"
      },
      warnings: [],
      locale: "en"
    });

    expect(decision.empanelmentStatus).toBe("empanelled_confirmed");
    expect(decision.empanelmentStatement).toContain("Clause 8.2");
    expect(decision.depositDemanded).toBe(20000);
    expect(decision.escalationLadder).toHaveLength(4);
    expect(decision.escalationLadder[0].tier).toBe(1);
    expect(decision.escalationLadder[3].tier).toBe(4);
    expect(decision.speechSummary).toContain("Clause 8.2");
    expect(decision.helplines.nationalTollFree).toBe("14555");
    expect(decision.helplines.stateShaTollFree).toBe("1800-1800-4444");
  });
});

describe("Ayushman Cashless Shield — Planner & Recorded Pipeline Replay", () => {
  it("plans 4 specialized queries for cashless_shield subModule", () => {
    const queries = planEvidence({
      module: "medi",
      subModule: "cashless_shield",
      locale: "en",
      hospital: "Apex Multispeciality Hospital",
      city: "Varanasi",
      state: "Uttar Pradesh",
      procedure: "Emergency C-Section"
    });

    expect(queries).toHaveLength(4);
    expect(queries[0].query).toContain("empanelled hospital list PMJAY");
    expect(queries[1].query).toContain("advance deposit");
    expect(queries[2].query).toContain("State Health Agency PMJAY");
    expect(queries[3].engine).toBe("google_maps");
  });

  it("replays recorded Varanasi fixture and synthesizes cashlessDecision without network calls", async () => {
    const request = {
      module: "medi" as const,
      subModule: "cashless_shield" as const,
      locale: "en" as const,
      hospital: "Apex Multispeciality Hospital",
      city: "Varanasi",
      state: "Uttar Pradesh",
      procedure: "Emergency C-Section",
      depositDemanded: 20000,
      patientName: "Sunita Devi",
      pmjayId: "PMJAY-UP-88421-A"
    };

    const recordedProvider = new RecordedProvider(request);
    const events: EvidenceEvent[] = [];

    const result = await runEvidencePipeline(
      request,
      (event) => {
        events.push(event);
      },
      {
        provider: recordedProvider,
        mode: "recorded"
      }
    );

    expect(result).not.toBeNull();
    expect(result?.cashlessDecision).toBeDefined();
    expect(result?.cashlessDecision?.empanelmentStatus).toBe("empanelled_confirmed");
    expect(result?.cashlessDecision?.depositDemanded).toBe(20000);
    expect(result?.cashlessDecision?.escalationLadder).toHaveLength(4);

    const doneEvent = events.find((e) => e.type === "done");
    expect(doneEvent).toBeDefined();
    if (doneEvent && doneEvent.type === "done") {
      expect(doneEvent.cashlessDecision).toBeDefined();
      expect(doneEvent.cashlessDecision?.hospital).toBe("Apex Multispeciality Hospital");
    }
  });
});
