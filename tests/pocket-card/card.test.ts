import { describe, it, expect } from "vitest";
import {
  getDistrictFallbackPlaces,
  NATIONAL_LIFELINES
} from "@/lib/pocket-card/directory-fallback";
import {
  generatePocketCardVCard,
  generateWhatsAppPocketSummary
} from "@/lib/pocket-card/vcard";
import { buildVillagePocketCard } from "@/lib/pocket-card/decision";
import {
  VillagePocketCardSchema,
  type VillagePocketCardRequest
} from "@/lib/pocket-card/types";
import { planEvidence } from "@/lib/evidence/planner";
import { RecordedProvider } from "@/lib/evidence/recorded";
import type { Evidence } from "@/lib/schemas";

describe("Pocket Card Directory & National Lifelines", () => {
  it("provides comprehensive verified national lifelines", () => {
    expect(NATIONAL_LIFELINES.length).toBeGreaterThanOrEqual(7);
    const services = NATIONAL_LIFELINES.map((l) => l.service);
    expect(services).toContain("National Emergency Response");
    expect(services).toContain("Emergency Medical & Ambulance");
    expect(services).toContain("PMFBY Crop Insurance Calamity");
    expect(services).toContain("Ayushman Bharat PM-JAY Call Centre");
    expect(services).toContain("Cyber Crime Financial Fraud");
    expect(services).toContain("Kisan Call Centre (KCC Advisory)");
    expect(services).toContain("NALSA Free Legal Aid Helpline");
  });

  it("returns curated directory places for Varanasi, UP", () => {
    const places = getDistrictFallbackPlaces("Varanasi", "Uttar Pradesh", "Pindra");
    expect(places.length).toBeGreaterThanOrEqual(5);

    const categories = places.map((p) => p.category);
    expect(categories).toContain("phc");
    expect(categories).toContain("police");
    expect(categories).toContain("kvk");
    expect(categories).toContain("dao");
    expect(categories).toContain("dlsa");

    const phc = places.find((p) => p.category === "phc");
    expect(phc?.name).toContain("Pindra");
    expect(phc?.phone).toBeDefined();
  });

  it("returns curated directory places for Bharatpur, Rajasthan", () => {
    const places = getDistrictFallbackPlaces("Bharatpur", "Rajasthan", "Weir");
    expect(places.length).toBeGreaterThanOrEqual(5);

    const kvk = places.find((p) => p.category === "kvk");
    expect(kvk?.name).toContain("Bharatpur");
    expect(kvk?.phone).toBeDefined();
  });

  it("synthesizes robust official district emergency fallback for unmapped districts", () => {
    const places = getDistrictFallbackPlaces("Satara", "Maharashtra", "Karad");
    expect(places.length).toBe(5);

    const phc = places.find((p) => p.category === "phc");
    expect(phc?.name).toContain("Karad");
    expect(phc?.phone).toContain("108");

    const dlsa = places.find((p) => p.category === "dlsa");
    expect(dlsa?.name).toContain("Satara");
    expect(dlsa?.phone).toBe("15100");
  });
});

describe("Pocket Card vCard 3.0 & WhatsApp Formatter", () => {
  const sampleRequest: VillagePocketCardRequest = {
    state: "Uttar Pradesh",
    district: "Varanasi",
    block: "Pindra",
    village: "Babura",
    pinCode: "221206",
    panchayatPradhanName: "Shyam Sundar Yadav",
    pradhanPhone: "9876543210"
  };

  it("generates a standard RFC 2426 compliant vCard 3.0 payload", () => {
    const card = buildVillagePocketCard(sampleRequest, [], "recorded", "en");
    const vcard = generatePocketCardVCard(card);

    expect(vcard).toContain("BEGIN:VCARD");
    expect(vcard).toContain("VERSION:3.0");
    expect(vcard).toContain("FN:🚨 Babura Emergency (Varanasi)");
    expect(vcard).toContain("ORG:GramRaksha AI - Babura Emergency Card");
    expect(vcard).toContain("TEL;TYPE=WORK,VOICE:112");
    expect(vcard).toContain("TEL;TYPE=CELL,VOICE:108");
    expect(vcard).toContain("TEL;TYPE=HOME,VOICE:14447");
    expect(vcard).toContain("TEL;TYPE=PREF,VOICE:9876543210");
    expect(vcard).toContain("NOTE:");
    expect(vcard).toContain("END:VCARD");
  });

  it("generates an emergency WhatsApp broadcast summary with key lifelines", () => {
    const card = buildVillagePocketCard(sampleRequest, [], "recorded", "en");
    const summary = generateWhatsAppPocketSummary(card);

    expect(summary).toContain("*🚨 GRAM RAKSHA EMERGENCY POCKET CARD*");
    expect(summary).toContain("Babura");
    expect(summary).toContain("Varanasi");
    expect(summary).toContain("112");
    expect(summary).toContain("108");
    expect(summary).toContain("14447");
    expect(summary).toContain("14555");
    expect(summary).toContain("1930");
    expect(summary).toContain("Shyam Sundar Yadav");
    expect(summary).toContain("9876543210");
  });
});

