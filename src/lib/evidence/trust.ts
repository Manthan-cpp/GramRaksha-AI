import type { EvidenceEngine, PlannedQuery } from "@/lib/schemas";
import type { EvidenceCandidate } from "@/lib/evidence/normalize";
import { lintEvidenceText } from "@/lib/llm/safety";

const OFFICIAL_SUFFIXES = [
  ".gov.in",
  ".nic.in",
  ".icar.gov.in",
  ".imd.gov.in",
  ".nhm.gov.in",
  ".data.gov.in",
  ".agmarknet.gov.in",
  ".ncdrc.nic.in"
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
  "uidai.gov.in"
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
  /\b कृषि विज्ञान केंद्र\b/u,
  /\bকৃষি বিজ্ঞান কেন্দ্র\b/u
];

const GENERIC_QUERY_TERMS = new Set([
  "official", "website", "advisory", "agriculture", "agricultural", "farmer", "farmers", "scheme", "schemes",
  "yojana", "subsidy", "mandi", "market", "markets", "price", "prices", "weather", "pest", "warning",
  "alert", "when", "today", "month", "search", "interest", "proxy", "video", "videos", "channel", "crop",
  "support", "office", "vigyan", "kendra", "site", "gov", "nic", "icar", "imd", "or"
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

/**
 * Search engines can return unrelated government pages for a broad or
 * malformed query. Domain trust alone is not relevance. Require at least two
 * user-context terms for normal search/video/news results; Maps has its own
 * place-specific check. This keeps source lists useful without fabricating
 * facts or discarding a genuine local result solely because it is not official.
 */
export function isRelevantEvidence(candidate: EvidenceCandidate, query: PlannedQuery): boolean {
  if (candidate.engine === "google_trends") return Boolean(candidate.trend);
  const text = [candidate.title, candidate.snippet, candidate.publisher, candidate.maps?.name, candidate.maps?.address].filter(Boolean).join(" ");
  if (candidate.engine === "google_maps") {
    if (query.id.startsWith("medi")) {
      return /\b(?:consumer|commission|court|forum|legal|services|authority|disputes|redressal|dlsa|dcdrc|lok adalat|health|hospital|medical)\b/i.test(text);
    }
    return /\b(?:krishi|agriculture|agricultural|kvk|extension)\b/i.test(text) && contextTerms(query).some((term) => containsTerm(text, term));
  }
  if (query.id.startsWith("suraksha")) {
    return (
      /\b(?:pm\s*kisan|pmkisan|fasal|bima|pmfby|ayushman|pmjay|ration|aadhaar|electricity|bijli|cyber|police|scam|fraud|fake|apk|advisory|sanchar|saathi|chakshu|play\.google)\b/i.test(text) ||
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
    return OFFICIAL_HOSTS.has(hostname) || OFFICIAL_SUFFIXES.some((suffix) => hostname.endsWith(suffix));
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
      reason: query.id.startsWith("medi")
        ? "The result did not match enough of the medical, legal, or city context."
        : query.id.startsWith("suraksha")
          ? "The result did not match the cyber, scheme, or advisory context."
          : "The result did not match enough of the selected crop and location context."
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
