import type { CropBrief } from "@/lib/schemas";

export function safeWebUrl(value?: string): string | undefined {
  try { const url = new URL(value || ""); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined; } catch { return undefined; }
}
export function safePhone(value?: string): string | undefined {
  if (!value || !/^\+?[\d\s()-]+$/.test(value)) return undefined;
  const clean = value.replace(/[\s()-]/g, "");
  return /^\+?\d{10,15}$/.test(clean) ? clean : undefined;
}

/** Build a WhatsApp URL only from the already-filtered summary text. */
export function whatsappShareUrl(text: string): string | undefined {
  if (!text.trim()) return undefined;
  const url = new URL("https://wa.me/");
  url.searchParams.set("text", text);
  return safeWebUrl(url.toString());
}
export function sourcedSummary(brief: CropBrief, heading: string, sourceLabel: string) {
  const lines = [heading];
  for (const claim of [...brief.alerts.map(a => a.claim), ...brief.actions]) {
    const sources = brief.sources.filter(s => claim.evidenceIds.includes(s.id) && safeWebUrl(s.url));
    if (!sources.length) continue;
    lines.push(claim.text, ...sources.map(s => `${sourceLabel}: ${s.publisher} · ${s.engine} · ${s.trust} · ${s.retrievedAt}${s.publishedAt ? ` · ${s.publishedAt}` : ""}\n${safeWebUrl(s.url)}`));
  }
  for (const market of brief.market) {
    const source = brief.sources.find(item => item.id === market.evidenceId || item.id === market.source || item.url === market.source);
    const url = source && safeWebUrl(source.url);
    if (source && url) lines.push(`${market.marketName}: ${market.price} / ${market.unit} · ${market.date}`, `${sourceLabel}: ${source.publisher} · ${url}`);
  }
  if (brief.trend) {
    const source = brief.sources.find(item => item.id === brief.trend?.evidenceId);
    const url = source && safeWebUrl(source.url);
    if (source && url) lines.push(`Search-interest proxy: ${brief.trend.signal} · ${brief.trend.value}/100`, `${sourceLabel}: ${source.publisher} · ${url}`);
  }
  for (const video of brief.videos) {
    const source = brief.sources.find(item => item.id === video.evidenceId);
    const url = source && safeWebUrl(source.url);
    if (source && url) lines.push(`${video.title} · ${video.channelName}`, `${sourceLabel}: ${url}`);
  }
  if (brief.kisanCallCentre) {
    const source = safeWebUrl(brief.kisanCallCentre.sourceUrl);
    if (source && safePhone(brief.kisanCallCentre.phone)) lines.push(`${brief.kisanCallCentre.name}: ${brief.kisanCallCentre.phone}`, `${sourceLabel}: ${source}`);
  }
  lines.push(...brief.disclaimers);
  if (brief.refusal && !brief.disclaimers.includes(brief.refusal)) lines.push(brief.refusal);
  return lines.join("\n\n");
}

export async function exportSummaryImage(text: string, locale: string) {
  const variable = locale === "hi" ? "--font-devanagari" : locale === "bn" ? "--font-bengali" : "--font-body";
  const rootStyle = getComputedStyle(document.documentElement);
  const configuredFamily = rootStyle.getPropertyValue(variable).trim();
  const renderedFamily = getComputedStyle(document.body).fontFamily.trim();
  const family = configuredFamily && !configuredFamily.includes("var(") ? configuredFamily : renderedFamily;
  if (!family) throw new Error("Font unavailable");
  const font = `24px ${family}`;
  await document.fonts.load(font, text);
  await document.fonts.ready;
  if (!document.fonts.check(font, text)) throw new Error("Font unavailable");
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas unavailable");
  ctx.font = font;
  const lines: string[] = [];
  for (const paragraph of text.split("\n")) {
    let line = "";
    const segments = new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(paragraph);
    for (const { segment } of segments) {
      if (ctx.measureText(line + segment).width > 992 && line) { lines.push(line); line = ""; }
      line += segment;
    }
    lines.push(line);
  }
  if (lines.length > 350) throw new Error("Summary too large for image; use text");
  canvas.width = 1080; canvas.height = 88 + lines.length * 38;
  ctx.fillStyle = "#f7f3e8"; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#242c25"; ctx.font = font; ctx.textBaseline = "top";
  lines.forEach((line, i) => ctx.fillText(line, 44, 44 + i * 38));
  const blob = await new Promise<Blob>((resolve, reject) => canvas.toBlob(b => b ? resolve(b) : reject(new Error("Export failed")), "image/png"));
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a"); link.href = url; link.download = "krishisahay.png"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
