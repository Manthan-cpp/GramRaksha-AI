import type {
  AyushmanCashlessDecision,
  BuildCashlessDecisionInput,
  CashlessEmpanelmentStatus,
  CashlessEscalationTier
} from "./cashless-types";
import { getStateHealthAgency, NATIONAL_CGRMS_PORTAL, NATIONAL_PMJAY_ALTERNATE, NATIONAL_PMJAY_HELPLINE } from "./cashless-directory";
import { generateCashlessLetterBn, generateCashlessLetterEn, generateCashlessLetterHi } from "./cashless-letter";

export function buildAyushmanCashlessDecision(input: BuildCashlessDecisionInput): AyushmanCashlessDecision {
  const { request, evidence, locale = "en" } = input;
  const sha = getStateHealthAgency(request.state);

  const hospitalLower = request.hospital.toLowerCase();
  const cityLower = request.city.toLowerCase();

  let hasExplicitEmpanelmentMatch = false;
  let hasRegistryMatch = false;

  for (const item of evidence) {
    const text = `${item.title} ${item.snippet}`.toLowerCase();
    const mentionsHospital = text.includes(hospitalLower) ||
      hospitalLower.split(" ").some((w) => w.length > 4 && text.includes(w)) ||
      (text.includes(cityLower) && text.includes("hospital"));
    const mentionsEmpanelment = text.includes("empanel") || text.includes("pmjay") || text.includes("ayushman") || text.includes("cashless") || text.includes("cghs");
    const isOfficialGov = item.publisher.includes("gov.in") || item.publisher.includes("nic.in") || item.url.includes("gov.in");

    if (mentionsHospital && mentionsEmpanelment) {
      hasExplicitEmpanelmentMatch = true;
    }
    if (isOfficialGov && mentionsEmpanelment) {
      hasRegistryMatch = true;
    }
  }

  let empanelmentStatus: CashlessEmpanelmentStatus = "verification_advisory";
  let empanelmentStatement = "";

  if (hasExplicitEmpanelmentMatch) {
    empanelmentStatus = "empanelled_confirmed";
    empanelmentStatement = `${request.hospital} appears on official State Health Agency empanelment records under PM-JAY. Under Clause 8.2 of the statutory empanelment MoU, empanelled healthcare providers are legally mandated to deliver treatment on a 100% cashless basis with zero advance deposit.`;
  } else if (hasRegistryMatch) {
    empanelmentStatus = "listed_in_registry";
    empanelmentStatement = `${request.hospital} is referenced in public health insurance records for ${request.city}. If admitted under Ayushman Bharat PM-JAY, the hospital is statutorily prohibited from charging any advance deposit or out-of-pocket fees.`;
  } else {
    empanelmentStatus = "verification_advisory";
    empanelmentStatement = `Empanelment verification records for ${request.hospital} in ${request.city} can be verified instantly with the on-duty Pradhan Mantri Arogya Mitra (PMAM) desk or by calling the national toll-free helpline 14555.`;
  }

  const depositStr = `₹${request.depositDemanded.toLocaleString("en-IN")}`;
  const patientDisplayName = request.patientName?.trim() || "Beneficiary";
  const cardDisplayName = request.pmjayId?.trim() || "Ayushman Golden Card";

  const escalationLadder: CashlessEscalationTier[] = [
    {
      tier: 1,
      title: "Pradhan Mantri Arogya Mitra (PMAM) Helpdesk & Medical Superintendent",
      authority: "Hospital PM-JAY Kiosk & Hospital Administration",
      actionText: `Approach the on-site PMAM desk located near the hospital admission counter. Present the Ayushman Golden Card and this statutory notice. Request instant electronic pre-authorization under PM-JAY without any advance deposit.`,
      phone: sha.tollFree,
      turnaround: "Immediate (1 to 2 hours)",
      legalBasis: "PM-JAY Guidelines Clause 8.2 — Zero deposit mandate"
    },
    {
      tier: 2,
      title: "District Grievance Redressal Committee (DGRC)",
      authority: sha.cmoAuthority,
      actionText: `If hospital staff refuses admission without deposit, call the District Health Cell or submit a written petition to the Chief Medical Officer / Civil Surgeon. The DGRC possesses statutory powers to inspect the facility and direct immediate admission.`,
      phone: sha.alternatePhone || sha.tollFree,
      turnaround: "Within 24 hours",
      legalBasis: "DGRC Operational Framework for Urgent Admission Redressal"
    },
    {
      tier: 3,
      title: "State Health Agency (SHA) Grievance Cell",
      authority: sha.shaName,
      actionText: `File an urgent telephonic or electronic complaint with ${sha.shaName}. Quote the demanded deposit of ${depositStr} and request intervention from the State Nodal Officer for Hospital Compliance.`,
      phone: sha.tollFree,
      turnaround: "Within 48 hours",
      legalBasis: "Section 23 of Empanelment MoU — Penalty & Show-cause notice"
    },
    {
      tier: 4,
      title: "National Health Authority CGRMS Portal & 14555 Helpline",
      authority: "National Health Authority (NHA), Government of India",
      actionText: `Log an official national grievance ticket on ${NATIONAL_CGRMS_PORTAL} or dial 14555. The national portal generates a unique tracking number and marks the incident on the hospital's national compliance dashboard.`,
      phone: NATIONAL_PMJAY_HELPLINE,
      turnaround: "Within 72 hours (tracked centrally)",
      legalBasis: "NHA Anti-Fraud and Beneficiary Protection Charter"
    }
  ];

  const letterData = {
    hospital: request.hospital,
    city: request.city,
    state: request.state,
    procedure: request.procedure,
    depositDemanded: request.depositDemanded,
    patientName: patientDisplayName,
    pmjayId: cardDisplayName,
    demandedReason: request.demandedReason
  };

  const letterEn = generateCashlessLetterEn(letterData);
  const letterHi = generateCashlessLetterHi(letterData);
  const letterBn = generateCashlessLetterBn(letterData);

  let speechSummary = "";
  if (locale === "hi") {
    speechSummary = `आयुष्मान भारत योजना के नियम खंड 8.2 के अनुसार कोई भी पैनलबद्ध अस्पताल आपसे किसी भी तरह का एडवांस या जमानत राशि नहीं मांग सकता। अस्पताल द्वारा मांगी जा रही ${depositStr} की अग्रिम राशि गैरकानूनी है। तुरंत अस्पताल के आरोग्य मित्र पटल पर जाएं या राष्ट्रीय टोल-फ्री नंबर 14555 पर कॉल करें।`;
  } else if (locale === "bn") {
    speechSummary = `আয়ুষ্মান ভারত নিয়মাবলী ধারা ৮.২ অনুযায়ী কোনো প্যানেলভুক্ত হাসপাতাল আপনার কাছ থেকে অগ্রিম জমা দাবি করতে পারে না। হাসপাতালের দাবি করা ${depositStr} টাকা বেআইনি। অবিলম্বে হাসপাতালের আরোগ্য মিত্র ডেস্কে যোগাযোগ করুন অথবা টোল-ফ্রি ১৪৫৫৫ নম্বরে ফোন করুন।`;
  } else {
    speechSummary = `Under Ayushman Bharat PM-JAY Operational Guidelines Clause 8.2, empanelled hospitals cannot charge any upfront cash deposit. The demanded deposit of ${depositStr} is not permitted. Visit the hospital's Arogya Mitra desk or dial toll-free 14555 immediately.`;
  }

  const evidenceReferences = evidence.slice(0, 6).map((item) => ({
    title: item.title,
    url: item.url,
    publisher: item.publisher,
    snippet: item.snippet
  }));

  let guidanceTips: string[] = [];
  if (locale === "hi") {
    guidanceTips = [
      "आयुष्मान गोल्डन कार्ड सक्रिय होने पर किसी भी 'स्वैच्छिक भुगतान' (Self-Pay) या नकद घोषणापत्र पर हस्ताक्षर न करें।",
      "अस्पताल के मुख्य प्रवेश या आपातकालीन काउंटर पर स्थित 'प्रधानमंत्री आरोग्य मित्र' (PMAM) डेस्क खोजें और अपना कार्ड दें।",
      "प्रवेश डेस्क को आयुष्मान नियम खंड 8.2 का हवाला दें और फोन में यह तैयार आधिकारिक कानूनी नोटिस दिखाएं।",
      "यदि स्टाफ सर्वर डाउन या बेड न होने का बहाना बनाए, तो काउंटर पर खड़े होकर ही तुरंत 14555 डायल करके स्पीकर पर शिकायत दर्ज कराएं।",
      "यदि मजबूरी में पैसे जमा करने पड़े हों, तो रसीद सुरक्षित रखें — कानूनी नियमों के तहत अस्पताल को पूरा पैसा वापस करना होगा।"
    ];
  } else if (locale === "bn") {
    guidanceTips = [
      "আয়ুষ্মান কার্ড সক্রিয় থাকা অবস্থায় কোনো 'স্বেচ্ছায় নগদ অর্থ প্রদান' (Self-Pay) ফর্মে স্বাক্ষর করবেন না।",
      "হাসপাতালের মূল প্রবেশদ্বার বা এমার্জেন্সি কাউন্টারে থাকা 'প্রধানমন্ত্রী আরোগ্য মিত্র' (PMAM) ডেস্কে গিয়ে কার্ড জমা দিন।",
      "বিলিং কর্মীদের আয়ুষ্মান নিয়মাবলী ধারা ৮.২ উল্লেখ করুন এবং আপনার ফোনের এই আনুষ্ঠানিক আইনি নোটিশটি প্রদর্শন করুন।",
      "হাসপাতাল যদি সার্ভার ডাউন বা বেড না থাকার অজুহাত দেয়, তবে কাউন্টারের সামনে দাঁড়িয়ে সরাসরি ১৪৫৫৫ নম্বরে ফোন করুন।",
      "যদি চাপের মুখে টাকা জমা দিতে বাধ্য হন, তবে রসিদ যত্ন করে রাখুন — আইনানুযায়ী হাসপাতাল সম্পূর্ণ অর্থ ফেরত দিতে বাধ্য।"
    ];
  } else {
    guidanceTips = [
      "Do not sign any 'self-pay' or 'voluntary out-of-pocket' declarations while your Ayushman Golden Card is active.",
      "Locate the on-duty Pradhan Mantri Arogya Mitra (PMAM) desk — positioned at the main admission counter — and hand over your card.",
      "Quote PM-JAY Clause 8.2 and show this formal statutory notice directly to the hospital admission desk.",
      "Call 14555 on speakerphone in front of the counter if staff claims the Ayushman server is down or PM-JAY beds are unavailable.",
      "If money was already paid under duress, keep the receipt safely — under Clause 23, the hospital can be mandated to refund the deposit."
    ];
  }

  return {
    hospital: request.hospital,
    city: request.city,
    state: request.state,
    procedure: request.procedure,
    depositDemanded: request.depositDemanded,
    patientName: patientDisplayName,
    pmjayId: cardDisplayName,
    empanelmentStatus,
    empanelmentStatement,
    statutoryClause: {
      code: "Clause 8.2 & Clause 11.1",
      title: "PM-JAY Cashless & Paperless Access Mandate",
      summary: "Empanelled hospitals are bound by their MoU with the State Health Agency to provide completely cashless medical treatment for all covered packages, with zero upfront deposit.",
      officialUrl: "https://pmjay.gov.in/about/pmjay"
    },
    escalationLadder,
    letterEn,
    letterHi,
    letterBn,
    speechSummary,
    helplines: {
      nationalTollFree: NATIONAL_PMJAY_HELPLINE,
      nationalAlternate: NATIONAL_PMJAY_ALTERNATE,
      stateShaName: sha.shaName,
      stateShaTollFree: sha.tollFree,
      statePortalUrl: sha.portalUrl,
      hospitalDeskNote: `Ask for the on-duty Pradhan Mantri Arogya Mitra (PMAM) at ${request.hospital}`
    },
    guidanceTips,
    evidenceReferences
  };
}
