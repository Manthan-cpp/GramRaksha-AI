import type { SurakshaPatternMatch } from "@/lib/schemas";

export interface PatternAnalysisResult {
  isScamDetected: boolean;
  isOfficialVerified: boolean;
  riskScore: number;
  patterns: SurakshaPatternMatch[];
  extractedScheme?: string;
  extractedApk?: string;
  extractedUrl?: string;
}

const SCHEME_KEYWORDS = [
  { key: "pmkisan", name: "PM-Kisan Samman Nidhi", officialUrl: "https://pmkisan.gov.in" },
  { key: "pm-kisan", name: "PM-Kisan Samman Nidhi", officialUrl: "https://pmkisan.gov.in" },
  { key: "pm kisan", name: "PM-Kisan Samman Nidhi", officialUrl: "https://pmkisan.gov.in" },
  { key: "fasal bima", name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", officialUrl: "https://pmfby.gov.in" },
  { key: "pmfby", name: "Pradhan Mantri Fasal Bima Yojana (PMFBY)", officialUrl: "https://pmfby.gov.in" },
  { key: "ayushman", name: "Ayushman Bharat PM-JAY", officialUrl: "https://pmjay.gov.in" },
  { key: "pmjay", name: "Ayushman Bharat PM-JAY", officialUrl: "https://pmjay.gov.in" },
  { key: "bijli", name: "Electricity Board Bill Payment", officialUrl: "https://nationalportal.gov.in" },
  { key: "electricity", name: "State Electricity Board", officialUrl: "https://nationalportal.gov.in" },
  { key: "tractor", name: "Kisan Tractor Subsidy Scheme", officialUrl: "https://agricoop.nic.in" },
  { key: "solar", name: "PM-KUSUM Solar Pump Scheme", officialUrl: "https://pmkusum.mnre.gov.in" },
  { key: "kusum", name: "PM-KUSUM Solar Pump Scheme", officialUrl: "https://pmkusum.mnre.gov.in" },
  { key: "ration", name: "NFSA Ration Card Scheme", officialUrl: "https://nfsa.gov.in" },
  { key: "aadhaar", name: "UIDAI Aadhaar Services", officialUrl: "https://uidai.gov.in" }
];

export function analyzeSuspiciousText(text: string): PatternAnalysisResult {
  const normalized = text.normalize("NFKC").trim();
  const lower = normalized.toLowerCase();
  const patterns: SurakshaPatternMatch[] = [];

  let extractedScheme: string | undefined;
  let extractedApk: string | undefined;
  let extractedUrl: string | undefined;

  for (const item of SCHEME_KEYWORDS) {
    if (lower.includes(item.key)) {
      extractedScheme = item.name;
      break;
    }
  }

  const apkMatch = normalized.match(/[\w\-.]+\.apk\b/i) ||
    normalized.match(/\b(?:download|install|claim)\b.{0,40}\b(?:apk|app|file)\b/i) ||
    (lower.includes(".apk") ? [".apk"] : null);

  if (apkMatch) {
    extractedApk = Array.isArray(apkMatch) && apkMatch[0] ? apkMatch[0] : "Rogue Android APK";
    patterns.push({
      id: "apk_file",
      severity: "critical",
      title: "Untrusted Android APK File (.apk)",
      description: "Government departments and official schemes NEVER distribute Android apps as raw .apk downloads over WhatsApp or SMS. Sideloading such files allows spyware to capture SMS, OTPs, and bank credentials.",
      matchedText: String(Array.isArray(apkMatch) && apkMatch[0] ? apkMatch[0] : ".apk")
    });
  }

  const urlMatches = normalized.match(/https?:\/\/[^\s/$.?#].[^\s]*/gi) ||
    normalized.match(/(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi);

  let isOfficialDomain = false;

  if (urlMatches && urlMatches.length > 0) {
    extractedUrl = urlMatches[0];
    const candidateUrl = extractedUrl.toLowerCase();

    if (candidateUrl.includes(".gov.in") || candidateUrl.includes(".nic.in")) {
      isOfficialDomain = true;
    } else {
      const suspiciousTlds = [".online", ".site", ".top", ".xyz", ".club", ".info", ".click", ".vip", ".in.net", ".org.in", ".co.in"];
      const containsScheme = SCHEME_KEYWORDS.some((s) => candidateUrl.includes(s.key));
      const hasSuspiciousTld = suspiciousTlds.some((tld) => candidateUrl.includes(tld));
      const isShortener = candidateUrl.includes("bit.ly") || candidateUrl.includes("tinyurl.com") || candidateUrl.includes("t.me");

      if (containsScheme && (hasSuspiciousTld || isShortener || !isOfficialDomain)) {
        patterns.push({
          id: "fake_gov_domain",
          severity: "critical",
          title: "Fake Government Phishing Domain",
          description: `The link (${extractedUrl}) is NOT an authentic Indian Government (.gov.in or .nic.in) website. Fraudsters use lookalike domains to steal farmer subsidies and personal information.`,
          matchedText: extractedUrl
        });
      } else if (isShortener) {
        patterns.push({
          id: "url_shortener",
          severity: "warning",
          title: "Obfuscated Shortened Link",
          description: "URL shorteners conceal the true destination of the link and are commonly used in phishing campaigns.",
          matchedText: extractedUrl
        });
      }
    }
  }

  const feePattern = /(?:fee|charge|rs\.?|inr|₹|रुपये|টাকা)\s*[:=]?\s*[\d,]+/i;
  const paymentTrigger = /\b(?:pay|deposit|transfer|registration fee|processing fee|शुल्क|पंजीकरण शुल्क|টাকা দিন)\b/i;

  if (feePattern.test(normalized) && (paymentTrigger.test(normalized) || extractedScheme)) {
    const feeMatch = normalized.match(feePattern);
    patterns.push({
      id: "upfront_fee",
      severity: "critical",
      title: "Illegal Fee Demand for Welfare Scheme",
      description: "Central and State welfare benefits (including PM-Kisan, Ration, and PMFBY) are completely free. Demanding an upfront registration fee or processing charge is a trademark sign of fraud.",
      matchedText: feeMatch ? feeMatch[0] : "Registration fee requested"
    });
  }

  const urgencyPattern = /\b(?:immediately|urgent|within \d+ hours?|before midnight|tonight|9:30 pm|last date|disconnection|बिजली कट|बंद हो जाएगा|তাড়াতাড়ি|আজকের মধ্যে)\b/i;
  if (urgencyPattern.test(normalized)) {
    const urgencyMatch = normalized.match(urgencyPattern);
    patterns.push({
      id: "false_urgency",
      severity: "warning",
      title: "Psychological Pressure & False Urgency",
      description: "Cyber criminals create false panic (such as immediate power cutoffs or expiring benefits) to rush users into acting without verification.",
      matchedText: urgencyMatch ? urgencyMatch[0] : "Urgent deadline stated"
    });
  }

  const otpPattern = /\b(?:otp|one time password|atm pin|cvv|net banking|password|ओटीपी|পিন)\b/i;
  const credentialAction = /\b(?:share|send|enter|verify|बताएं|शेयर करें)\b/i;

  if (otpPattern.test(normalized) && credentialAction.test(normalized)) {
    patterns.push({
      id: "credential_theft",
      severity: "critical",
      title: "Attempted OTP or Banking Credential Theft",
      description: "No government agency, bank, or electricity board will ever ask you to share your OTP or PIN over phone, SMS, or WhatsApp.",
      matchedText: "Request to share OTP or credential"
    });
  }

  const viralPattern = /\b(?:forward to \d+|share with \d+|10 लोगों को भेजें|গ্রুপে পাঠান)\b/i;
  if (viralPattern.test(normalized)) {
    patterns.push({
      id: "viral_forwarding",
      severity: "warning",
      title: "Viral Forwarding Chain",
      description: "Legitimate government notifications are published on official gazettes and portals, never via viral WhatsApp forwarding chains.",
      matchedText: "Forwarding chain instruction"
    });
  }

  if (isOfficialDomain && patterns.length === 0) {
    patterns.push({
      id: "official_gov_portal",
      severity: "info",
      title: "Authentic Indian Government Domain (.gov.in / .nic.in)",
      description: "The web address belongs to an officially registered Indian Government portal.",
      matchedText: extractedUrl
    });
  }

  const criticalCount = patterns.filter((p) => p.severity === "critical").length;
  const warningCount = patterns.filter((p) => p.severity === "warning").length;

  let riskScore = 0;
  if (criticalCount > 0) riskScore = Math.min(100, 75 + criticalCount * 12);
  else if (warningCount > 0) riskScore = Math.min(65, 30 + warningCount * 15);
  else if (isOfficialDomain) riskScore = 0;
  else riskScore = 20; // Unknown unverified text

  const isScamDetected = criticalCount > 0 || (warningCount >= 2);
  const isOfficialVerified = isOfficialDomain && patterns.length === 1 && patterns[0].id === "official_gov_portal";

  return {
    isScamDetected,
    isOfficialVerified,
    riskScore,
    patterns,
    extractedScheme,
    extractedApk,
    extractedUrl
  };
}