describe("Pocket Card Decision Synthesizer & Schema Compliance", () => {
  it("merges Google Maps evidence with directory fallback and passes VillagePocketCardSchema", () => {
    const mockMapsEvidence: Evidence[] = [
      {
        id: "ev-map-1",
        engine: "google_maps",
        title: "CHC Pindra Community Health Centre",
        snippet: "Tehsil Road, Pindra, Varanasi, Uttar Pradesh 221206",
        url: "https://maps.google.com/?cid=123",
        publisher: "Google Maps",
        trust: "official",
        retrievedAt: new Date().toISOString(),
        query: "Primary Health Centre Pindra",
        maps: {
          name: "CHC Pindra Community Health Centre",
          address: "Tehsil Road, Pindra, Varanasi, Uttar Pradesh 221206",
          phone: "0542-2622220",
          mapsUrl: "https://maps.google.com/?cid=123"
        }
      },
      {
        id: "ev-map-2",
        engine: "google_maps",
        title: "Phulpur Thana Police Station",
        snippet: "Main Road, Phulpur, Varanasi, Uttar Pradesh 221206",
        url: "https://maps.google.com/?cid=456",
        publisher: "Google Maps",
        trust: "official",
        retrievedAt: new Date().toISOString(),
        query: "Police Station Pindra",
        maps: {
          name: "Phulpur Thana Police Station",
          address: "Main Road, Phulpur, Varanasi, Uttar Pradesh 221206",
          phone: "0542-2622212",
          mapsUrl: "https://maps.google.com/?cid=456"
        }
      }
    ];

    const card = buildVillagePocketCard(
      {
        state: "Uttar Pradesh",
        district: "Varanasi",
        block: "Pindra",
        village: "Babura",
        panchayatPradhanName: "Shyam Sundar Yadav",
        pradhanPhone: "9876543210"
      },
      mockMapsEvidence,
      "live",
      "hi"
    );

    const validated = VillagePocketCardSchema.parse(card);
    expect(validated.location.village).toBe("Babura");
    expect(validated.location.district).toBe("Varanasi");
    expect(validated.panchayatContact?.name).toBe("Shyam Sundar Yadav");

    const phc = validated.places.find((p) => p.category === "phc");
    expect(phc?.name).toBe("CHC Pindra Community Health Centre");
    expect(phc?.badge).toContain("Verified on Google Maps");

    const dlsa = validated.places.find((p) => p.category === "dlsa");
    expect(dlsa).toBeDefined();
    expect(dlsa?.phone).toBeDefined();
  });
});

describe("Pocket Card Evidence Planner & Recorded Provider", () => {
  it("plans 4 targeted emergency queries for village & district", () => {
    const planned = planEvidence({
      module: "pocket_card",
      locale: "en",
      state: "Uttar Pradesh",
      district: "Varanasi",
      block: "Pindra",
      village: "Babura"
    });

    expect(planned.length).toBe(4);
    expect(planned[0].engine).toBe("google_maps");
    expect(planned[0].query).toContain("Primary Health Centre PHC");
    expect(planned[1].engine).toBe("google_maps");
    expect(planned[1].query).toContain("Police Station Thana");
    expect(planned[2].engine).toBe("google");
    expect(planned[2].query).toContain("Krishi Vigyan Kendra");
    expect(planned[3].engine).toBe("google");
    expect(planned[3].query).toContain("District Legal Services Authority");
  });

  it("resolves recorded fixture for Varanasi Pindra", async () => {
    const provider = new RecordedProvider({
      module: "pocket_card",
      state: "Uttar Pradesh",
      district: "Varanasi",
      block: "Pindra",
      village: "Babura",
      locale: "en"
    });

    const result = await provider.search({
      id: "card-test-1",
      engine: "google_maps",
      query: "Primary Health Centre PHC Community Health Centre CHC hospital Pindra Varanasi",
      parameters: { gl: "in", hl: "en" },
      purpose: "Nearest Primary Health Centre and emergency care",
      requireOfficial: false
    });

    expect(result.raw).toBeDefined();
    const raw = result.raw as { local_results: Array<{ title: string; phone: string }> };
    expect(raw.local_results[0].title).toContain("CHC) Pindra");
    expect(raw.local_results[0].phone).toBe("0542-2622220");
  });
});
