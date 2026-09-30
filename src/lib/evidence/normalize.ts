import { createHash } from "node:crypto";

import type { EvidenceEngine, Evidence, PlannedQuery } from "@/lib/schemas";
import { lintEvidenceText } from "@/lib/llm/safety";

type JsonRecord = Record<string, unknown>;

export interface EvidenceCandidate extends Evidence {
  sourcePosition?: number;
  recencyScore: number;
  unsafeSource?: boolean;
}

function record(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function text(value: unknown): string {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";
}

function validUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return (url.protocol === "http:" || url.protocol === "https:") && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

function dateValue(value: unknown): string | undefined {
  const candidate = text(value);
  if (!candidate) return undefined;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? candidate : parsed.toISOString();
}

function numericValue(value: unknown): number | undefined {
  const parsed = typeof value === "number" ? value : Number.parseFloat(text(value));
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : undefined;
}

function publisherFor(item: JsonRecord, fallbackUrl: string): string {
  const source = record(item.source);
  const developer = record(item.developer);
  return (
    text(developer.name) ||
    text(item.developer) ||
    text(source.name) ||
    text(item.publisher) ||
    text(item.displayed_link) ||
    (validUrl(fallbackUrl) ? new URL(fallbackUrl).hostname : "")
  );
}

function evidenceId(engine: EvidenceEngine, url: string, query: string): string {
  return createHash("sha256").update(`${engine}|${url}|${query}`).digest("hex").slice(0, 18);
}

function recencyScore(publishedAt?: string): number {
  if (!publishedAt) return 0;
  const date = new Date(publishedAt);
  if (Number.isNaN(date.getTime())) return 0;
  const ageDays = Math.max(0, (Date.now() - date.getTime()) / 86_400_000);
  if (ageDays <= 7) return 3;
  if (ageDays <= 30) return 2;
  if (ageDays <= 90) return 1;
  return 0;
}

function buildCandidate(
  item: JsonRecord,
  query: PlannedQuery,
  retrievedAt: string,
  position: number,
  maps = false
): EvidenceCandidate | null {
  const title = text(item.title) || text(item.name);
  const rawUrl = text(item.link) || text(item.url);
  const placeId = text(item.place_id);
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${title} ${text(item.address)}`)}${placeId ? `&query_place_id=${encodeURIComponent(placeId)}` : ""}`;
  const url = maps && title ? mapsUrl : validUrl(rawUrl);
  if (!title || !url) return null;

  const address = text(item.address);
  const description = text(item.snippet) || text(item.description) || text(item.type) || (Array.isArray(item.type) ? item.type.map(text).filter(Boolean).join(", ") : "");
  const hoursText = text(item.hours) || (Array.isArray(item.hours)
    ? item.hours.flatMap((day) => Object.entries(record(day)).map(([key, value]) => `${key}: ${text(value)}`)).join("; ")
    : "");
  const rating = text(item.rating) || (typeof item.rating === "number" ? item.rating.toString() : "");
  const downloads = text(item.downloads);
  const devName = text(record(item.developer).name) || text(item.developer);
  const playInfo = [
    description,
    rating ? `Rating: ${rating}★` : "",
    downloads ? `Downloads: ${downloads}` : "",
    devName ? `Developer: ${devName}` : ""
  ].filter(Boolean).join(" · ");

  const baseSnippet = maps && address
    ? [description, `Address: ${address}`, text(item.phone) ? `Phone: ${text(item.phone)}` : "", hoursText ? `Hours: ${hoursText}` : ""]
      .filter(Boolean)
      .join(" · ")
    : query.engine === "google_play" && playInfo
      ? playInfo
      : description;
  if (!baseSnippet) return null;

  const publishedAt = dateValue(item.iso_date) || dateValue(item.date);
  const languages = record(item.about_this_result).languages;
  const sourceLanguage = text(item.language) || (Array.isArray(languages) && languages.length === 1 ? text(languages[0]) : "");
  const isSuraksha = query.id.startsWith("suraksha") || query.engine === "google_play";

  return {
    id: evidenceId(query.engine, url, query.query),
    url,
    title: title.slice(0, 300),
    snippet: baseSnippet.slice(0, 1_500),
    publisher: publisherFor(item, url).slice(0, 200),
    engine: query.engine,
    trust: query.engine === "google_news" ? "news" : "other",
    publishedAt,
    retrievedAt,
    query: query.query,
    sourceLanguage: /^[a-z]{2,3}(?:-[A-Za-z]{2,4})?$/.test(sourceLanguage) ? sourceLanguage : undefined,
    maps: maps ? { name: title, address, phone: text(item.phone) || undefined, hoursText: hoursText || undefined, mapsUrl, placeId: placeId || undefined } : undefined,
    unsafeSource: !lintEvidenceText([title, baseSnippet, publisherFor(item, url), url, hoursText].join("\n"), { allowScamContext: isSuraksha }).safe,
    sourcePosition: position,
    recencyScore: recencyScore(publishedAt)
  };
}

function buildTrendCandidate(root: JsonRecord, query: PlannedQuery, retrievedAt: string): EvidenceCandidate | null {
  const interest = record(root.interest_over_time);
  const timeline = Array.isArray(interest.timeline_data) ? interest.timeline_data : [];
  const values = timeline
    .flatMap((entry) => {
      const row = record(entry);
      const entries = Array.isArray(row.values) ? row.values : [];
      return entries.map((value) => record(value));
    })
    .map((value) => numericValue(value.extracted_value ?? value.value))
    .filter((value): value is number => value !== undefined);
  if (values.length < 2) return null;

  const midpoint = Math.max(1, Math.floor(values.length / 2));
  const firstAverage = values.slice(0, midpoint).reduce((sum, value) => sum + value, 0) / midpoint;
  const secondValues = values.slice(midpoint);
  const secondAverage = secondValues.reduce((sum, value) => sum + value, 0) / secondValues.length;
  const signal = secondAverage - firstAverage >= 8
    ? "rising"
    : firstAverage - secondAverage >= 8
      ? "falling"
      : "stable";
  const parameters = query.parameters;
  const region = parameters.geo || "IN";
  const window = parameters.date || "today 1-m";
  const metadata = record(root.search_metadata);
  const metadataUrl = validUrl(text(metadata.google_trends_url));
  const url = metadataUrl || `https://trends.google.com/trends/explore?geo=${encodeURIComponent(region)}&q=${encodeURIComponent(query.query)}`;
  const title = `Search-interest proxy: ${query.query}`;
  const snippet = `Search interest is ${signal} in ${region} over ${window}. This is a search proxy, not a confirmed crop alert.`;
  return {
    id: evidenceId(query.engine, url, query.query),
    url,
    title,
    snippet,
    publisher: "Google Trends",
    engine: query.engine,
    trust: "other",
    retrievedAt,
    query: query.query,
    trend: { signal, value: values[values.length - 1], values: values.slice(-48), region, window },
    unsafeSource: !lintEvidenceText(`${title}\n${snippet}`).safe,
    sourcePosition: 1,
    recencyScore: 3
  };
}

function buildVideoCandidate(item: JsonRecord, query: PlannedQuery, retrievedAt: string, position: number): EvidenceCandidate | null {
  const channel = record(item.channel);
  const title = text(item.title);
  const url = validUrl(text(item.link) || text(item.url));
  const channelName = text(channel.name) || text(item.channel_name) || text(item.author);
  const channelUrl = validUrl(text(channel.link) || text(item.channel_url));
  const thumbnail = record(item.thumbnail);
  const thumbnailUrl = validUrl(text(thumbnail.static) || text(thumbnail.rich));
  const description = text(item.description) || text(item.snippet);
  if (!title || !url || !channelName || !description) return null;
  const snippet = description.slice(0, 1_500);
  const video = {
    channelName,
    channelUrl: channelUrl || undefined,
    duration: text(item.length) || undefined,
    thumbnailUrl: thumbnailUrl || undefined
  };
  return {
    id: evidenceId(query.engine, url, query.query),
    url,
    title: title.slice(0, 300),
    snippet,
    publisher: channelName.slice(0, 200),
    engine: query.engine,
    trust: "other",
    publishedAt: dateValue(item.published) || dateValue(item.date),
    retrievedAt,
    query: query.query,
    video,
    unsafeSource: !lintEvidenceText(`${title}\n${snippet}\n${channelName}`).safe,
    sourcePosition: position,
    recencyScore: recencyScore(dateValue(item.published) || dateValue(item.date))
  };
}

export function normalizeSerpApiResponse(raw: unknown, query: PlannedQuery, retrievedAt: string): EvidenceCandidate[] {
  const root = record(raw);
  if (query.engine === "google_trends") {
    const trend = buildTrendCandidate(root, query, retrievedAt);
    return trend ? [trend] : [];
  }
  const results = query.engine === "google_maps"
    ? (Array.isArray(root.local_results) ? root.local_results : root.place_results ? [root.place_results] : [])
    : query.engine === "google_news"
      ? (Array.isArray(root.news_results) ? root.news_results : [])
      : query.engine === "youtube"
        ? (Array.isArray(root.video_results) ? root.video_results : [])
        : query.engine === "google_play"
          ? (Array.isArray(root.organic_results) ? root.organic_results : Array.isArray(root.app_results) ? root.app_results : Array.isArray(root.items) ? root.items : [])
          : (Array.isArray(root.organic_results) ? root.organic_results : []);

  if (query.engine === "youtube") {
    return results
      .map((item, index) => buildVideoCandidate(record(item), query, retrievedAt, index + 1))
      .filter((candidate): candidate is EvidenceCandidate => Boolean(candidate));
  }
  return results
    .map((item, index) => buildCandidate(record(item), query, retrievedAt, index + 1, query.engine === "google_maps"))
    .filter((candidate): candidate is EvidenceCandidate => Boolean(candidate));
}

export function withoutInternalFields(candidate: EvidenceCandidate): Evidence {
  return {
    id: candidate.id,
    url: candidate.url,
    title: candidate.title,
    snippet: candidate.snippet,
    publisher: candidate.publisher,
    engine: candidate.engine,
    trust: candidate.trust,
    publishedAt: candidate.publishedAt,
    retrievedAt: candidate.retrievedAt,
    query: candidate.query,
    maps: candidate.maps,
    trend: candidate.trend,
    video: candidate.video,
    sourceLanguage: candidate.sourceLanguage
  };
}
