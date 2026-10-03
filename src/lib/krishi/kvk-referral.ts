/**
 * Official Krishi Vigyan Kendra (KVK) Expert Referral Engine
 * 
 * Safely bridges GramRaksha AI's zero-diagnosis safety mandate with human agronomists.
 * Packages verified field coordinates, crop growth stage, observed symptoms, and mandi price
 * into a standardized ICAR/KVK referral slip and WhatsApp broadcast.
 */

export interface KvkReferralParams {
  farmerName?: string;
  farmerPhone?: string;
  village?: string;
  district: string;
  state?: string;
  crop: string;
  growthStage: string;
  symptomsOrConcern: string;
  mandiPriceSummary?: string;
  weatherSummary?: string;
  kvkCenterName?: string;
  kvkPhone?: string;
  locale?: "en" | "hi" | "bn";
}

export function generateKvkReferralSlip(params: KvkReferralParams): string {
  const locale = params.locale || "en";
  const dateStr = new Date().toLocaleDateString(locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  const stateStr = params.state ? `, ${params.state}` : "";
  const villageStr = params.village ? `${params.village}, ` : "";
  const kvkName = params.kvkCenterName || `Krishi Vigyan Kendra (ICAR), ${params.district}`;
  const kvkPhone = params.kvkPhone || "1800-180-1551 (Kisan Call Centre)";

  if (locale === "hi") {
    return `भारतीय कृषि अनुसंधान परिषद (ICAR) - कृषि विज्ञान केंद्र (KVK)
विशेषज्ञ निदान एवं परामर्श रेफरल पर्ची (Agricultural Expert Referral Slip)
--------------------------------------------------------------------------------
दिनांक: ${dateStr}
रेफरल संख्या: KVK-REF-${params.district.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}

१. किसान एवं प्रक्षेत्र विवरण (Farmer & Field Details):
   किसान का नाम: ${params.farmerName || "प्रगतिशील किसान"}
   संपर्क नंबर: ${params.farmerPhone || "उपलब्ध नहीं"}
   ग्राम / विकासखंड: ${villageStr}${params.district}${stateStr}
   फसल का नाम: ${params.crop}
   फसल की वर्तमान अवस्था (Growth Stage): ${params.growthStage}

२. प्रक्षेत्र में दर्ज समस्या एवं लक्षण (Field Symptoms Observed):
   लक्षण / किसान की चिंता: "${params.symptomsOrConcern}"
   ${params.mandiPriceSummary ? `वर्तमान मंडी भाव: ${params.mandiPriceSummary}` : ""}
   ${params.weatherSummary ? `स्थानीय मौसम पूर्वानुमान: ${params.weatherSummary}` : ""}

३. ग्रामरक्षा एआई सुरक्षा अधिदेश (GramRaksha AI Safety Mandate):
   "ग्रामरक्षा एआई किसी भी प्रकार के रासायनिक कीटनाशक या फफूंदनाशक की अनधिकृत सिफारिश नहीं करता है। यह पर्ची किसान के प्रक्षेत्र के प्रमाणित आंकड़ों को संकलित कर कृषि विज्ञान केंद्र (KVK) के वैज्ञानिकों को प्रत्यक्ष परामर्श हेतु प्रस्तुत करती है।"

४. प्रेषित केंद्र (Referred To):
   केंद्र: ${kvkName}
   हेल्पलाइन: ${kvkPhone}
   राष्ट्रीय किसान कॉल सेंटर: 1800-180-1551 (टोल-फ्री, प्रातः 6 बजे से रात 10 बजे तक)

--------------------------------------------------------------------------------
(कृषि वैज्ञानिक / विशेषज्ञ के हस्ताक्षर एवं संस्तुति)
हस्ताक्षर: ___________________________   मुहर: ___________________________`;
  }

  if (locale === "bn") {
    return `ভারতীয় কৃষি অনুসন্ধান পরিষদ (ICAR) - কৃষি বিজ্ঞান কেন্দ্র (KVK)
কৃষি বিশেষজ্ঞ রেফারেল স্লিপ (Agricultural Expert Referral Slip)
--------------------------------------------------------------------------------
তারিখ: ${dateStr}
রেফারেল নং: KVK-REF-${params.district.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}

১. কৃষক ও জমির বিবরণ (Farmer & Field Details):
   কৃষকের নাম: ${params.farmerName || "স্থানীয় কৃষক"}
   ফোন নম্বর: ${params.farmerPhone || "প্রযোজ্য নয়"}
   গ্রাম / ব্লক: ${villageStr}${params.district}${stateStr}
   ফসলের নাম: ${params.crop}
   ফসলের বৃদ্ধি পর্যায় (Growth Stage): ${params.growthStage}

২. জমিতে দেখা দেওয়া সমস্যা ও লক্ষণ (Field Symptoms):
   সমস্যা / লক্ষণ: "${params.symptomsOrConcern}"
   ${params.mandiPriceSummary ? `বর্তমান বাজার দর: ${params.mandiPriceSummary}` : ""}
   ${params.weatherSummary ? `আবহাওয়া পূর্বাভাস: ${params.weatherSummary}` : ""}

৩. গ্রামরক্ষা এআই নিরাপত্তা গ্যারান্টি (Safety Guarantee):
   "গ্রামরক্ষা এআই নিজে থেকে ক্ষতিকারক কীটনাশক সুপারিশ করে না। এই স্লিপটি বৈজ্ঞানিক পর্যালোচনার জন্য কৃষকের মাঠ পর্যায়ের তথ্য সংগ্রহ করে নিকটস্থ কৃষি বিজ্ঞান কেন্দ্র (KVK)-এ উপস্থাপনের জন্য তৈরি।"

৪. রেফারেল কেন্দ্র (Referred To):
   কেন্দ্র: ${kvkName}
   হেল্পলাইন: ${kvkPhone}
   কিষাণ কল সেন্টার: ১৮০০-১৮০-১৫৫১ (টোল-ফ্রি)

--------------------------------------------------------------------------------
(কেভিকে কৃষি বিশেষজ্ঞের স্বাক্ষর ও সীলমোহর)
স্বাক্ষর: ___________________________   সীল: ___________________________`;
  }

  return `ICAR - KRISHI VIGYAN KENDRA (KVK) EXPERT REFERRAL SLIP
Standardized Farmer Agronomic Consultation Docket
--------------------------------------------------------------------------------
Date: ${dateStr}
Referral ID: KVK-REF-${params.district.toUpperCase().slice(0, 3)}-${Date.now().toString().slice(-6)}

1. FARMER & FIELD PROFILE:
   Farmer Name: ${params.farmerName || "Local Cultivator"}
   Phone / WhatsApp: ${params.farmerPhone || "On File"}
   Location: ${villageStr}${params.district}${stateStr}
   Target Crop: ${params.crop}
   Growth Stage: ${params.growthStage}

2. RECORDED FIELD ANOMALY / SYMPTOMS:
   Reported Concern: "${params.symptomsOrConcern}"
   ${params.mandiPriceSummary ? `Local APMC Mandi Modal Price: ${params.mandiPriceSummary}` : ""}
   ${params.weatherSummary ? `Agromet Weather Context: ${params.weatherSummary}` : ""}

3. STATUTORY SAFETY MANDATE:
   "GramRaksha AI maintains a strict zero-diagnosis safety mandate: it never prescribes synthetic pesticides or chemical compounds autonomously. This referral docket packages structured field observations directly for certified agronomy scientists at the District Krishi Vigyan Kendra (KVK) and Indian Council of Agricultural Research (ICAR)."

4. DESIGNATED KVK CONSULTATION CENTER:
   Assigned Center: ${kvkName}
   KVK Helpline: ${kvkPhone}
   National Kisan Call Centre: 1800-180-1551 (Toll-Free, 6:00 AM - 10:00 PM)

--------------------------------------------------------------------------------
(For use by KVK Agronomist / Subject Matter Specialist)
Scientist Signature: ______________________    Official Seal: ______________________`;
}

export function generateKvkWhatsAppText(params: KvkReferralParams): string {
  const loc = `${params.village ? `${params.village}, ` : ""}${params.district}${params.state ? `, ${params.state}` : ""}`;
  return `*🌾 KRISHI VIGYAN KENDRA (KVK) EXPERT CONSULTATION REQUEST*\n\n` +
    `👨‍🌾 *Farmer:* ${params.farmerName || "Cultivator"}\n` +
    `📍 *Location:* ${loc}\n` +
    `🌱 *Crop & Stage:* ${params.crop} (${params.growthStage})\n` +
    `🔍 *Observed Symptoms / Query:* "${params.symptomsOrConcern}"\n` +
    (params.mandiPriceSummary ? `💰 *Mandi Modal Rate:* ${params.mandiPriceSummary}\n` : "") +
    `\n_Sent via GramRaksha AI KVK Referral Desk. Please review and provide certified ICAR guidance._`;
}
