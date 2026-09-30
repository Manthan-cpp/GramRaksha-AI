import { FasalIncidentInput, FasalPhotoEvidence } from "./types";
import { formatCalamityName } from "./calculator";
import { EmpanelledInsurer } from "./insurer-directory";

interface LetterParams {
  incident: FasalIncidentInput;
  insurer: EmpanelledInsurer;
  daoOfficeName?: string;
  daoAddress?: string;
  photos?: FasalPhotoEvidence[];
  locale?: "en" | "hi" | "bn";
}

export function generateFasalIntimationLetter({
  incident,
  insurer,
  daoOfficeName,
  daoAddress,
  photos = [],
  locale = "en"
}: LetterParams): string {
  const incidentDateObj = new Date(incident.incidentTime);
  const formattedIncidentTime = !isNaN(incidentDateObj.getTime())
    ? incidentDateObj.toLocaleString(locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN", {
        dateStyle: "medium",
        timeStyle: "short"
      })
    : incident.incidentTime;

  const currentDate = new Date().toLocaleDateString(locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const calamity = formatCalamityName(incident.calamityType, locale);
  const defaultDaoName = daoOfficeName || `The District Agriculture Officer (DAO)`;
  const defaultDaoAddr = daoAddress || `District Agriculture Office, ${incident.district}, ${incident.state}`;

  if (locale === "hi") {
    return `दिनांक: ${currentDate}

सेवा में,
1. ज़िला कृषि अधिकारी (DAO)
   ${defaultDaoName}
   ${defaultDaoAddr}

2. अधिकृत नोडल अधिकारी / शाखा प्रबंधक
   ${insurer.name}
   टोल-फ्री हेल्पलाइन: ${insurer.tollFree}

विषय: प्रधानमंत्री फसल बीमा योजना (PMFBY) के अंतर्गत स्थानीयकृत आपदा (${calamity}) से फसल क्षति की अनिवार्य 72-घंटे की अग्रिम सूचना।

महोदय / महोदया,

मैं एतद्द्वारा सूचित करता हूँ कि मैं प्रधानमंत्री फसल बीमा योजना (PMFBY) के अंतर्गत एक बीमित किसान हूँ। मेरे खेत में अप्रत्याशित प्राकृतिक आपदा के कारण व्यापक फसल क्षति हुई है। PMFBY के संशोधित परिचालन दिशानिर्देशों (धारा 15.3 - स्थानीयकृत आपदाएं) के तहत, यह सूचना आपदा घटित होने के 72 घंटे की निर्धारित समय-सीमा के भीतर प्रेषित की जा रही है।

1. बीमित कृषक का विवरण:
   - कृषक का नाम: ${incident.farmerName}
   - संपर्क दूरभाष (मोबाइल): ${incident.farmerPhone || "उपलब्ध नहीं"}
   - ग्राम / पंचायत: ${incident.village}
   - ज़िला एवं राज्य: ${incident.district}, ${incident.state}
   - खसरा / सर्वे / खाता संख्या: ${incident.khasraNo || "राजस्व अभिलेख संलग्न"}
   - PMFBY आवेदन / पावती संख्या: ${incident.applicationNo || "प्रीमियम कटौती बैंक रसीद संलग्न"}
   - बैंक खाता / KCC संदर्भ: ${incident.bankAccountRef || "बैंक पासबुक संलग्न"}

2. आपदा एवं क्षति का विवरण:
   - प्राकृतिक आपदा का प्रकार: ${calamity}
   - घटना की तिथि एवं समय: ${formattedIncidentTime}
   - प्रभावित फसल का नाम: ${incident.crop}
   - कुल बीमित क्षेत्र: ${incident.areaAcres ? `${incident.areaAcres} एकड़` : "समस्त बीमित रकबा"}
   - अनुमानित फसल नुकसान: लगभग ${incident.lossPercentage}%
   - संलग्न डिजिटल साक्ष्य: ${photos.length > 0 ? `${photos.length} अदद टाइमस्टैम्प युक्त स्थानीय भू-संदर्भित छायाचित्र (Photos)` : "खेत के तात्कालिक छायाचित्र उपलब्ध"}

3. औपचारिक अनुरोध:
PMFBY दिशानिर्देशों के अनुसार, स्थानीयकृत आपदा की स्थिति में कृषि विभाग, राजस्व प्रशासन तथा संबंधित बीमा कंपनी के संयुक्त दल द्वारा अधिकतम 10 से 15 दिवस के भीतर मौके पर संयुक्त सर्वेक्षण (Joint Survey) किया जाना अनिवार्य है।

अतः आपसे सविनय निवेदन है कि इस तात्कालिक सूचना को आधिकारिक रूप से पंजीकृत करते हुए बीमा कंपनी के साथ तत्काल संयुक्त निरीक्षण दल गठित कर मेरे खेत का भौतिक सर्वेक्षण कराएं, ताकि नियमानुसार क्षतिपूर्ति की राशि स्वीकृत हो सके।

संलग्नक:
1. खेत में फसल क्षति के टाइमस्टैम्प युक्त छायाचित्र (${photos.length} फ़ोटो)
2. आधार कार्ड / पहचान पत्र की प्रति (निरीक्षण दल के समक्ष प्रस्तुत करने हेतु)
3. बैंक प्रीमियम डेबिट / PMFBY रसीद प्रति

भवदीय,
हस्ताक्षर: ________________________
नाम: ${incident.farmerName}
स्थान: ${incident.village}, ${incident.district}
मो.: ${incident.farmerPhone || ""}`;
  }

  if (locale === "bn") {
    return `তারিখ: ${currentDate}

প্রতি,
১. জেলা কৃষি আধিকারিক (DAO)
   ${defaultDaoName}
   ${defaultDaoAddr}

২. অনুমোদিত নোডাল আধিকারিক / শাখা ব্যবস্থাপক
   ${insurer.name}
   টোল-ফ্রি হেল্পলাইন: ${insurer.tollFree}

বিষয়: প্রধানমন্ত্রী ফসল বিমা যোজনা (PMFBY)-র অধীনে স্থানীয় প্রাকৃতিক দুর্যোগ (${calamity})-এ শস্য ক্ষতির বাধ্যতামূলক ৭২ ঘণ্টার পূর্ব নোটিশ।

মহাশয় / মহাশয়া,

আমি এতদ্বারা জানাচ্ছি যে আমি প্রধানমন্ত্রী ফসল বিমা যোজনার একজন নিবন্ধিত কৃষক। আমার জমিতে অনাকাঙ্ক্ষিত প্রাকৃতিক দুর্যোগের কারণে ফসলের ব্যাপক ক্ষয়ক্ষতি হয়েছে। PMFBY অপারেশনাল নির্দেশিকা (ধারা ১৫.৩ - স্থানীয় দুর্যোগ)-র অধীনে নির্ধারিত ৭২ ঘণ্টার নির্দিষ্ট সময়সীমার মধ্যে এই আনুষ্ঠানিক দাবি পেশ করা হচ্ছে।

১. বিমাকৃত কৃষকের বিবরণ:
   - কৃষকের নাম: ${incident.farmerName}
   - মোবাইল নম্বর: ${incident.farmerPhone || "প্রযোজ্য"}
   - গ্রাম / পঞ্চায়েত: ${incident.village}
   - জেলা ও রাজ্য: ${incident.district}, ${incident.state}
   - খতিয়ান / দাগ / খসরা নম্বর: ${incident.khasraNo || "সংযুক্ত নথিপত্র অনুযায়ী"}
   - PMFBY আবেদন / রসিদ নং: ${incident.applicationNo || "ব্যাংক প্রিমিয়াম ডেবিট রসিদ সংযুক্ত"}
   - ব্যাংক অ্যাকাউন্ট / KCC বিবরণ: ${incident.bankAccountRef || "ব্যাংক পাসবই কপি"}

২. দুর্যোগ ও শস্য ক্ষতির বিবরণ:
   - প্রাকৃতিক দুর্যোগের ধরন: ${calamity}
   - ঘটনা সংঘটিত হওয়ার তারিখ ও সময়: ${formattedIncidentTime}
   - ক্ষতিগ্রস্ত শস্যের নাম: ${incident.crop}
   - জমির মোট পরিমাণ: ${incident.areaAcres ? `${incident.areaAcres} একর` : "সম্পূর্ণ জমি"}
   - আনুমানিক ক্ষয়ক্ষতির হার: প্রায় ${incident.lossPercentage}%
   - সংরক্ষিত ডিজিটাল প্রমাণ: ${photos.length > 0 ? `${photos.length}টি টাইমস্ট্যাম্পযুক্ত ফসলের ছবি সংরক্ষিত` : "জমির ছবি সংরক্ষিত"}

৩. জরুরি আবেদন:
PMFBY সরকারি নির্দেশিকা অনুসারে, স্থানীয় প্রাকৃতিক বিপর্যয়ের ক্ষেত্রে কৃষি দপ্তর, রাজস্ব বিভাগ এবং সংশ্লিষ্ট বিমা কোম্পানির যৌথ কমিটির মাধ্যমে অবিলম্বে স্পট সার্ভে (Joint Loss Assessment Survey) পরিচালনা করা বাধ্যতামূলক।

অতএব আপনার নিকট বিনীত প্রার্থনা, এই আবেদনপত্রটি গ্রহণ করে অবিলম্বে যৌথ পরিদর্শনের ব্যবস্থা গ্রহণ করুন এবং আমাকে দ্রুত ক্ষতিপূরণ প্রদানের প্রয়োজনীয় পদক্ষেপ গ্রহণ করে বাধিত করবেন।

সংযুক্তি:
১. ক্ষতিগ্রস্ত ফসলের টাইমস্ট্যাম্পযুক্ত ছবি (${photos.length}টি)
২. বিমা প্রিমিয়াম জমার রসিদ / পাসবই কপি

বিনীত,
স্বাক্ষর: ________________________
নাম: ${incident.farmerName}
গ্রাম: ${incident.village}, জেলা: ${incident.district}
মোবাইল: ${incident.farmerPhone || ""}`;
  }

  // Default: English
  return `Date: ${currentDate}

To:
1. The District Agriculture Officer (DAO)
   ${defaultDaoName}
   ${defaultDaoAddr}

2. The Authorized Claims Officer / Branch Manager
   ${insurer.name}
   Toll-Free Helpline: ${insurer.tollFree}

SUBJECT: URGENT INTIMATION OF LOCALIZED CROP LOSS UNDER PMFBY (STATUTORY 72-HOUR NOTICE)

Respected Sir / Madam,

I am an insured farmer under the Pradhan Mantri Fasal Bima Yojana (PMFBY). My standing/harvested crop has suffered severe damage due to an unforeseen localized natural calamity (${calamity}). Pursuant to Clause 15.3 of the PMFBY Revised Operational Guidelines (Localized Calamities), this formal intimation is submitted within the mandatory 72-hour window from the occurrence of the incident.

1. Insured Farmer Particulars:
   - Farmer Name: ${incident.farmerName}
   - Contact Mobile: ${incident.farmerPhone || "Available on file"}
   - Village / Gram Panchayat: ${incident.village}
   - District & State: ${incident.district}, ${incident.state}
   - Land Parcel / Khasra / Survey No.: ${incident.khasraNo || "As per revenue records"}
   - PMFBY Policy / Application No.: ${incident.applicationNo || "Premium deduction slip attached"}
   - Bank A/C / KCC Reference: ${incident.bankAccountRef || "Bank passbook copy attached"}

2. Calamity & Crop Loss Details:
   - Nature of Calamity: ${calamity}
   - Date & Time of Occurrence: ${formattedIncidentTime}
   - Affected Crop: ${incident.crop}
   - Insured Cultivated Area: ${incident.areaAcres ? `${incident.areaAcres} Acres` : "Total insured parcel"}
   - Estimated Crop Loss: Approximately ${incident.lossPercentage}%
   - Attached Evidence: ${photos.length > 0 ? `${photos.length} geotagged / timestamped damage photograph(s)` : "Field photographs captured"}

3. Formal Relief Request:
In accordance with PMFBY statutory provisions, localized losses require the immediate deputation of a Joint Loss Assessment Committee (comprising officials from the District Agriculture Department, Revenue Department, and the Insurer) within 10 to 15 days of intimation.

I respectfully request you to formally log this claim intimation, conduct an urgent joint spot survey of the affected fields, and sanction the admissible crop loss compensation at the earliest.

Enclosures:
1. Timestamped on-field crop damage photographs (${photos.length} items)
2. Copy of Bank Premium Debit / PMFBY Insurance acknowledgment slip
3. Copy of Land Revenue / RoR record

Yours faithfully,

Signature: ________________________
Name: ${incident.farmerName}
Location: ${incident.village}, ${incident.district}
Phone: ${incident.farmerPhone || ""}`;
}
