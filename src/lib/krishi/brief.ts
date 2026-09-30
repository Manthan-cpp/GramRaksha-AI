import { CropBriefSchema, type Claim, type CropBrief, type Evidence, type EvidenceRunRequest } from "@/lib/schemas";
import { isOfficialUrl } from "@/lib/evidence/trust";
import { lintEvidenceText } from "@/lib/llm/safety";
import { extractMarketPrices } from "@/lib/krishi/market";

type CropRequest = Extract<EvidenceRunRequest, { module: "krishi" }>;

const COPY = {
  en: {
    safety: "Actions are personalized from the cited source excerpts. The app does not independently diagnose the crop; open the cited source and consider local conditions before acting.",
    language: "Source excerpts remain in their original language; they have not been translated.",
    eligibility: "Eligibility and application deadlines are not verified. Confirm on the official source.",
    support: "Maps listings are not independently verified. Confirm the address, phone and opening hours before visiting.",
    kcc: "Kisan Call Centre · 1800-180-1551",
    missing: "An empty section means no sufficiently relevant, safe evidence was found. It does not mean there is no risk or no available assistance.",
    optional: "Verified mandi prices, Trends interest proxies and official-channel videos are unavailable in this brief."
  },
  hi: {
    safety: "कदम उद्धृत स्रोतों के आधार पर व्यक्तिगत रूप से दिखाए गए हैं। ऐप खुद फसल का निदान नहीं करता; कदम उठाने से पहले उद्धृत स्रोत और स्थानीय परिस्थिति देखें।",
    language: "स्रोतों के अंश उनकी मूल भाषा में हैं; उनका अनुवाद नहीं किया गया है।",
    eligibility: "पात्रता और आवेदन की अंतिम तिथि सत्यापित नहीं हैं। आधिकारिक स्रोत से पुष्टि करें।",
    support: "Maps की जानकारी स्वतंत्र रूप से सत्यापित नहीं है। जाने से पहले पता, फोन और खुलने का समय जाँच लें।",
    kcc: "किसान कॉल सेंटर · 1800-180-1551",
    missing: "खाली अनुभाग का अर्थ है कि पर्याप्त प्रासंगिक और सुरक्षित साक्ष्य नहीं मिला। इसका अर्थ जोखिम या सहायता का न होना नहीं है।",
    optional: "इस संक्षिप्त विवरण में सत्यापित मंडी भाव, Trends की खोज-रुचि और आधिकारिक चैनल के वीडियो उपलब्ध नहीं हैं।"
  },
  bn: {
    safety: "করণীয়গুলি উদ্ধৃত উৎসের ভিত্তিতে ব্যক্তিগতভাবে দেখানো হয়েছে। অ্যাপ নিজে ফসলের রোগনির্ণয় করে না; পদক্ষেপ নেওয়ার আগে উদ্ধৃত উৎস ও স্থানীয় পরিস্থিতি দেখুন।",
    language: "উৎসের উদ্ধৃতিগুলি মূল ভাষায় রাখা হয়েছে; অনুবাদ করা হয়নি।",
    eligibility: "যোগ্যতা এবং আবেদনের শেষ তারিখ যাচাই করা হয়নি। সরকারি উৎসে নিশ্চিত করুন।",
    support: "Maps-এর তথ্য স্বাধীনভাবে যাচাই করা হয়নি। যাওয়ার আগে ঠিকানা, ফোন ও খোলার সময় নিশ্চিত করুন।",
    kcc: "কিষান কল সেন্টার · 1800-180-1551",
    missing: "খালি বিভাগ মানে যথেষ্ট প্রাসঙ্গিক ও নিরাপদ প্রমাণ পাওয়া যায়নি। এর অর্থ ঝুঁকি বা সহায়তা নেই এমন নয়।",
    optional: "এই সারাংশে যাচাইকৃত বাজারদর, Trends-এর অনুসন্ধান-আগ্রহ এবং সরকারি চ্যানেলের ভিডিও উপলব্ধ নেই।"
  }
} as const;

