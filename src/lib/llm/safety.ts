import type { Claim } from "@/lib/schemas";

const FORBIDDEN_WORDS = [
  /\bfraud\b/i,
  /\bscam\b/i,
  /\bovercharg(?:e|ed|ing)\b/i,
  /\bcheat(?:ing|ed)?\b/i,
  /\bguilty\b/i,
  /\billegal\b/i,
  /\bcriminal\b/i
];

const PESTICIDE_OR_DOSE_PATTERNS = [
  /\b(?:pesticides?|insecticides?|fungicides?|herbicides?|acaricides?|rodenticides?|imidacloprid|chlorpyrifos|monocrotophos|glyphosate|malathion|carbofuran|carbendazim|mancozeb|tricyclazole|thiamethoxam|fipronil|cypermethrin|deltamethrin|acephate|emamectin|abamectin|chlorantraniliprole|spinosad|azadirachtin|dimethoate|profenofos|quinalphos|cartap|buprofezin)\b/i,
  /कीटनाशक|कीटनाशी|फफूंदनाशक|खरपतवारनाशक|छिड़काव|छिडकाव|स्प्रे|दवा|ডোজ|কীটনাশক|কীটনাশী|ছত্রাকনাশক|আগাছানাশক|স্প্রে|ঔষধ|ইমিডাক্লোপ্রিড|ক্লোরপাইরিফস|কার্বেন্ডাজিম|मात्रा|खुराक/iu,
  /\b(?:spray|dose|dosage|chemicals?|tank.mix|neem oil|bordeaux mixture|copper oxychloride|copper sulphate|copper sulfate)\b/i,
  /\b(?:apply|use|mix|treat)\b.{0,80}\b(?:EC|SC|WP|WG|SL|SP|GR)\b/,
  /[\d०-९০-৯]+(?:[.,][\d०-९০-৯]+)?\s*(?:%|ppm\b|मिली|मि\.ली|ग्राम|किलो|लीटर|মিলি|গ্রাম|কেজি|লিটার)/iu,
  /\b(?:pesticide|insecticide|fungicide|herbicide)\b.{0,80}\b(?:ml|millilitre|liter|litre|gram|kg|dose|spray)\b/i,
  /\b(?:spray|apply|use)\b.{0,60}\b(?:ml|millilitre|liter|litre|gram|kg)\b/i,
  /\b\d+(?:\.\d+)?\s?(?:mg|ml|g|gram|kg|litre|liter)\b/i
];

const INSTRUCTION_PATTERNS = [
  /\b(?:ignore|disregard|override)\b.{0,60}\b(?:instructions?|rules?|prompt|safety)\b/i,
  /\b(?:system|developer|assistant)\s*(?:message|prompt|:)/i,
  /<\/?(?:script|iframe)|javascript:|\bonerror\s*=/i,
  /\b(?:your|this)\s+(?:crop|plant|rice|paddy)\b.{0,40}\b(?:has|infected|suffers|diagnos\w*)\b/i
];

export interface SafetyOptions {
  allowScamContext?: boolean;
}

const DEFAMATION_OR_VERDICT_WORDS = [
  /\bovercharg(?:e|ed|ing)\b/i,
  /\bguilty\b/i
];

/**
 * Source excerpts may legitimately contain a pesticide name, treatment verb,
 * or a dosage. Those words are not, by themselves, a prompt-injection signal.
 * Keep the source boundary strict, but do not discard a relevant official
 * recommendation merely because it contains agronomy instructions.
 */
export function lintEvidenceText(text: string, options?: SafetyOptions): SafetyCheck {
  text = text.normalize("NFKC").replace(/[\u200b-\u200d\ufeff]/g, "");
  const reasons: string[] = [];
  const wordsToCheck = options?.allowScamContext ? DEFAMATION_OR_VERDICT_WORDS : FORBIDDEN_WORDS;
  if (wordsToCheck.some((pattern) => pattern.test(text))) {
    reasons.push("forbidden verdict language");
  }
  if (INSTRUCTION_PATTERNS.some((pattern) => pattern.test(text))) {
    reasons.push("untrusted source instruction");
  }
  return { safe: reasons.length === 0, reasons };
}

/** Search terms may include the farmer's treatment concern. Prompt-like text
 * is still rejected before it is sent to the search provider. */
export function isSearchableConcern(text: string): boolean {
  const normalized = text.normalize("NFKC").replace(/[\u200b-\u200d\ufeff]/g, "");
  return !FORBIDDEN_WORDS.some((pattern) => pattern.test(normalized)) &&
    !INSTRUCTION_PATTERNS.some((pattern) => pattern.test(normalized));
}

/** Conservative intent gate, also used before free-text concerns enter search queries. */
export function isPesticideConcern(text: string): boolean {
  return PESTICIDE_OR_DOSE_PATTERNS.some((pattern) => pattern.test(text.normalize("NFKC").replace(/[\u200b-\u200d\ufeff]/g, "")));
}

export interface SafetyCheck {
  safe: boolean;
  reasons: string[];
}

export function lintText(text: string, options?: SafetyOptions): SafetyCheck {
  text = text.normalize("NFKC").replace(/[\u200b-\u200d\ufeff]/g, "");
  const reasons: string[] = [];
  const wordsToCheck = options?.allowScamContext ? DEFAMATION_OR_VERDICT_WORDS : FORBIDDEN_WORDS;
  if (wordsToCheck.some((pattern) => pattern.test(text))) {
    reasons.push("forbidden verdict language");
  }
  if (PESTICIDE_OR_DOSE_PATTERNS.some((pattern) => pattern.test(text))) {
    reasons.push("pesticide or dosage instruction");
  }
  if (INSTRUCTION_PATTERNS.some((pattern) => pattern.test(text))) {
    reasons.push("untrusted source instruction");
  }
  return { safe: reasons.length === 0, reasons };
}

export function lintClaim(claim: Claim): SafetyCheck {
  return lintText(`${claim.text}\n${claim.quote}`);
}

export function keepSafeClaims(claims: Claim[]): { claims: Claim[]; dropped: number } {
  const safeClaims = claims.filter((claim) => lintClaim(claim).safe);
  return { claims: safeClaims, dropped: claims.length - safeClaims.length };
}
