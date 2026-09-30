import { describe, expect, it } from "vitest";
import { classifyEvidence, isOfficialUrl } from "../../src/lib/evidence/trust";
import type { EvidenceCandidate } from "../../src/lib/evidence/normalize";
import type { PlannedQuery } from "../../src/lib/schemas";

const query: PlannedQuery = {
  id: "q-1",
  engine: "google",
  query: "advisory",
  parameters: {},
  purpose: "Official advisory",
  requireOfficial: true
};

const candidate: EvidenceCandidate = {
  id: "e-1",
  url: "https://agri.example.gov.in/advisory",
  title: "Official advisory",
  snippet: "Use the official advisory wording.",
  publisher: "Agriculture Department",
  engine: "google",
  trust: "other",
  retrievedAt: new Date().toISOString(),
  query: "advisory",
  recencyScore: 2
};

describe("evidence classifier", () => {
  it("recognizes official Indian domains", () => {
    expect(isOfficialUrl("https://icar.gov.in/advisory")).toBe(true);
    expect(isOfficialUrl("https://example.gov.in/page")).toBe(true);
    expect(isOfficialUrl("https://example.com/page")).toBe(false);
  });

  it("keeps official results for official-only searches", () => {
    const result = classifyEvidence(candidate, query);
    expect(result.action).toBe("keep");
    if (result.action === "keep") expect(result.evidence.trust).toBe("official");
  });

  it("drops non-official results for official-only searches", () => {
    const result = classifyEvidence({ ...candidate, url: "https://example.com/page" }, query);
    expect(result.action).toBe("drop");
  });

  it("drops unrelated official-domain pages instead of treating domain trust as relevance", () => {
    const cropQuery: PlannedQuery = {
      id: "krishi-1",
      engine: "google",
      query: '"Rice" "Nadia" "Flowering" advisory (site:gov.in OR site:nic.in)',
      parameters: {},
      purpose: "Official crop advisory",
      requireOfficial: true
    };
    const result = classifyEvidence({
      ...candidate,
      title: "Chief Electoral Officer, Manipur - Official Website",
      snippet: "Official website providing voter services and election information.",
      url: "https://ceomanipur.nic.in/"
    }, cropQuery);
    expect(result.action).toBe("drop");
    if (result.action === "drop") expect(result.reason).toContain("selected crop and location context");
  });

  it("does not confuse crop names with words that merely contain them", () => {
    const cropQuery: PlannedQuery = {
      id: "krishi-1",
      engine: "google",
      query: '"Rice" "Nadia" "West Bengal" mandi market price (site:gov.in)',
      parameters: {},
      purpose: "Official mandi market prices",
      requireOfficial: true
    };
    const result = classifyEvidence({
      ...candidate,
      title: "Nadia market prices",
      snippet: "West Bengal market prices and arrivals.",
      url: "https://agri.example.gov.in/market"
    }, cropQuery);
    expect(result.action).toBe("drop");
  });

  it("keeps MediShield Google Maps results for consumer commissions and legal aid", () => {
    const mediMapsQuery: PlannedQuery = {
      id: "medi-4",
      engine: "google_maps",
      query: "consumer commission district legal services authority",
      parameters: { location: "Hyderabad, India" },
      purpose: "Nearby official support locations",
      requireOfficial: false
    };

    const result = classifyEvidence({
      ...candidate,
      engine: "google_maps",
      title: "Telangana State Consumer Commission",
      snippet: "State Consumer Disputes Redressal Commission in Hyderabad.",
      url: "https://www.google.com/maps/search/?api=1&query=Telangana+State+Consumer+Commission",
      maps: {
        name: "Telangana State Consumer Commission",
        address: "Somajiguda, Hyderabad, Telangana",
        mapsUrl: "https://www.google.com/maps/search/?api=1&query=Telangana+State+Consumer+Commission"
      }
    }, mediMapsQuery);

    expect(result.action).toBe("keep");
    if (result.action === "keep") {
      expect(result.evidence.title).toBe("Telangana State Consumer Commission");
    }
  });
});
