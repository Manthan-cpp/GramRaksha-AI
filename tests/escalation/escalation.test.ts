import { describe, it, expect } from "vitest";
import {
  calculateEscalationTimeline,
  generateRtiApplication
} from "@/lib/escalation/rti";
import {
  generateKvkReferralSlip,
  generateKvkWhatsAppText
} from "@/lib/krishi/kvk-referral";

describe("Case Follow-Through Escalation Ladder", () => {
  it("calculates Day 0 milestone for fresh cases", () => {
    const now = Date.now();
    const createdAt = new Date(now - 2 * 86400000).toISOString(); // 2 days ago
    const timeline = calculateEscalationTimeline(createdAt, now, "medi");

    expect(timeline.daysElapsed).toBe(2);
    expect(timeline.currentMilestoneIndex).toBe(0);
    expect(timeline.milestones[0].status).toBe("active");
    expect(timeline.milestones[1].status).toBe("upcoming");
    expect(timeline.milestones[3].status).toBe("upcoming");
  });

  it("advances to Day 7 written follow-up reminder for cases 7-14 days old", () => {
    const now = Date.now();
    const createdAt = new Date(now - 10 * 86400000).toISOString(); // 10 days ago
    const timeline = calculateEscalationTimeline(createdAt, now, "cashless");

    expect(timeline.daysElapsed).toBe(10);
    expect(timeline.currentMilestoneIndex).toBe(1);
    expect(timeline.milestones[0].status).toBe("completed");
    expect(timeline.milestones[1].status).toBe("active");
    expect(timeline.milestones[2].status).toBe("upcoming");
    expect(timeline.milestones[1].legalProvision).toContain("Consumer Protection Act");
  });

  it("advances to Day 15 regulatory grievance for cases 15-29 days old", () => {
    const now = Date.now();
    const createdAt = new Date(now - 20 * 86400000).toISOString(); // 20 days ago
    const timeline = calculateEscalationTimeline(createdAt, now, "fasal");

    expect(timeline.daysElapsed).toBe(20);
    expect(timeline.currentMilestoneIndex).toBe(2);
    expect(timeline.milestones[0].status).toBe("completed");
    expect(timeline.milestones[1].status).toBe("completed");
    expect(timeline.milestones[2].status).toBe("active");
    expect(timeline.milestones[2].title).toContain("District Grievance Committee");
  });

  it("activates Day 30 statutory RTI application for cases 30+ days old", () => {
    const now = Date.now();
    const createdAt = new Date(now - 35 * 86400000).toISOString(); // 35 days ago
    const timeline = calculateEscalationTimeline(createdAt, now, "medi");

    expect(timeline.daysElapsed).toBe(35);
    expect(timeline.currentMilestoneIndex).toBe(3);
    expect(timeline.milestones[0].status).toBe("completed");
    expect(timeline.milestones[1].status).toBe("completed");
    expect(timeline.milestones[2].status).toBe("completed");
    expect(timeline.milestones[3].status).toBe("active");
    expect(timeline.milestones[3].title).toContain("RTI Application");
  });
});

