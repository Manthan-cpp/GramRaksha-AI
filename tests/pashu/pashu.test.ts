import { describe, it, expect } from "vitest";
import { buildPashuDecision } from "@/lib/pashu/decision";
import { PashuDecisionSchema, type Evidence, type PashuEvidenceRequest } from "@/lib/schemas";

describe("PashuSahay Decision Engine & Locale Translation", () => {
  const request: PashuEvidenceRequest = {
    module: "pashu",
    locale: "en",
    animal: "Cow",
    concern: "Lumpy skin disease with fever and nodules",
    state: "Maharashtra",
    district: "Pune",
    mode: "live"
  };

  const mockEvidence: Evidence[] = [
    {
      id: "ev-maps-1",
      engine: "google_maps",
      title: "Government Veterinary Polyclinic Pune",
      snippet: "Veterinary clinic and animal dispensary in Pune",
      publisher: "Google Maps",
      url: "https://www.google.com/maps/search/?api=1&query=Govt+Vet+Clinic",
      trust: "other",
      retrievedAt: new Date().toISOString(),
      query: "Government Veterinary Hospital Pashu Chikitsalaya dispensary Pune",
      maps: {
        name: "Government Veterinary Polyclinic Pune",
        address: "Shivaji Nagar, Pune, Maharashtra",
        phone: "020-25531234",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Govt+Vet+Clinic"
      }
    },
    {
      id: "ev-google-1",
      engine: "google",
      title: "ICAR-IVRI Lumpy Skin Disease Treatment Advisory",
      snippet: "Official isolation guidelines and ethnoveterinary neem turmeric formulation",
      url: "https://ivri.nic.in/lsd-advisory",
      publisher: "ICAR-IVRI Bareilly",
      trust: "official",
      retrievedAt: new Date().toISOString(),
      query: "Cow Lumpy skin disease treatment advisory first aid"
    }
  ];

  it("builds a clinical decision in English by default", () => {
    const decisionEn = buildPashuDecision({
      request,
      evidence: mockEvidence,
      metrics: {
        queriesPlanned: 4,
        queriesRun: 4,
        liveSearches: 1,
        cacheHits: 0,
        sourcesKept: 2,
        sourcesDropped: 0,
        mode: "live"
      },
      warnings: [],
      locale: "en"
    });

    expect(PashuDecisionSchema.safeParse(decisionEn).success).toBe(true);
    expect(decisionEn.animal).toBe("Cow");
    expect(decisionEn.detectedCondition).toBe("lumpy");
    expect(decisionEn.headline).toContain("Lumpy Skin");
    expect(decisionEn.ambulanceHelpline.number).toBe("1962");
    expect(decisionEn.ambulanceHelpline.instructions).toContain("Dial toll-free 1962");
    expect(decisionEn.doNowSteps.length).toBeGreaterThan(0);
    expect(decisionEn.neverDoWarnings.length).toBeGreaterThan(0);
    expect(decisionEn.nearbyHospitals[0].name).toBe("Government Veterinary Polyclinic Pune");
  });

  it("dynamically translates decision into Hindi when locale is hi", () => {
    const decisionHi = buildPashuDecision({
      request,
      evidence: mockEvidence,
      metrics: {
        queriesPlanned: 4,
        queriesRun: 4,
        liveSearches: 1,
        cacheHits: 0,
        sourcesKept: 2,
        sourcesDropped: 0,
        mode: "live"
      },
      warnings: [],
      locale: "hi"
    });

    expect(PashuDecisionSchema.safeParse(decisionHi).success).toBe(true);
    expect(decisionHi.headline).toContain("लंपी");
    expect(decisionHi.ambulanceHelpline.name).toContain("1962");
    expect(decisionHi.ambulanceHelpline.instructions).toContain("टोल-फ्री 1962 डायल करें");
    expect(decisionHi.labels.stepsHeader).toContain("तुरंत क्या करें");
    expect(decisionHi.labels.neverDoHeader).toContain("क्या भूलकर भी न करें");
    expect(decisionHi.nearbyHospitals[0].name).toBe("Government Veterinary Polyclinic Pune");
  });

  it("dynamically translates decision into Bengali when locale is bn", () => {
    const decisionBn = buildPashuDecision({
      request,
      evidence: mockEvidence,
      metrics: {
        queriesPlanned: 4,
        queriesRun: 4,
        liveSearches: 1,
        cacheHits: 0,
        sourcesKept: 2,
        sourcesDropped: 0,
        mode: "live"
      },
      warnings: [],
      locale: "bn"
    });

    expect(PashuDecisionSchema.safeParse(decisionBn).success).toBe(true);
    expect(decisionBn.headline).toContain("লাম্পি");
    expect(decisionBn.ambulanceHelpline.instructions).toContain("1962 নম্বরে ডায়াল করুন");
    expect(decisionBn.labels.stepsHeader).toContain("এখনই কী করবেন");
    expect(decisionBn.labels.neverDoHeader).toContain("যা কখনোই করবেন না");
    expect(decisionBn.nearbyHospitals[0].name).toBe("Government Veterinary Polyclinic Pune");
  });

  it("seamlessly translates from English to Hindi without losing evidence or place links", () => {
    const decisionEn = buildPashuDecision({ request, evidence: mockEvidence, metrics: {} as any, warnings: [], locale: "en" });
    const decisionHi = buildPashuDecision({ request, evidence: mockEvidence, metrics: {} as any, warnings: [], locale: "hi" });

    expect(decisionHi.nearbyHospitals.length).toBe(decisionEn.nearbyHospitals.length);
    expect(decisionHi.nearbyHospitals[0].mapsUrl).toBe(decisionEn.nearbyHospitals[0].mapsUrl);
    expect(decisionHi.sourceReferences.length).toBe(decisionEn.sourceReferences.length);

    expect(decisionHi.headline).not.toBe(decisionEn.headline);
    expect(decisionHi.summary).not.toBe(decisionEn.summary);
    expect(decisionHi.speechSummary).not.toBe(decisionEn.speechSummary);
  });
});
