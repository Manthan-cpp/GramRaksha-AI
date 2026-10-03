import {
  Evidence,
  EvidenceMetrics,
  PashuDecision,
  PashuDecisionStep,
  PashuHospital,
  PashuEvidenceRequest
} from "@/lib/schemas";
import { findMatchingGuideline } from "./knowledge";

interface DecisionOptions {
  request: PashuEvidenceRequest;
  evidence: Evidence[];
  metrics?: EvidenceMetrics;
  warnings?: string[];
  locale?: "en" | "hi" | "bn";
}

export function buildPashuDecision({
  request,
  evidence,
  locale = "en"
}: DecisionOptions): PashuDecision {
  const { animal, concern, state, district } = request;
  const guide = findMatchingGuideline(animal, concern);

  // Extract real veterinary hospitals / dispensaries from SerpApi Google Maps evidence
  const mapsEvidences = evidence.filter((e) => e.engine === "google_maps" && e.maps);
  const nearbyHospitals: PashuHospital[] = [];

  if (mapsEvidences.length > 0) {
    for (const item of mapsEvidences) {
      if (item.maps) {
        nearbyHospitals.push({
          name: item.maps.name || `Government Veterinary Hospital (${district})`,
          address: item.maps.address || `${district}, ${state}`,
          phone: item.maps.phone || "1962",
          mapsUrl: item.maps.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Government Veterinary Hospital ${district} ${state}`)}`,
          evidenceId: item.id,
          isGovernment: true
        });
      }
    }
  }

  // Fallback if maps query returned 0 places
  if (nearbyHospitals.length === 0) {
    nearbyHospitals.push({
      name: `Government Veterinary Hospital & Polyclinic (${district})`,
      address: `District Animal Husbandry Complex, ${district}, ${state}`,
      phone: "1962 (Toll-Free MVU)",
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Veterinary Hospital Pashu Chikitsalaya ${district} ${state}`)}`,
      isGovernment: true
    });
    nearbyHospitals.push({
      name: `Block Veterinary Dispensary (${district})`,
      address: `Block Development & Animal Care Centre, ${district}, ${state}`,
      phone: "1800-180-1551",
      mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`Pashu Chikitsalaya ${district}`)}`,
      isGovernment: true
    });
  }

  // Extract source references from kept SerpApi evidence
  const sourceReferences = evidence
    .filter((e) => e.engine === "google" || e.engine === "google_news" || e.engine === "youtube")
    .slice(0, 5)
    .map((e) => ({
      title: e.title,
      url: e.url,
      publisher: e.publisher || "Official Veterinary Advisory"
    }));

  // Fallback official sources if none in evidence
  if (sourceReferences.length === 0) {
    sourceReferences.push(
      {
        title: "ICAR-Indian Veterinary Research Institute (IVRI) Advisory Guidelines",
        url: "https://ivri.nic.in",
        publisher: "ICAR-IVRI Bareilly"
      },
      {
        title: "National Dairy Development Board (NDDB) Ethnoveterinary Formulations",
        url: "https://www.nddb.coop",
        publisher: "NDDB Anand"
      },
      {
        title: "Department of Animal Husbandry & Dairying (DAHD) 1962 MVU Scheme",
        url: "https://dahd.nic.in",
        publisher: "Govt of India (DAHD)"
      }
    );
  }

  // Build localized steps
  const doNowSteps: PashuDecisionStep[] = guide.doNowSteps.map((s, index) => ({
    id: `step-${index + 1}`,
    stepNumber: index + 1,
    title: s.title[locale] || s.title.en,
    instruction: s.instruction[locale] || s.instruction.en,
    explanation: s.explanation[locale] || s.explanation.en,
    isEmergency: s.isEmergency || false,
    badge: s.badge
  }));

  const neverDoWarnings = Array.isArray(guide.neverDoWarnings)
    ? guide.neverDoWarnings
    : (guide.neverDoWarnings[locale] || guide.neverDoWarnings.en);

  const dietAndCareTips = Array.isArray(guide.dietAndCareTips)
    ? guide.dietAndCareTips
    : (guide.dietAndCareTips[locale] || guide.dietAndCareTips.en);

  const headline = guide.name[locale] || guide.name.en;
  const summary = guide.summary[locale] || guide.summary.en;
  const speechSummary = guide.speechText[locale] || guide.speechText.en;

  const ambulanceHelpline = {
    number: "1962",
    name: locale === "hi" 
      ? "राष्ट्रीय चल पशु चिकित्सा इकाई (1962 MVU) / पशु संजीवनी" 
      : locale === "bn" 
      ? "জাতীয় ভ্রাম্যমাণ পশু চিকিৎসা ইউনিট (1962 MVU) / পশু সঞ্জীবনী" 
      : "National Mobile Veterinary Unit (1962 MVU) / Pashu Sanjeevani",
    kisanNumber: "1800-180-1551",
    instructions: locale === "hi"
      ? "टोल-फ्री 1962 डायल करें। ऑपरेटर को अपना गांव, जिला और पशु की स्थिति बताएं। डॉक्टर से लैस पशु एम्बुलेंस आपके दरवाजे तक पहुंचेगी।"
      : locale === "bn"
      ? "টোল-ফ্রি 1962 নম্বরে ডায়াল করুন। অপারেটরকে আপনার গ্রাম, জেলা এবং পশুর উপসর্গ জানান। ভ্রাম্যমাণ অ্যাম্বুলেন্স এসে চিকিৎসা দেবে।"
      : "Dial toll-free 1962. State your village, district, and animal symptoms. A GPS-enabled veterinary van with a doctor will be dispatched."
  };

  return {
    status: guide.defaultStatus,
    animal,
    concern,
    detectedCondition: guide.conditionKey,
    headline,
    summary,
    speechSummary,
    ambulanceHelpline,
    doNowSteps,
    neverDoWarnings,
    nearbyHospitals: nearbyHospitals.slice(0, 4),
    sourceReferences,
    dietAndCareTips,
    labels: {
      animalLabel: locale === "hi" ? "पशु प्रजाति" : locale === "bn" ? "পশুর প্রজাতি" : "Animal Species",
      conditionLabel: locale === "hi" ? "पहचानी गई समस्या" : locale === "bn" ? "শনাক্ত সমস্যা" : "Identified Issue",
      stepsHeader: locale === "hi" ? "तुरंत क्या करें (कदम दर कदम प्राथमिक उपचार)" : locale === "bn" ? "এখনই কী করবেন (ধাপে ধাপে প্রাথমিক চিকিৎসা)" : "What To Do Immediately (Step-by-Step First Aid)",
      neverDoHeader: locale === "hi" ? "क्या भूलकर भी न करें (सख्त चेतावनी)" : locale === "bn" ? "যা কখনোই করবেন না (কঠোর সতর্কতা)" : "What NEVER To Do (Strict Clinical Warnings)",
      hospitalHeader: locale === "hi" ? "निकटतम सरकारी पशु चिकित्सालय (गूगल मैप्स)" : locale === "bn" ? "নিকটস্থ সরকারি পশু হাসপাতাল (গুগল ম্যাপস)" : "Nearby Government Veterinary Hospitals",
      sourcesHeader: locale === "hi" ? "आधिकारिक स्रोत एवं आईसीएआर प्रमाण" : locale === "bn" ? "সরকারি সূত্র ও আইসিএআর তথ্য" : "Official ICAR / IVRI Sources",
      ambulanceButton: locale === "hi" ? "1962 पशु एम्बुलेंस को कॉल करें" : locale === "bn" ? "1962 পশু অ্যাম্বুলেন্সে কল করুন" : "Dial 1962 Animal Ambulance"
    }
  };
}