function contains(text: string, value: string): boolean {
  const term = value.normalize("NFKC").trim().replace(/\s+/g, " ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Boolean(term) && new RegExp(`(?:^|[^\\p{L}\\p{N}])${term}(?=$|[^\\p{L}\\p{N}])`, "iu").test(text.normalize("NFKC").replace(/\s+/g, " "));
}

function recent(item: Evidence, now: Date): boolean {
  // Relative or ambiguous dates are not sufficient evidence of freshness.
  if (!item.publishedAt || !/^\d{4}-\d{2}-\d{2}T/.test(item.publishedAt)) return false;
  const age = now.getTime() - Date.parse(item.publishedAt);
  return Number.isFinite(age) && age >= 0 && age <= 30 * 86_400_000;
}

function quote(item: Evidence): Claim {
  return { text: item.snippet, quote: item.snippet, evidenceIds: [item.id] };
}

/** Quote-only synthesis. Query text and search ranking never establish crop context. */
export function buildCropBrief(input: CropRequest, retainedEvidence: Evidence[], now = new Date()): CropBrief {
  const copy = COPY[input.locale];
  const sources = retainedEvidence.filter((item) => lintEvidenceText(JSON.stringify(item)).safe);
  const actions: Claim[] = [];
  const alerts: CropBrief["alerts"] = [];
  const schemes: CropBrief["schemes"] = [];
  const support: CropBrief["support"] = [];
  const market = extractMarketPrices(input, sources, now);
  const videos: CropBrief["videos"] = [];
  let trend: CropBrief["trend"];

  for (const item of sources) {
    const content = `${item.title} ${item.snippet}`;
    const cropMatch = contains(item.snippet, input.crop);
    const districtMatch = contains(item.snippet, input.district);
    const official = item.trust === "official" && isOfficialUrl(item.url);

    // Only explicitly local, current official advisory excerpts are promoted
    // into personalized actions. Treatment wording is allowed here because it
    // remains a direct, cited recommendation rather than generated advice.
    if (official && item.engine === "google" && cropMatch && districtMatch &&
        contains(item.snippet, input.stage) && /\b(?:advisory|agromet)\b/i.test(content) && recent(item, now) &&
        /\b(?:monitor|inspect|observe|check|apply|use|treat|mix|administer|spray|control|remove|avoid)\b/i.test(item.snippet)) {
      actions.push(quote(item));
    }

    // News excerpts report context, never a severity assessment or diagnosis.
    if (item.engine === "google_news" && cropMatch && districtMatch && recent(item, now) &&
        /\b(?:rain|rainfall|flood\w*|drought|heat\w*|storm|weather|pest|warning|alert)\b/i.test(item.snippet)) {
      alerts.push({ freshness: item.publishedAt!, claim: quote(item) });
    }

    if (official && item.engine === "google" && cropMatch &&
        (contains(item.snippet, input.state) || districtMatch) &&
        /\b(?:scheme|yojana|subsidy)\b/i.test(item.title) && /\b(?:farmer|farmers|agriculture)\b/i.test(item.snippet)) {
      schemes.push({ name: item.title, description: item.snippet, eligibility: copy.eligibility, url: item.url, evidenceId: item.id });
    }

    if (item.engine === "google_trends" && item.trend && item.trend.values.length >= 2) {
      trend = { ...item.trend, evidenceId: item.id };
    }

    if (item.engine === "youtube" && item.video && item.trust === "official") {
      videos.push({
        title: item.title,
        description: item.snippet,
        url: item.url,
        channelName: item.video.channelName,
        duration: item.video.duration,
        thumbnailUrl: item.video.thumbnailUrl,
        evidenceId: item.id
      });
    }

    const place = item.maps;
    if (item.engine === "google_maps" && place && place.address &&
        /\b(?:Krishi Vigyan Kendra|KVK|agriculture office|agricultural office)\b/i.test(place.name) &&
        (contains(place.name, input.district) || contains(place.address, input.district))) {
      support.push({ name: place.name, address: place.address, phone: place.phone, hoursText: place.hoursText, mapsUrl: place.mapsUrl, evidenceId: item.id });
    }
  }

  return CropBriefSchema.parse({
    actions: actions.slice(0, 5), alerts: alerts.slice(0, 5), market, schemes: schemes.slice(0, 5),
    support: support.slice(0, 5), kisanCallCentre: { name: copy.kcc, phone: "1800-180-1551", sourceUrl: "https://mkisan.gov.in/Alpha/advs/UserManualSMSPortalVer1.pdf" }, videos: videos.slice(0, 5), trend, sources,
    disclaimers: [copy.safety, copy.language, copy.missing, copy.support, ...(!market.length || !trend || !videos.length ? [copy.optional] : [])],
    locale: input.locale, translationStatus: "original_sources"
  });
}
