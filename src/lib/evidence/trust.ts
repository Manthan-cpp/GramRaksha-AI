import type { EvidenceEngine, PlannedQuery } from "@/lib/schemas";
import type { EvidenceCandidate } from "@/lib/evidence/normalize";
import { lintEvidenceText } from "@/lib/llm/safety";

const OFFICIAL_SUFFIXES = [
  ".gov.in",
  ".nic.in",
  ".icar.gov.in",
  ".icar.org.in",
  ".imd.gov.in",
  ".nhm.gov.in",
  ".data.gov.in",
  ".agmarknet.gov.in",
  ".ncdrc.nic.in",
  ".ivri.nic.in",
  ".dahd.nic.in",
  ".nha.gov.in",
  ".agricoop.nic.in",
  ".nddb.coop"
];

const OFFICIAL_HOSTS = new Set([
  "india.gov.in",
  "mygov.in",
  "pmindia.gov.in",
  "consumerhelpline.gov.in",
  "sancharsaathi.gov.in",
  "cybercrime.gov.in",
  "pmkisan.gov.in",
  "pib.gov.in",
  "pmfby.gov.in",
  "pmjay.gov.in",
  "uidai.gov.in",
  "nddb.coop",
  "icar.org.in",
  "ivri.nic.in",
  "dahd.nic.in",
  "nha.gov.in",
  "agricoop.nic.in",
  "agmarknet.gov.in"
]);

const OFFICIAL_VIDEO_CHANNEL_PATTERNS = [
  /\bicar\b/i,
  /\bindian council of agricultural research\b/i,
  /\bdd\s*kisan\b/i,
  /\bkrishi vigyan kendra\b/i,
  /\bdepartment of agriculture\b/i,
  /\bministry of agriculture\b/i,
  /\bstate agriculture\b/i,
  /\bagriculture department\b/i,
  /\bivri\b/i,
  /\bnddb\b/i,
  /\bveterinary\b/i,
  /\bpashudhan\b/i,
  /\bpashu\b/i,
  /\banimal husbandry\b/i,
  /\bkisan\b/i,
  /\b कृषि विज्ञान केंद्र\b/u,
  /\bকৃষি বিজ্ঞান কেন্দ্র\b/u
];

const GENERIC_QUERY_TERMS = new Set([
  "official", "website", "advisory", "agriculture", "agricultural", "farmer", "farmers", "scheme", "schemes",
  "yojana", "subsidy", "mandi", "market", "markets", "price", "prices", "weather", "pest", "warning",
  "alert", "when", "today", "month", "search", "interest", "proxy", "video", "videos", "channel", "crop",
  "support", "office", "vigyan", "kendra", "site", "gov", "nic", "icar", "imd", "or", "and", "not",
  "first", "aid", "guidelines", "remedies", "care", "information"
]);

function normalizeMatchText(value: string): string {
  return value.normalize("NFKC").replace(/[^\p{L}\p{N}]+/gu, " ").replace(/\s+/g, " ").trim().toLocaleLowerCase();
}

function containsTerm(text: string, term: string): boolean {
  const haystack = normalizeMatchText(text);
  const needle = normalizeMatchText(term);
  return Boolean(needle) && ` ${haystack} `.includes(` ${needle} `);
}

function contextTerms(query: PlannedQuery): string[] {
  const quoted = [...query.query.matchAll(/"([^"]+)"/g)].map((match) => match[1]).filter(Boolean);
  if (quoted.length) return quoted;
  return query.query
    .replace(/\([^)]*\)/g, " ")
    .split(/\s+/)
    .map((term) => term.replace(/^when:.*/i, "").replace(/[^\p{L}\p{N}]+/gu, "").trim())
    .filter((term) => term.length > 2 && !GENERIC_QUERY_TERMS.has(term.toLocaleLowerCase()));
}

function moduleDropReason(queryId: string): string {
  if (queryId.startsWith("pashu")) {
    return "The result did not match the livestock health, symptom, or veterinary advisory context.";
  }
  if (queryId.startsWith("medi")) {
    return "The result did not match enough of the medical, legal, or city context.";
  }
  if (queryId.startsWith("suraksha")) {
    return "The result did not match the cyber, scheme, or advisory context.";
  }
  if (queryId.startsWith("fasal")) {
    return "The result did not match the crop loss, PMFBY insurance, or localized calamity context.";
  }
  if (queryId.startsWith("pocket")) {
    return "The result did not match the local emergency service, PHC, police, or administrative context.";
  }
  return "The result did not match enough of the selected crop and location context.";
}

/**
 * Search engines can return unrelated government pages for a broad or
 * malformed query. Domain trust alone is not relevance. Require at least one
 * user-context term for normal search/video/news results; Maps has its own
 * place-specific check. This keeps source lists useful without fabricating
 * facts or discarding a genuine local result solely because it is not official.
 */
