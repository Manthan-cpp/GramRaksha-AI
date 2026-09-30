import { isOfficialUrl } from "@/lib/evidence/trust";
import type { Evidence } from "@/lib/schemas";

export interface MarketPrice {
  price: string;
  marketName: string;
  date: string;
  unit: string;
  source: string;
  evidenceId?: string;
}

export interface MarketRequest {
  crop: string;
  state: string;
  district: string;
}

/** No live adapter is enabled without verified feed metadata and credentials. */
export interface StructuredMarketDataAdapter {
  readonly name: string;
  lookup(input: MarketRequest): Promise<readonly MarketPrice[]>;
}

const MONTHS: Record<string, number> = {
  january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
  july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  jan: 1, feb: 2, mar: 3, apr: 4, jun: 6, jul: 7, aug: 8, sep: 9,
  sept: 9, oct: 10, nov: 11, dec: 12
};

function contains(text: string, value: string): boolean {
  const term = value.normalize("NFKC").trim().replace(/\s+/g, " ").replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return Boolean(term) && new RegExp(`(?:^|[^\\p{L}\\p{N}])${term}(?=$|[^\\p{L}\\p{N}])`, "iu")
    .test(text.normalize("NFKC").replace(/\s+/g, " "));
}

function validDate(year: number, month: number, day: number): string | null {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function datedField(snippet: string, now: Date): string | null {
  // A labelled date avoids mistaking an unrelated year or bulletin date for
  // the market observation. Numeric month/day dates are ambiguous and omitted.
  const dates = [...snippet.matchAll(/\bdate\s*[:=-]\s*(\d{4}-\d{1,2}-\d{1,2}|\d{1,2}\s+[A-Za-z]+\s+\d{4})\b/gi)];
  if (dates.length !== 1) return null;
  const raw = dates[0][1];
  let iso: string | null;
  const numeric = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
  if (numeric) {
    iso = validDate(Number(numeric[1]), Number(numeric[2]), Number(numeric[3]));
  } else {
    const words = /^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/.exec(raw);
    iso = words ? validDate(Number(words[3]), MONTHS[words[2].toLocaleLowerCase()], Number(words[1])) : null;
  }
  if (!iso || !Number.isFinite(now.getTime())) return null;
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const date = Date.parse(`${iso}T00:00:00.000Z`);
  return date <= today && today - date <= 30 * 86_400_000 ? iso : null;
}

/**
 * Search-snippet fallback, not a live mandi feed. All required values must
 * occur together in one official snippet; query/title never fill gaps.
 */
export function extractMarketPrice(item: Evidence, input: MarketRequest, now = new Date()): MarketPrice | null {
  if (item.engine !== "google" || item.trust !== "official" || !isOfficialUrl(item.url)) return null;
  const snippet = item.snippet.normalize("NFKC").replace(/\s+/g, " ").trim();
  if (!contains(snippet, input.crop) || !(contains(snippet, input.district) || contains(snippet, input.state))) return null;
  const commodities = [...snippet.matchAll(/\b(?:commodity|crop)\s*[:=-]\s*([^,;|.]+)/gi)];
  if (commodities.length !== 1 || commodities[0][1].trim().toLocaleLowerCase() !== input.crop.trim().toLocaleLowerCase()) return null;
  const date = datedField(snippet, now);
  if (!date) return null;

  const names = [...snippet.matchAll(/\b(?:market|mandi)\s*(?:name)?\s*[:=-]\s*([^,;|.]+?)(?=\s+(?:commodity|crop|date|price|rate|modal)\s*[:=-]|[,;|.]|$)/gi)];
  if (names.length !== 1) return null;
  const marketName = names[0][1].trim();
  if (marketName.length < 2 || marketName.length > 100) return null;

  // Requiring one labelled, currency-qualified price directly followed by
  // its unit excludes unrelated arrival counts, dates and multiple rates.
  if ([...snippet.matchAll(/\b(?:modal\s+price|price|rate)\s*[:=-]/gi)].length !== 1) return null;
  if ([...snippet.matchAll(/(?:₹|\bRs\.?|\bINR\b)\s*[0-9][0-9,]*(?:\.[0-9]+)?/gi)].length !== 1) return null;
  const prices = [...snippet.matchAll(/\b(?:modal\s+price|price|rate)\s*[:=-]\s*(₹|Rs\.?|INR)\s*([1-9][0-9,]*(?:\.[0-9]{1,2})?)\s*(?:\/|per)\s*(kilograms?|kgs?|kg|quintals?|qtl|metric\s+tons?|tonnes?|tons?)\b/gi)];
  if (prices.length !== 1) return null;
  const [, currency, value, rawUnit] = prices[0];
  if (!/^\d{1,3}(?:,\d{3})*$|^\d+$/.test(value.split(".")[0])) return null;
  // Do not equate "ton" with "tonne", or assume a price denominator.
  return { price: `${currency}${value}`, marketName, date, unit: rawUnit.toLocaleLowerCase(), source: item.url, evidenceId: item.id };
}

export function extractMarketPrices(input: MarketRequest, evidence: readonly Evidence[], now = new Date()): MarketPrice[] {
  const results: MarketPrice[] = [];
  for (const item of evidence) {
    const market = extractMarketPrice(item, input, now);
    if (market && !results.some((existing) => existing.source === market.source)) results.push(market);
  }
  return results.slice(0, 5);
}
