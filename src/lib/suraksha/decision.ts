import {
  SurakshaDecisionSchema,
  type Evidence,
  type EvidenceMetrics,
  type SurakshaDecision,
  type SurakshaEvidenceRequest,
  type SurakshaPatternMatch
} from "@/lib/schemas";
import { analyzeSuspiciousText } from "@/lib/suraksha/patterns";

export function buildSurakshaDecision(
  input: SurakshaEvidenceRequest,
  evidence: Evidence[],
  _metrics: EvidenceMetrics,
  _warnings: string[],
  locale: "en" | "hi" | "bn" = "en"
): SurakshaDecision {
  const analysis = analyzeSuspiciousText(input.content);
  const patterns: SurakshaPatternMatch[] = [...analysis.patterns];

  // Cross-reference SerpApi news/evidence for police scam alerts
  const newsScamEvidence = evidence.find(
    (e) =>
      e.engine === "google_news" &&
      /\b(?:scam|fraud|fake|arrest|alert|warning|cyber|advisory|police)\b/i.test(`${e.title} ${e.snippet}`)
  );

  if (newsScamEvidence && !patterns.some((p) => p.id === "reported_advisory")) {
    patterns.push({
      id: "reported_advisory",
      severity: "warning",
      title: "Public Cyber Advisory Corroborated",
      description: "Matches patterns reported in official public advisories as fraudulent.",
      matchedText: newsScamEvidence.title
    });
  }

  // Determine verdict & risk score
  let verdict: "danger" | "caution" | "safe" = "caution";
  let riskScore = analysis.riskScore;

  if (analysis.isScamDetected || patterns.some((p) => p.severity === "critical")) {
    verdict = "danger";
    riskScore = Math.max(78, riskScore);
  } else if (analysis.isOfficialVerified && patterns.length <= 1) {
    verdict = "safe";
    riskScore = Math.min(10, riskScore);
  } else {
    verdict = "caution";
    riskScore = Math.min(65, Math.max(30, riskScore));
  }

  const schemeName =
    analysis.extractedScheme || input.appName || (locale === "hi" ? "सरकारी योजना" : locale === "bn" ? "সরকারি প্রকল্প" : "Government Scheme");

  // Official portal identification
  const officialSource = evidence.find((e) => e.trust === "official" || e.url.includes(".gov.in") || e.url.includes(".nic.in"));
  const officialUrl = officialSource?.url || (analysis.extractedScheme ? "https://pmkisan.gov.in" : "https://sancharsaathi.gov.in");

  // Play Store status
  const playEvidence = evidence.find((e) => e.engine === "google_play" || e.url.includes("play.google.com"));
  let playStoreStatus = "Untrusted sideloading risk: Not a verified Google Play Store application.";
  if (locale === "hi") {
    playStoreStatus = playEvidence
      ? `गूगल प्ले स्टोर पर आधिकारिक प्रकाशक (NIC/मंत्रालय) से ही डाउनलोड करें।`
      : `असुरक्षित एपीके (.apk): यह आधिकारिक गूगल प्ले स्टोर पर सत्यापित नहीं है।`;
  } else if (locale === "bn") {
    playStoreStatus = playEvidence
      ? `গুগল প্লে স্টোরে অফিসিয়াল প্রকাশক (NIC/মন্ত্রক) থেকে ডাউনলোড করুন।`
      : `অবিশ্বস্ত এপিকে (.apk): এটি গুগল প্লে স্টোরে যাচাইকৃত নয়।`;
  } else {
    playStoreStatus = playEvidence
      ? `Always verify official publisher (National Informatics Centre) on Google Play.`
      : `Untrusted sideloading risk: Sideloading .apk files outside Google Play is dangerous.`;
  }

  // Content synthesis by locale
  let headline = "";
  let summary = "";
  let speechSummary = "";
  let warningMessage = "";
  let officialGuidance = "";

  if (locale === "hi") {
    if (verdict === "danger") {
      headline = "उच्च जोखिम: संदिग्ध धोखाधड़ी या अनधिकृत ऐप के संकेत";
      summary = `यह संदेश आधिकारिक साइबर सुरक्षा परामर्शों में रिपोर्ट किए गए धोखाधड़ी के पैटर्न से मेल खाता है। ${schemeName} या कोई भी सरकारी योजना कभी भी व्हाट्सएप पर .apk फाइल नहीं भेजती और न ही कोई अग्रिम पंजीकरण शुल्क मांगती है।`;
      speechSummary = `सावधान। इस संदेश में साइबर धोखाधड़ी के गंभीर संकेत हैं। सरकारी योजनाएं कभी भी व्हाट्सएप पर एपीके फाइल नहीं भेजतीं और न ही पैसे मांगती हैं। किसी लिंक पर क्लिक न करें और न ही ओटीपी साझा करें।`;
    } else if (verdict === "safe") {
      headline = "सत्यापित आधिकारिक सरकारी स्रोत";
      summary = `यह लिंक या संदेश एक प्रामाणिक भारतीय सरकारी पोर्टल (.gov.in या .nic.in) से संबंधित प्रतीत होता है।`;
      speechSummary = `यह लिंक एक आधिकारिक सरकारी वेबसाइट से संबंधित है। किसी भी कार्य के लिए हमेशा केवल सरकारी पोर्टल का ही उपयोग करें।`;
    } else {
      headline = "सतर्कता आवश्यक: असत्यापित संदेश";
      summary = `इस संदेश के स्रोत की पुष्टि नहीं हो सकी है। किसी भी सरकारी योजना का लाभ लेने से पहले आधिकारिक वेबसाइट पर अवश्य जांचें।`;
      speechSummary = `ध्यान दें। इस संदेश की पूरी पुष्टि नहीं हो सकी है। किसी भी अनजान नंबर पर पैसे न भेजें और न ही ऐप डाउनलोड करें।`;
    }

    officialGuidance = `सरकारी कल्याणकारी योजनाओं के लिए कोई अग्रिम शुल्क नहीं लगता। संदिग्ध संदेशों की तुरंत चक्षु पोर्टल (sancharsaathi.gov.in) पर रिपोर्ट करें या साइबर हेल्पलाइन 1930 पर संपर्क करें।`;

    warningMessage = `🚨 *ग्राम रक्षा साइबर सुरक्षा चेतावनी*\n\n⚠️ *सतर्क रहें*: "${schemeName}" के नाम पर एक संदिग्ध संदेश मिला है।\n\n• *धोखाधड़ी के संकेत*: सरकार कभी भी व्हाट्सएप पर ऐप (.apk) डाउनलोड करने या पंजीकरण शुल्क देने को नहीं कहती।\n• *सच्चाई*: सभी सरकारी योजनाएं पूरी तरह निःशुल्क हैं।\n• *क्या करें*: किसी लिंक पर क्लिक न करें, न ही ओटीपी दें।\n• *शिकायत*: संचार साथी के चक्षु (sancharsaathi.gov.in) पर रिपोर्ट करें या 1930 पर कॉल करें।\n\n- ग्राम रक्षा जन-जागरूकता`;
  } else if (locale === "bn") {
    if (verdict === "danger") {
      headline = "উচ্চ ঝুঁকি: প্রতারণামূলক বার্তা বা অনিবন্ধিত অ্যাপের লক্ষণ";
      summary = `এই বার্তাটি অফিসিয়াল সাইবার সুরক্ষা সতর্কবার্তায় রিপোর্ট করা প্রতারণার ধরনের সাথে মেলে। ${schemeName} বা কোনো সরকারি প্রকল্প কখনই হোয়াটসঅ্যাপে .apk ফাইল পাঠায় না বা কোনো অগ্রিম ফি দাবি করে না।`;
      speechSummary = `সাবধান। এই বার্তায় সাইবার প্রতারণার গুরুতর লক্ষণ রয়েছে। সরকারি প্রকল্প কখনও হোয়াটসঅ্যাপে এপিকে ফাইল পাঠায় না বা টাকা চায় না। কোনো লিঙ্কে ক্লিক করবেন না এবং ওটিপি শেয়ার করবেন না।`;
    } else if (verdict === "safe") {
      headline = "যাচাইকৃত অফিসিয়াল সরকারি উৎস";
      summary = `এই লিঙ্ক বা বার্তাটি একটি খাঁটি ভারতীয় সরকারি পোর্টাল (.gov.in বা .nic.in) এর সাথে সম্পর্কিত।`;
      speechSummary = `এই লিঙ্কটি একটি অফিসিয়াল সরকারি ওয়েবসাইটের সাথে সম্পর্কিত। সর্বদা সরকারি পোর্টাল ব্যবহার করুন।`;
    } else {
      headline = "সতর্কতা প্রয়োজন: অযাচাইকৃত বার্তা";
      summary = `এই বার্তার উৎসের নির্ভরযোগ্যতা নিশ্চিত করা যায়নি। কোনো পদক্ষেপে যাওয়ার আগে অফিসিয়াল পোর্টালে যাচাই করুন।`;
      speechSummary = `মনোযোগ দিন। এই বার্তার সত্যতা নিশ্চিত করা যায়নি। কোনো অপরিচিত নম্বরে টাকা পাঠাবেন না এবং কোনো অ্যাপ ইনস্টল করবেন না।`;
    }

    officialGuidance = `সরকারি কল্যাণমূলক প্রকল্পের জন্য কোনো অগ্রিম ফি নেওয়া হয় না। অবিলম্বে চক্ষু পোর্টাল (sancharsaathi.gov.in) বা সাইবার হেল্পলাইন ১৯৩০ নম্বরে রিপোর্ট করুন।`;

    warningMessage = `🚨 *গ্রাম রক্ষা সাইবার নিরাপত্তা সতর্কতা*\n\n⚠️ *সাবধান*: "${schemeName}" সংক্রান্ত একটি সন্দেহজনক বার্তা পাওয়া গেছে।\n\n• *বিপদের লক্ষণ*: সরকার কখনই হোয়াটসঅ্যাপে অ্যাপ (.apk) ডাউনলোড করতে বলে না বা টাকা চায় না।\n• *বাস্তবতা*: সরকারি প্রকল্প সম্পূর্ণ বিনামূল্যে পাওয়া যায়।\n• *করণীয়*: কোনো লিঙ্কে ক্লিক করবেন না এবং ওটিপি দেবেন না।\n• *অভিযোগ*: চক্ষু (sancharsaathi.gov.in) অথবা ১৯৩০ নম্বরে কল করুন।\n\n- গ্রাম রক্ষা জনসচেতনতা`;
  } else {
    // English
    if (verdict === "danger") {
      headline = "High Risk: Fraudulent Scheme / Unverified APK Detected";
      summary = `This message matches patterns reported in official public cyber advisories as fraudulent. Official welfare schemes (including ${schemeName}) never demand registration fees, request OTPs, or distribute raw .apk installer files over WhatsApp.`;
      speechSummary = `Warning. This message shows high risk signs of cyber fraud. Government schemes never distribute APK files or charge fees over WhatsApp. Do not click links, share OTPs, or send money.`;
    } else if (verdict === "safe") {
      headline = "Authentic Official Government Source";
      summary = `This address corresponds to a legitimate Indian Government (.gov.in or .nic.in) portal. Always verify that the browser address bar shows the exact official domain.`;
      speechSummary = `This link points to an official government website. Always use genuine government portals for public schemes.`;
    } else {
      headline = "Caution Required: Unverified Message";
      summary = `The authenticity of this message could not be verified against official databases. Exercise caution and do not transfer funds or install third-party files.`;
      speechSummary = `Caution required. This message cannot be fully verified. Do not share OTPs, pay fees, or install unverified files.`;
    }

    officialGuidance = `Welfare scheme enrollments are 100% free under Indian law. Suspicious calls, SMS, and WhatsApp messages should be reported immediately on the Chakshu facility at sancharsaathi.gov.in or the 1930 Cybercrime Helpline.`;

    warningMessage = `🚨 *GRAM RAKSHA CYBER ALERT*\n\n⚠️ *Caution*: A suspicious message regarding "${schemeName}" is circulating.\n\n• *Red Flags*: Government schemes NEVER demand advance registration fees or send .apk files on WhatsApp.\n• *Fact*: All official benefits are completely free.\n• *Action*: Do not click links or share OTPs.\n• *Report*: File a report on Chakshu (sancharsaathi.gov.in) or call 1930 immediately.\n\n- Gram Raksha Public Advisory`;
  }

  // Redressal routes
  const redressalRoutes = [
    {
      name:
        locale === "hi"
          ? "चक्षु - संदिग्ध कॉल व संदेश रिपोर्टिंग (संचार साथी)"
          : locale === "bn"
            ? "চক্ষু - সন্দেহজনক কল ও বার্তা রিপোর্টিং (সঞ্চার সাথী)"
            : "Chakshu Facility (Sanchar Saathi Portal)",
      action:
        locale === "hi"
          ? "वित्तीय नुकसान होने से पहले संदिग्ध व्हाट्सएप या एसएमएस की तुरंत रिपोर्ट करें"
          : locale === "bn"
            ? "টাকা খোয়ানোর আগেই সন্দেহজনক বার্তা বা হোয়াটসঅ্যাপের রিপোর্ট করুন"
            : "Report suspected fraudulent SMS, WhatsApp or calls before financial loss occurs",
      url: "https://sancharsaathi.gov.in/sfc/",
      type: "chakshu" as const
    },
    {
      name:
        locale === "hi"
          ? "राष्ट्रीय साइबर अपराध हेल्पलाइन (1930)"
          : locale === "bn"
            ? "জাতীয় সাইবার অপরাধ হেল্পলাইন (১৯৩০)"
            : "National Cybercrime Helpline (1930)",
      action:
        locale === "hi"
          ? "यदि पैसे कट गए हैं, तो बैंक खाता फ्रीज कराने के लिए तुरंत 1930 डायल करें"
          : locale === "bn"
            ? "টাকা কেটে নেওয়া হলে ব্যাংক অ্যাকাউন্ট সুরক্ষিত করতে তৎক্ষণাৎ ১৯৩০ ডায়াল করুন"
            : "Call 1930 immediately within golden hours to freeze unauthorized bank debits",
      phone: "1930",
      url: "https://cybercrime.gov.in",
      type: "cybercrime" as const
    },
    {
      name:
        locale === "hi"
          ? "पीआईबी फैक्ट चेक एवं आधिकारिक पोर्टल"
          : locale === "bn"
            ? "পিআইবি ফ্যাক্ট-চেক ও অফিসিয়াল পোর্টাল"
            : "PIB Fact Check & Official Portals",
      action:
        locale === "hi"
          ? "भारत सरकार द्वारा योजनाओं की आधिकारिक घोषणाएं सत्यापित करें"
          : locale === "bn"
            ? "ভারত সরকার কর্তৃক প্রকল্পের সত্যতা যাচাই করুন"
            : "Verify official Government of India announcements and scheme guidelines",
      phone: "+91 87997 11259",
      url: "https://factcheck.pib.gov.in",
      type: "official" as const
    }
  ];

  // Localized UI Labels
  const labels: Record<string, string> =
    locale === "hi"
      ? {
          tabVerdict: "निर्णय एवं सुरक्षा विश्लेषण",
          tabSources: "सत्यापित स्रोत एवं तथ्य जांच",
          tabRedressal: "शिकायत एवं समाधान (चक्षु / 1930)",
          tabVillageCard: "ग्राम सुरक्षा चेतावनी कार्ड",
          riskScore: "जोखिम स्कोर",
          officialCheck: "सरकारी तथ्य-जांच",
          freeSchemeBadge: "100% निःशुल्क सरकारी योजना",
          speechPlay: "सुरक्षा सलाह सुनें",
          speechStop: "ऑडियो रोकें",
          copyWarning: "चेतावनी संदेश कॉपी करें",
          copied: "कॉपी हो गया!",
          shareWhatsApp: "व्हाट्सएप ग्रुप पर साझा करें",
          reportChakshu: "चक्षु पर रिपोर्ट करें",
          call1930: "1930 पर कॉल करें",
          serpApiNote: "सर्प एपीआई (Serp API) द्वारा लाइव सत्यापित"
        }
      : locale === "bn"
        ? {
            tabVerdict: "রায় এবং নিরাপত্তা বিশ্লেষণ",
            tabSources: "যাচাইকৃত তথ্য ও ফ্যাক্ট-চেক",
            tabRedressal: "অভিযোগ ও প্রতিকার (চক্ষু / ১৯৩০)",
            tabVillageCard: "গ্রাম সুরক্ষা সতর্কতা কার্ড",
            riskScore: "ঝুঁকি স্কোর",
            officialCheck: "সরকারি ফ্যাক্ট-চেক",
            freeSchemeBadge: "১০০% বিনামূল্যে সরকারি প্রকল্প",
            speechPlay: "নিরাপত্তা পরামর্শ শুনুন",
            speechStop: "অডিও বন্ধ করুন",
            copyWarning: "সতর্কতা বার্তা কপি করুন",
            copied: "কপি সম্পন্ন!",
            shareWhatsApp: "হোয়াটসঅ্যাপ গ্রুপে শেয়ার করুন",
            reportChakshu: "চক্ষুতে রিপোর্ট করুন",
            call1930: "১৯৩০ এ কল করুন",
            serpApiNote: "সার্প এপিআই (Serp API) দ্বারা লাইভ যাচাইকৃত"
          }
        : {
            tabVerdict: "Verdict & Threat Analysis",
            tabSources: "Verified Sources & Fact Check",
            tabRedressal: "Report & Redressal (Chakshu / 1930)",
            tabVillageCard: "Village Warning Card",
            riskScore: "Risk Score",
            officialCheck: "Official Fact-Check",
            freeSchemeBadge: "100% Free Welfare Scheme",
            speechPlay: "Listen to Safety Advisory",
            speechStop: "Stop Audio",
            copyWarning: "Copy Warning Message",
            copied: "Copied!",
            shareWhatsApp: "Share to Village WhatsApp Group",
            reportChakshu: "Report on Chakshu",
            call1930: "Call 1930",
            serpApiNote: "Live-verified via Serp API"
          };

  return SurakshaDecisionSchema.parse({
    verdict,
    riskScore,
    headline,
    summary,
    speechSummary,
    patterns,
    officialFactCheck: {
      schemeName,
      officialUrl,
      isAlwaysFree: true,
      playStoreStatus,
      officialGuidance
    },
    redressalRoutes,
    warningMessage,
    labels
  });
}