export function isRelevantEvidence(candidate: EvidenceCandidate, query: PlannedQuery): boolean {
  if (candidate.engine === "google_trends") return Boolean(candidate.trend);
  if (candidate.engine === "google_play") return true;

  const text = [candidate.title, candidate.snippet, candidate.publisher, candidate.maps?.name, candidate.maps?.address].filter(Boolean).join(" ");
  if (!text.trim()) return false;

  if (candidate.engine === "google_maps") {
    if (candidate.maps?.name || candidate.title) {
      if (query.id.startsWith("pashu")) {
        return /\b(?:veterinary|animal|pashu|chikitsalaya|hospital|dispensary|clinic|doctor|poly\s*clinic|cow|cattle|livestock|care|mvu)\b/i.test(text) || Boolean(candidate.maps?.name);
      }
      if (query.id.startsWith("medi")) {
        return /\b(?:consumer|commission|court|forum|legal|services|authority|disputes|redressal|dlsa|dcdrc|lok adalat|health|hospital|medical|clinic)\b/i.test(text) || Boolean(candidate.maps?.name);
      }
      if (query.id.startsWith("fasal")) {
        return /\b(?:agriculture|krishi|bhavan|bima|insurance|kisan|office|collector|revenue|district|dept)\b/i.test(text) || Boolean(candidate.maps?.name);
      }
      if (query.id.startsWith("pocket")) {
        return /\b(?:health|hospital|phc|chc|dispensary|police|thana|chowki|legal|dlsa|kvk|agriculture|panchayat|center|centre)\b/i.test(text) || Boolean(candidate.maps?.name);
      }
      if (query.id.startsWith("krishi")) {
        return /\b(?:krishi|agriculture|agricultural|kvk|extension|mandi|market|center|centre|kisan)\b/i.test(text) || Boolean(candidate.maps?.name);
      }
      return true;
    }
    return false;
  }

  if (query.id.startsWith("suraksha")) {
    return (
      /\b(?:pm\s*kisan|pmkisan|fasal|bima|pmfby|ayushman|pmjay|ration|aadhaar|electricity|bijli|cyber|police|scam|fraud|fake|apk|advisory|sanchar|saathi|chakshu|play\.google)\b/i.test(text) ||
      contextTerms(query).some((term) => containsTerm(text, term))
    );
  }

  if (query.id.startsWith("pashu")) {
    return (
      /\b(?:veterinary|animal|livestock|pashu|cattle|cow|buffalo|goat|sheep|poultry|kisan|ivri|nddb|dahd|icar|chikitsa|ilaj|fever|disease|vaccin\w*|symptom\w*|treatment|first\s*aid|ambulance|1962)\b/i.test(text) ||
      contextTerms(query).some((term) => containsTerm(text, term))
    );
  }

  const terms = contextTerms(query);
  if (terms.length === 0) return true;
  if (!containsTerm(text, terms[0])) return false;
  const matches = terms.filter((term) => containsTerm(text, term)).length;
  return matches >= Math.min(2, terms.length);
}

export type Classification =
  | { action: "keep"; evidence: EvidenceCandidate; reason: string }
  | { action: "drop"; evidence: EvidenceCandidate | null; title: string; url?: string; reason: string };

export function isOfficialUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) return false;
    const hostname = url.hostname.toLocaleLowerCase().replace(/^www\./, "");
    return (
      OFFICIAL_HOSTS.has(hostname) ||
      OFFICIAL_SUFFIXES.some((suffix) => hostname === suffix.replace(/^\./, "") || hostname.endsWith(suffix))
    );
  } catch {
    return false;
  }
}

export function isOfficialVideoChannel(value?: string): boolean {
  return Boolean(value && OFFICIAL_VIDEO_CHANNEL_PATTERNS.some((pattern) => pattern.test(value)));
}

export function classifyEvidence(candidate: EvidenceCandidate | null, query: PlannedQuery): Classification {
  if (!candidate) {
    return { action: "drop", evidence: null, title: "Unusable result", reason: "The result had no usable title, URL, or snippet." };
  }

  const isSuraksha = query.id.startsWith("suraksha");
  if (candidate.unsafeSource || !lintEvidenceText(JSON.stringify(candidate), { allowScamContext: isSuraksha }).safe) {
    return { action: "drop", evidence: null, title: "Unsafe source withheld", reason: "Source failed the safety check." };
  }

  const official = isOfficialUrl(candidate.url);
  const officialVideo = candidate.engine === "youtube" && isOfficialVideoChannel(candidate.video?.channelName);
  const evidence = {
    ...candidate,
    trust: official || officialVideo ? "official" : candidate.engine === "google_news" ? "news" : "other"
  } as EvidenceCandidate;

  if (!isRelevantEvidence(evidence, query)) {
    return {
      action: "drop",
      evidence,
      title: evidence.title,
      url: evidence.url,
      reason: moduleDropReason(query.id)
    };
  }

  if (query.requireOfficial && !official && !officialVideo) {
    return {
      action: "drop",
      evidence,
      title: evidence.title,
      url: evidence.url,
      reason: "The result was not from the official-domain allowlist."
    };
  }

  const reason = official || officialVideo
    ? "Official-domain result kept."
    : evidence.engine === "google_news"
      ? "News result kept with a news trust badge."
      : "Public result kept with an other-source trust badge.";
  return { action: "keep", evidence, reason };
}

export function engineLabel(engine: EvidenceEngine): string {
  switch (engine) {
    case "google_news":
      return "Google News";
    case "google_maps":
      return "Google Maps";
    case "google_trends":
      return "Google Trends";
    case "youtube":
      return "YouTube";
    case "google_play":
      return "Google Play";
    case "google":
      return "Google Search";
    default:
      return "Public search";
  }
}
