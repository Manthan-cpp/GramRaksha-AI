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
  metrics?: EvidenceMetrics;
  warnings?: string[];
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
        ? `बिना किसी शुल्क के 14447 डायल करें। ऑपरेटर को अपना खसरा नंबर (${incident.khasraNo || "खसरा दर्ज करें"}) और नुकसान (${incident.lossPercentage}%) बताएं। एसएमएस में आने वाला टोकन/डॉकट नंबर सुरक्षित नोट कर लें।` 
        : locale === "bn" 
        ? `টোল-ফ্রি 14447 নম্বরে ডায়াল করুন। আপনার খসড়া নম্বর (${incident.khasraNo || "খসড়া"}) এবং ক্ষতির পরিমাণ (${incident.lossPercentage}%) জানান। এসএমএস-এ আসা ডকেট বা টিকিট নম্বর লিখে রাখুন।`
        : `Toll-free national helpline. State your Khasra No (${incident.khasraNo || "Field Khasra"}) and estimated loss (${incident.lossPercentage}%). Write down the SMS Docket / Ticket number immediately.`,
      actionType: "call" as const,
      actionValue: "tel:14447",
      isUrgent: true
    },
    {
      id: "open-crop-app",
      priority: 2,
      title: locale === "hi" ? "क्रॉप इंश्योरेंस (Crop Insurance) ऐप में फोटो अपलोड करें" : locale === "bn" ? "ক্রপ ইন্স্যুরেন্স অ্যাপে ছবি আপলোড করুন" : "Intimate on Official Crop Insurance App",
      description: locale === "hi" 
        ? "कृषि मंत्रालय की आधिकारिक ऐप पर जाकर 'Crop Loss Intimation' चुनें, अपना 14447 टोकन नंबर डालें और खेत के नुकसान की 3 स्पष्ट जियो-टैग फ़ोटो अपलोड करें।" 
        : locale === "bn" 
        ? "অফিসিয়াল অ্যাপে 'Crop Loss' অপশনে গিয়ে 14447 টিকিট নম্বর দিন এবং ক্ষতিগ্রস্ত ফসলের ৩টি পরিষ্কার ছবি আপলোড করুন।"
        : "Open the official government Crop Insurance mobile app, select 'Crop Loss Intimation', enter your 14447 ticket number, and upload 3 on-field photos.",
      actionType: "app" as const,
      actionValue: "https://play.google.com/store/apps/details?id=in.farmguide.farmerapp",
      isUrgent: countdown.urgency === "critical"
    },
    {
      id: "call-insurer",
      priority: 3,
      title: locale === "hi" ? `बीमा कंपनी हेल्पलाइन: ${insurer.tollFree}` : locale === "bn" ? `বিমা কোম্পানি হেল্পলাইন: ${insurer.tollFree}` : `Call Insurer: ${insurer.name}`,
      description: locale === "hi" 
        ? `${insurer.name} के टोल-फ्री नंबर ${insurer.tollFree} पर कॉल करके अपना टोकन नंबर बताएं और अपने गांव के लिए नियुक्त सर्वेक्षक (Loss Assessor) का नाम और नंबर मांगें।` 
        : locale === "bn" 
        ? `${insurer.name}-এর টোল-ফ্রি ${insurer.tollFree} নম্বরে ফোন করে টিকিট নম্বর জানান এবং আপনার ব্লকের জন্য নিযুক্ত সার্ভেয়ারের নাম ও যোগাযোগ নম্বর সংগ্রহ করুন।`
        : `Call empanelled insurer (${insurer.name}) at ${insurer.tollFree}. Quote your ticket number and request the contact details of your village Loss Assessor.`,
      actionType: "call" as const,
      actionValue: `tel:${insurer.tollFree.replace(/[^0-9]/g, "")}`,
      isUrgent: false
    },
    {
      id: "submit-letter",
      priority: 4,
      title: locale === "hi" ? "ज़िला कृषि अधिकारी (DAO) और बैंक को पत्र सौंपें" : locale === "bn" ? "জেলা কৃষি আধিকারিক ও ব্যাংকে আনুষ্ঠানিক চিঠি জমা দিন" : "Submit Formal Intimation to DAO & Bank",
      description: locale === "hi" 
        ? `नीचे तैयार किया गया आधिकारिक 72-घंटे का कानूनी पत्र प्रिंट करें। 1 प्रति DAO कार्यालय (${daoOffice.officeName}) और 1 प्रति अपनी बैंक शाखा में जमा करके सील-हस्ताक्षर वाली पावती (Receiving) अवश्य लें।` 
        : locale === "bn" 
        ? `নিচের তৈরি করা ৭২ ঘণ্টার আইনি চিঠি প্রিন্ট করুন। ১ কপি DAO দফতরে (${daoOffice.officeName}) এবং ১ কপি ব্যাংক শাখায় জমা দিয়ে রিসিভিং কপিতে স্বাক্ষর ও স্ট্যাম্প নিন।`
        : `Print the ready 72-hour statutory notice below. Submit 1 copy to the DAO Office (${daoOffice.officeName}) and 1 copy to your bank branch, securing a signed and stamped receiving acknowledgment.`,
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
