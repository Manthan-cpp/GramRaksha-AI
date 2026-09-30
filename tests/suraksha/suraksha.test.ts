import { describe, expect, it } from "vitest";
import { analyzeSuspiciousText } from "@/lib/suraksha/patterns";
import { buildSurakshaDecision } from "@/lib/suraksha/decision";
import { runEvidencePipeline } from "@/lib/evidence/pipeline";
import { EvidenceRunRequestSchema, SurakshaEvidenceRequestSchema } from "@/lib/schemas";

describe("Suraksha Check — Pattern Analyzer", () => {
  it("flags rogue .apk file downloads and upfront registration fee", () => {
    const text = "PM Kisan 17th Installment ₹2000 bonus. Click here to download PMKisan.apk and pay ₹250 registration fee.";
    const result = analyzeSuspiciousText(text);

    expect(result.isScamDetected).toBe(true);
    expect(result.riskScore).toBeGreaterThanOrEqual(75);
    expect(result.extractedScheme).toBe("PM-Kisan Samman Nidhi");
    expect(result.extractedApk).toBeDefined();

    const ids = result.patterns.map((p) => p.id);
    expect(ids).toContain("apk_file");
    expect(ids).toContain("upfront_fee");
  });

  it("detects fake lookalike government domains with non-gov TLDs", () => {
    const text = "Claim your subsidy now at http://pmkisan-bonus.online before midnight.";
    const result = analyzeSuspiciousText(text);

    expect(result.isScamDetected).toBe(true);
    const ids = result.patterns.map((p) => p.id);
    expect(ids).toContain("fake_gov_domain");
    expect(ids).toContain("false_urgency");
  });

  it("identifies OTP and credential harvesting attempts", () => {
    const text = "Your electricity power will be disconnected tonight at 9:30 PM. Share OTP immediately to verify bill.";
    const result = analyzeSuspiciousText(text);

    expect(result.isScamDetected).toBe(true);
    const ids = result.patterns.map((p) => p.id);
    expect(ids).toContain("credential_theft");
    expect(ids).toContain("false_urgency");
  });

  it("recognizes authentic .gov.in domains as safe", () => {
    const text = "Please check your beneficiary status on the official portal https://pmkisan.gov.in";
    const result = analyzeSuspiciousText(text);

    expect(result.isOfficialVerified).toBe(true);
    expect(result.isScamDetected).toBe(false);
    expect(result.riskScore).toBeLessThanOrEqual(10);
  });
});

describe("Suraksha Check — Decision Engine & Pipeline", () => {
  it("synthesizes SurakshaDecision with Chakshu and 1930 redressal routes", () => {
    const input = SurakshaEvidenceRequestSchema.parse({
      module: "suraksha",
      locale: "en",
      content: "PM Kisan Yojana ₹2000 bonus received. Download PMKisan.apk immediately and pay ₹250 registration fee."
    });

    const decision = buildSurakshaDecision(
      input,
      [],
      {
        queriesPlanned: 4,
        queriesRun: 4,
        liveSearches: 0,
        cacheHits: 4,
        sourcesKept: 4,
        sourcesDropped: 0,
        mode: "recorded"
      },
      [],
      "en"
    );

    expect(decision.verdict).toBe("danger");
    expect(decision.riskScore).toBeGreaterThanOrEqual(75);
    expect(decision.officialFactCheck.isAlwaysFree).toBe(true);
    expect(decision.redressalRoutes.length).toBeGreaterThanOrEqual(2);

    const chakshu = decision.redressalRoutes.find((r) => r.type === "chakshu");
    expect(chakshu).toBeDefined();
    expect(chakshu?.url).toContain("sancharsaathi.gov.in");

    const cybercrime = decision.redressalRoutes.find((r) => r.type === "cybercrime");
    expect(cybercrime).toBeDefined();
    expect(cybercrime?.phone).toBe("1930");

    expect(decision.warningMessage).toContain("GRAM RAKSHA CYBER ALERT");
  });

  it("runs end-to-end evidence pipeline in recorded mode for suraksha", async () => {
    const input = EvidenceRunRequestSchema.parse({
      module: "suraksha",
      locale: "en",
      mode: "recorded",
      sourceType: "whatsapp",
      content: "PM-Kisan 17th Installment ₹2000 bonus received. Download PMKisan.apk immediately and pay ₹250 registration fee."
    });

    const events: unknown[] = [];
    const result = await runEvidencePipeline(input, (e) => {
      events.push(e);
    });

    expect(result).not.toBeNull();
    expect(result?.mode).toBe("recorded");
    expect(result?.surakshaDecision).toBeDefined();
    expect(result?.surakshaDecision?.verdict).toBe("danger");
    expect(result?.evidence.length).toBeGreaterThanOrEqual(2);
  });
});
