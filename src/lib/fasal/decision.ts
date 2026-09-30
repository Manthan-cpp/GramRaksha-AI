import {
  Evidence,
  EvidenceMetrics,
  FasalDecision
} from "@/lib/schemas";
import { FasalIncidentInput, FasalPhotoEvidence } from "./types";
import { calculateFasalCountdown, formatCalamityName } from "./calculator";
import { lookupEmpanelledInsurer } from "./insurer-directory";
import { generateFasalIntimationLetter } from "./letter";

interface DecisionOptions {
  incident: FasalIncidentInput;
  photos?: FasalPhotoEvidence[];
  evidence: Evidence[];
  metrics: EvidenceMetrics;
  warnings: string[];
  locale?: "en" | "hi" | "bn";
}

export function buildFasalDecision({
  incident,
  photos = [],
  evidence,
  locale = "en"
}: DecisionOptions): FasalDecision {
  const countdown = calculateFasalCountdown(incident.incidentTime, Date.now(), locale);
  const calamityLabel = formatCalamityName(incident.calamityType, locale);
  const insurer = lookupEmpanelledInsurer(incident.state, incident.district);

  // Extract DAO office or Agriculture Center from Google Maps evidence if found
  const mapsResult = evidence.find((e) => e.engine === "google_maps" && e.maps);
  const daoOffice = {
    officeName: mapsResult?.maps?.name || `Office of District Agriculture Officer (${incident.district})`,
    address: mapsResult?.maps?.address || `District Krishi Bhavan / Agriculture Complex, ${incident.district}, ${incident.state}`,
    phone: mapsResult?.maps?.phone || "1800-180-1551",
    mapsUrl: mapsResult?.maps?.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`District Agriculture Office ${incident.district} ${incident.state}`)}`
  };

  const letterText = generateFasalIntimationLetter({
    incident,
    insurer,
    daoOfficeName: daoOffice.officeName,
    daoAddress: daoOffice.address,
    photos,
    locale
  });

  const actions = [
    {
      id: "call-14447",
      priority: 1,
      title: locale === "hi" ? "राष्ट्रीय फसल बीमा हेल्पलाइन (14447) पर कॉल करें" : locale === "bn" ? "জাতীয় ফসল বিমা হেল্পলাইন (14447)-এ কল করুন" : "Dial National PMFBY Helpline (14447)",
      description: locale === "hi" 
        ? "बिना किसी शुल्क के 14447 डायल करें और तुरंत अपना दावा टोकन नंबर दर्ज करवाएं।" 
        : locale === "bn" 
        ? "টোল-ফ্রি 14447 নম্বরে ডায়াল করে সাথে সাথে আপনার অভিযোগ নিবন্ধন ও রেফারেন্স নম্বর নিন।"
        : "Toll-free national helpline dedicated for all PMFBY claims. Log your loss intimation to obtain a ticket number.",
      actionType: "call" as const,
      actionValue: "tel:14447",
      isUrgent: true
    },
    {
      id: "open-crop-app",
      priority: 2,
      title: locale === "hi" ? "क्रॉप इंश्योरेंस (Crop Insurance) ऐप में फोटो अपलोड करें" : locale === "bn" ? "ক্রপ ইন্স্যুরেন্স অ্যাপে ছবি আপলোড করুন" : "Intimate on Official Crop Insurance App",
      description: locale === "hi" 
        ? "कृषि मंत्रालय की आधिकारिक क्रॉप इंश्योरेंस ऐप पर जियो-टैग फ़ोटो के साथ घटना दर्ज करें।" 
        : locale === "bn" 
        ? "কৃষি মন্ত্রকের অফিসিয়াল ক্রপ ইন্স্যুরেন্স মোবাইল অ্যাপে ক্ষতি রিপোর্ট করুন।"
        : "Government of India official app allows immediate self-intimation with geo-tagged on-field photos.",
      actionType: "app" as const,
      actionValue: "https://play.google.com/store/apps/details?id=in.farmguide.farmerapp",
      isUrgent: countdown.urgency === "critical"
    },
    {
      id: "call-insurer",
      priority: 3,
      title: locale === "hi" ? `बीमा कंपनी हेल्पलाइन: ${insurer.tollFree}` : locale === "bn" ? `বিমা কোম্পানি হেল্পলাইন: ${insurer.tollFree}` : `Call Insurer: ${insurer.name}`,
      description: locale === "hi" 
        ? `${insurer.name} के टोल-फ्री नंबर ${insurer.tollFree} पर कॉल करके पावती मांगें।` 
        : locale === "bn" 
        ? `${insurer.name}-এর টোল-ফ্রি ${insurer.tollFree} নম্বরে ফোন করে ক্লেম জানান।`
        : `Empanelled insurance company for ${incident.state}. Helpline: ${insurer.tollFree}`,
      actionType: "call" as const,
      actionValue: `tel:${insurer.tollFree.replace(/[^0-9]/g, "")}`,
      isUrgent: false
    },
    {
      id: "submit-letter",
      priority: 4,
      title: locale === "hi" ? "ज़िला कृषि अधिकारी (DAO) को पत्र सौंपें" : locale === "bn" ? "জেলা কৃষি আধিকারিককে আনুষ্ঠানিক চিঠি জমা দিন" : "Submit Formal Intimation to DAO & Bank",
      description: locale === "hi" 
        ? "नीचे दिया गया आधिकारिक 72-घंटे का पत्र प्रिंट करें और हस्ताक्षर करके DAO कार्यालय एवं अपनी बैंक शाखा में पावती सहित जमा करें।" 
        : locale === "bn" 
        ? "নিচের ৭২ ঘণ্টার আনুষ্ঠানিক চিঠি প্রিন্ট করে DAO অফিস এবং আপনার ব্যাংক শাখায় রিসিভিং কপিসহ জমা দিন।"
        : "Print the generated statutory notice and submit receiving copies to the DAO Office and your loan branch.",
      actionType: "letter" as const,
      isUrgent: false
    }
  ];

  let speechSummary = "";
  if (locale === "hi") {
    speechSummary = countdown.isExpired
      ? `ध्यान दें! घटना के बहत्तर घंटे की सूचना समय सीमा समाप्त हो चुकी है। फिर भी तुरंत ज़िला कृषि अधिकारी और 14447 पर संपर्क करके राहत और संयुक्त सर्वेक्षण का अनुरोध करें।`
      : `सावधान! ${incident.crop} फसल में ${calamityLabel} से नुकसान की सूचना देने के लिए आपके पास केवल ${countdown.hoursLeft} घंटे और ${countdown.minutesLeft} मिनट शेष हैं। तुरंत 14447 पर कॉल करें और नीचे दिए गए आवेदन पत्र की पावती लें।`;
  } else if (locale === "bn") {
    speechSummary = countdown.isExpired
      ? `মনোযোগ দিন! ৭২ ঘণ্টার নির্দিষ্ট সময়সীমা সমাপ্ত হয়েছে। অবিলম্বে জেলা কৃষি আধিকারিক এবং 14447 নম্বরে জরুরি আবেদন করুন।`
      : `সতর্কতা! ${incident.crop} ফসলের ${calamityLabel} জনিত ক্ষতির দাবির জন্য আপনার হাতে আর ${countdown.hoursLeft} ঘণ্টা ${countdown.minutesLeft} মিনিট বাকি আছে। অবিলম্বে 14447 নম্বরে যোগাযোগ করুন।`;
  } else {
    speechSummary = countdown.isExpired
      ? `Notice: The 72-hour statutory window for localized calamity intimation has lapsed. Submit an urgent grievance notice to the District Agriculture Officer immediately.`
      : `Urgent action required: You have ${countdown.hoursLeft} hours and ${countdown.minutesLeft} minutes left to formally intimate your ${incident.crop} crop loss due to ${calamityLabel}. Dial 14447 now and preserve all timestamped photos.`;
  }

  const guidelineRule = "Pradhan Mantri Fasal Bima Yojana (PMFBY) Revised Operational Guidelines, Section 15.3: Mandatory loss intimation within 72 hours of localized calamity occurrence.";

  const labels: Record<string, string> = {
    countdownTitle: locale === "hi" ? "72-घंटे की विधिक उलटी गिनती" : locale === "bn" ? "৭২ ঘণ্টার সংবিধিবদ্ধ কাউন্টডাউন" : "72-Hour Statutory Countdown",
    calamity: locale === "hi" ? "आपदा का प्रकार" : locale === "bn" ? "দুর্যোগের ধরন" : "Calamity Type",
    damage: locale === "hi" ? "अनुमानित क्षति" : locale === "bn" ? "আনুমানিক ক্ষতি" : "Estimated Loss",
    deadline: locale === "hi" ? "अंतिम सूचना समय-सीमा" : locale === "bn" ? "সর্বশেষ সময়সীমা" : "Intimation Cutoff Deadline",
    daoTitle: locale === "hi" ? "ज़िला कृषि कार्यालय" : locale === "bn" ? "জেলা কৃষি আধিকারিক" : "District Agriculture Office",
    insurerTitle: locale === "hi" ? "सूचीबद्ध बीमा कंपनी" : locale === "bn" ? "তালিকাভুক্ত বিমা সংস্থা" : "Empanelled Insurer",
    letterTitle: locale === "hi" ? "आधिकारिक दावा सूचना पत्र (72-Hour Letter)" : locale === "bn" ? "দাবি নোটিশ (৭২ ঘণ্টার চিঠি)" : "Statutory Claim Notice (72-Hour Letter)"
  };

  return {
    countdown,
    calamityType: incident.calamityType,
    calamityLabel,
    incidentTime: incident.incidentTime,
    state: incident.state,
    district: incident.district,
    village: incident.village,
    khasraNo: incident.khasraNo,
    crop: incident.crop,
    areaAcres: incident.areaAcres,
    lossPercentage: incident.lossPercentage,
    farmerName: incident.farmerName,
    farmerPhone: incident.farmerPhone,
    applicationNo: incident.applicationNo,
    bankAccountRef: incident.bankAccountRef,
    insurer,
    daoOffice,
    actions,
    letterText,
    speechSummary,
    guidelineRule,
    labels
  };
}