describe("Statutory RTI Application Generator (Section 6(1) RTI Act 2005)", () => {
  const sampleParams = {
    applicantName: "Ramswaroop Meena",
    applicantAddress: "Village Weir, Bharatpur, Rajasthan",
    applicantPhone: "9876543210",
    targetDepartment: "Office of the Chief Medical Officer / District Health Society",
    targetCity: "Bharatpur",
    targetState: "Rajasthan",
    subjectReference: "Advance Deposit Grievance at Apex Hospital",
    originalComplaintDate: "1 September 2026",
    originalReferenceNumber: "PMJAY-DISP-2026-991"
  };

  it("generates a legally robust English RTI application with Section 20(1) penalty notice", () => {
    const rti = generateRtiApplication({ ...sampleParams, locale: "en" });

    expect(rti).toContain("SECTION 6(1) OF THE RIGHT TO INFORMATION ACT, 2005");
    expect(rti).toContain("Ramswaroop Meena");
    expect(rti).toContain("Public Information Officer (PIO)");
    expect(rti).toContain("Chief Medical Officer");
    expect(rti).toContain("Section 20(1)");
    expect(rti).toContain("₹250 per day");
    expect(rti).toContain("₹25,000");
    expect(rti).toContain("₹10");
    expect(rti).toContain("Action Taken Report (ATR)");
  });

  it("generates a formal Hindi RTI application", () => {
    const rti = generateRtiApplication({
      ...sampleParams,
      applicantName: "रामस्वरूप मीणा",
      locale: "hi"
    });

    expect(rti).toContain("सूचना का अधिकार अधिनियम, 2005 की धारा 6(1)");
    expect(rti).toContain("रामस्वरूप मीणा");
    expect(rti).toContain("लोक सूचना अधिकारी (PIO)");
    expect(rti).toContain("दैनिक प्रगति विवरण");
    expect(rti).toContain("धारा 20(1)");
    expect(rti).toContain("₹250 प्रतिदिन");
    expect(rti).toContain("₹10 का आवेदन शुल्क");
  });

  it("generates a formal Bengali RTI application", () => {
    const rti = generateRtiApplication({
      ...sampleParams,
      applicantName: "রামস্বরূপ মীনা",
      locale: "bn"
    });

    expect(rti).toContain("তথ্যের অধিকার আইন, ২০০৫ এর ধারা ৬(১)");
    expect(rti).toContain("রামস্বরূপ মীনা");
    expect(rti).toContain("পাবলিক ইনফরমেশন অফিসার (PIO)");
    expect(rti).toContain("দৈনিক অগ্রগতি প্রতিবেদন");
    expect(rti).toContain("ধারা ২০(১)");
    expect(rti).toContain("₹১০ টাকার আবেদন ফি");
  });
});

describe("KVK Agricultural Expert Referral Engine & Safety Mandate", () => {
  const sampleKvkParams = {
    farmerName: "Harishankar Dubey",
    farmerPhone: "9876543210",
    village: "Babura",
    district: "Varanasi",
    state: "Uttar Pradesh",
    crop: "Tomato",
    growthStage: "Flowering & Fruit Setting",
    symptomsOrConcern: "Leaves curling upward with yellow margin, possible whitefly attack",
    mandiPriceSummary: "Varanasi Mandi: ₹1,850/qtl (Hybrid)",
    weatherSummary: "Light rain and high humidity expected in next 48h"
  };

  it("generates official KVK Referral Slip containing zero-diagnosis safety mandate", () => {
    const slip = generateKvkReferralSlip({ ...sampleKvkParams, locale: "en" });

    expect(slip).toContain("KRISHI VIGYAN KENDRA (KVK) EXPERT REFERRAL SLIP");
    expect(slip).toContain("Harishankar Dubey");
    expect(slip).toContain("Tomato");
    expect(slip).toContain("Flowering & Fruit Setting");
    expect(slip).toContain("Leaves curling upward");
    expect(slip).toContain("1800-180-1551");
    expect(slip).toContain("zero-diagnosis safety mandate");
    expect(slip).toContain("never prescribes synthetic pesticides");
  });

  it("generates formatted Hindi KVK Referral Slip", () => {
    const slip = generateKvkReferralSlip({
      ...sampleKvkParams,
      farmerName: "हरिशंकर दुबे",
      crop: "टमाटर",
      locale: "hi"
    });

    expect(slip).toContain("कृषि विज्ञान केंद्र (KVK)");
    expect(slip).toContain("विशेषज्ञ निदान एवं परामर्श रेफरल पर्ची");
    expect(slip).toContain("हरिशंकर दुबे");
    expect(slip).toContain("टमाटर");
    expect(slip).toContain("ग्रामरक्षा एआई किसी भी प्रकार के रासायनिक कीटनाशक");
  });

  it("generates formatted WhatsApp consultation message", () => {
    const wa = generateKvkWhatsAppText(sampleKvkParams);

    expect(wa).toContain("*🌾 KRISHI VIGYAN KENDRA (KVK) EXPERT CONSULTATION REQUEST*");
    expect(wa).toContain("Harishankar Dubey");
    expect(wa).toContain("Babura, Varanasi, Uttar Pradesh");
    expect(wa).toContain("Tomato");
    expect(wa).toContain("Flowering & Fruit Setting");
    expect(wa).toContain("Leaves curling upward");
    expect(wa).toContain("GramRaksha AI KVK Referral Desk");
  });
});
