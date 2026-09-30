"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Share2,
  MapPin,
  AlertTriangle,
  TrendingUp,
  Landmark,
  Phone,
  Video,
  CheckCircle2,
  Info,
  SearchX,
  Stethoscope,
  Volume2,
  VolumeX,
  Sparkles,
  PhoneCall,
  ExternalLink,
  RotateCcw,
  BookOpen,
  Wheat,
  Bookmark,
  Printer
} from "lucide-react";
import type { Claim, CropBrief, CropDecision, CropDecisionStep, Evidence } from "@/lib/schemas";
import { safeWebUrl, safePhone, sourcedSummary, exportSummaryImage, whatsappShareUrl } from "@/lib/krishi-share";
import { saveCropCase } from "@/lib/storage/crop-cases";
import { engineLabel } from "@/lib/evidence/trust";

interface BriefViewProps {
  brief: CropBrief | null;
  cropContext: { crop: string; district: string; stage: string; state?: string } | null;
  warnings?: string[];
  mode?: "live" | "recorded";
  saved?: boolean;
  onStartOver?: () => void;
}

type TabKey = "advice" | "market" | "sources" | "support";

export function SourceChip({ source }: { source: Evidence }) {
  const t = useTranslations("Krishi");
  const url = safeWebUrl(source.url);
  return (
    <div className="mt-3 border-t border-ink-soft/20 pt-2.5 text-xs text-ink-soft break-words">
      {url ? (
        <a
          className="text-nil underline font-medium hover:text-nil/80 inline-flex items-center gap-1"
          href={url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {source.title} <ExternalLink className="w-3 h-3 inline" />
        </a>
      ) : (
        <span className="font-medium text-ink">{source.title}</span>
      )}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mt-1 text-[11px] text-ink-soft/90">
        <span>{source.publisher}</span>
        <span>•</span>
        <span className="font-mono text-moss-deep font-medium">Serp API · {engineLabel(source.engine)}</span>
        <span>•</span>
        <span>{t(source.trust)}</span>
      </div>
      <p className="mt-0.5 text-[11px] text-ink-soft/75">
        {t("retrieved")}: {source.retrievedAt} {source.publishedAt ? `• ${t("published")}: ${source.publishedAt}` : ""}
      </p>
    </div>
  );
}

function decisionTone(status: CropDecision["status"]): { card: string; icon: ReactNode; badge: string } {
  switch (status) {
    case "guidance":
      return {
        card: "border-moss/40 bg-gradient-to-b from-[#F7FAF7] to-[#EEF5EE]",
        icon: <CheckCircle2 className="w-7 h-7 text-moss" />,
        badge: "bg-moss/15 text-moss-deep border-moss/30"
      };
    case "watch":
      return {
        card: "border-turmeric/50 bg-gradient-to-b from-[#FFFDF7] to-[#FFF9EC]",
        icon: <AlertTriangle className="w-7 h-7 text-turmeric-deep" />,
        badge: "bg-turmeric/20 text-turmeric-deep border-turmeric/40"
      };
    case "unavailable":
      return {
        card: "border-terracotta/40 bg-[#FFF8F6]",
        icon: <SearchX className="w-7 h-7 text-terracotta" />,
        badge: "bg-terracotta/15 text-terracotta border-terracotta/30"
      };
    default:
      return {
        card: "border-nil/30 bg-[#F7F9FB]",
        icon: <Info className="w-7 h-7 text-nil" />,
        badge: "bg-nil/15 text-nil border-nil/30"
      };
  }
}

function stepIcon(step: CropDecisionStep): ReactNode {
  return step.kind === "treatment" ? (
    <Stethoscope className="w-4 h-4 text-terracotta" />
  ) : step.kind === "contact" ? (
    <Phone className="w-4 h-4 text-nil" />
  ) : (
    <CheckCircle2 className="w-4 h-4 text-moss" />
  );
}

/** Sanitize text for browser speech synthesis so numbers and terms are pronounced naturally */
function cleanTextForSpeech(text: string, locale: string): string {
  let cleaned = text
    .replace(/SerpApi/gi, "Serp A-P-I")
    .replace(/(\d+)\s*[-–—]\s*(\d+)%/g, "$1 to $2 percent")
    .replace(/(\d+)\s*[-–—]\s*(\d+)/g, "$1 to $2")
    .replace(/(\d+)%/g, "$1 percent")
    .replace(/₹/g, "Rupees ")
    .replace(/\bKVK\b/g, "Krishi Vigyan Kendra")
    .replace(/\bICAR\b/g, "I-C-A-R")
    .replace(/\bKCC\b/g, "Kisan Call Centre")
    .replace(/\bAPMC\b/g, "Mandi")
    .replace(/[*_#`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (locale === "hi") {
    cleaned = cleaned
      .replace(/\bto\b/g, "से")
      .replace(/\bpercent\b/g, "प्रतिशत")
      .replace(/Rupees/g, "रुपये")
      .replace(/Krishi Vigyan Kendra/g, "कृषि विज्ञान केंद्र");
  } else if (locale === "bn") {
    cleaned = cleaned
      .replace(/\bto\b/g, "থেকে")
      .replace(/\bpercent\b/g, "শতাংশ")
      .replace(/Rupees/g, "টাকা")
      .replace(/Krishi Vigyan Kendra/g, "কৃষি विज्ञान केंद्र");
  }

  return cleaned;
}

export function BriefView({
  brief,
  cropContext,
  warnings = [],
  mode = "live",
  saved = false,
  onStartOver
}: BriefViewProps) {
  const t = useTranslations("Krishi");
  const locale = useLocale();

  const [activeTab, setActiveTab] = useState<TabKey>("advice");
  const [sharing, setSharing] = useState(false);
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(saved);
  const [speaking, setSpeaking] = useState(false);

  const alive = useRef(false);
  const busy = useRef(false);
  const id = useRef<string | null>(null);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const crop = cropContext?.crop || "";
  const cropDisplay = t.has(`crops.${crop}`) ? t(`crops.${crop}`) : crop;
  const stageDisplay = cropContext && t.has(`stages.${cropContext.stage}`) ? t(`stages.${cropContext.stage}`) : cropContext?.stage || "";
  const heading = t("brief", { crop: cropDisplay });
  const summary = brief
    ? sourcedSummary(brief, `${heading} · ${cropContext?.district || ""} · ${t(mode)}\n${t("original")}`, t("source"))
    : "";

  const perform = async (action: () => Promise<unknown>) => {
    try {
      await action();
      if (alive.current) setNotice(t("copied"));
    } catch {
      if (alive.current) setNotice(t("shareFailed"));
    }
  };

  const save = async () => {
    if (!brief || !cropContext?.state || busy.current) return;
    busy.current = true;
    setSaving(true);
    try {
      id.current ??= crypto.randomUUID();
      await saveCropCase({
        id: id.current,
        module: "krishi",
        version: 1,
        createdAt: new Date().toISOString(),
        locale,
        profile: {
          crop,
          state: cropContext.state,
          district: cropContext.district,
          stage: cropContext.stage
        },
        brief,
        mode,
        warnings
      });
      if (alive.current) {
        setIsSaved(true);
        setNotice(t("saved"));
      }
    } catch {
      if (alive.current) setNotice(t("saveFailed"));
    } finally {
      busy.current = false;
      if (alive.current) setSaving(false);
    }
  };

  const sources = (ids: string[]) => brief?.sources.filter((s) => ids.includes(s.id)) || [];

  const claimView = (claim: Claim, key: number) => {
    const refs = sources(claim.evidenceIds);
    if (!refs.length) return null;
    return (
      <article key={key} className="bg-paper-2 border border-ink-soft/20 rounded-2xl p-5 space-y-2.5 shadow-xs">
        <p className="font-medium text-ink leading-relaxed">{claim.text}</p>
        <blockquote className="text-sm text-ink-soft border-l-2 border-moss/40 pl-3 italic bg-moss/5 py-1 rounded-r">
          “{claim.quote}”
        </blockquote>
        {refs.map((s) => (
          <SourceChip key={s.id} source={s} />
        ))}
      </article>
    );
  };

  const decision = brief?.decision;
  const decisionStyle = decision ? decisionTone(decision.status) : undefined;
  const decisionStepSources = (step: CropDecisionStep) => sources(step.evidenceIds);

  const visibleAlerts = brief?.alerts.filter((alert) => sources(alert.claim.evidenceIds).length) ?? [];
  const visibleActions = brief?.actions.filter((action) => sources(action.evidenceIds).length) ?? [];
  const visibleMarket =
    brief?.market.filter((market) =>
      brief.sources.some(
        (source) => source.id === market.evidenceId || source.id === market.source || source.url === market.source
      )
    ) ?? [];
  const visibleTrend =
    brief?.trend && brief.sources.some((source) => source.id === brief.trend?.evidenceId) ? brief.trend : null;
  const visibleSchemes =
    brief?.schemes.filter((scheme) =>
      brief.sources.some((source) => source.id === scheme.evidenceId || source.url === scheme.url)
    ) ?? [];
  const visibleSupport = brief?.support.filter((place) => sources([place.evidenceId]).length) ?? [];
  const visibleVideos =
    brief?.videos.filter((video) => brief.sources.some((source) => source.id === video.evidenceId)) ?? [];

  // Toggle browser text-to-speech audio voice output
  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    if (!decision) return;

    window.speechSynthesis.cancel();
    const rawText =
      `${decision.headline}. ${decision.summary}. ${decision.labels.doNow}: ` +
      decision.steps.map((step, idx) => `Step ${idx + 1}: ${step.text}`).join(". ") +
      `. ${decision.labels.nextStep}: ${decision.nextStep}.` +
      (brief?.kisanCallCentre ? ` Kisan Call Centre: ${brief.kisanCallCentre.phone}` : "");

    const cleanedText = cleanTextForSpeech(rawText, locale);
    const utterance = new SpeechSynthesisUtterance(cleanedText);
    const langMap: Record<string, string> = { hi: "hi-IN", bn: "bn-IN", en: "en-IN" };
    utterance.lang = langMap[locale] || "en-IN";
    utterance.rate = 0.88; // Relaxed, calming, easy to understand rate

    utterance.onend = () => {
      if (alive.current) setSpeaking(false);
    };
    utterance.onerror = () => {
      if (alive.current) setSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const audioButtonLabel = speaking
    ? locale === "hi"
      ? "आवाज रोकें"
      : locale === "bn"
      ? "পড়া বন্ধ করুন"
      : "Stop Voice"
    : locale === "hi"
    ? "आवाज में सुनें"
    : locale === "bn"
    ? "পড়ে শোনান"
    : "Listen to Advice";

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-8">
      {/* Top Banner & Header Card (Matching MediShield style) */}
      <div className="bg-paper-2 border-[1.5px] border-ink rounded-[20px] p-6 shadow-print relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-moss/10 text-moss-deep font-semibold text-xs tracking-wide uppercase flex items-center gap-1.5">
                <Wheat className="w-3.5 h-3.5 text-moss" />
                {cropDisplay}
              </span>
              <span className="px-3 py-1 rounded-full bg-paper border border-ink-soft/30 text-ink text-xs font-medium flex items-center gap-1">
                <MapPin className="w-3 h-3 text-moss" />
                {cropContext?.district}
                {cropContext?.state ? `, ${cropContext.state}` : ""}
              </span>
              <span className="px-3 py-1 rounded-full bg-paper border border-ink-soft/30 text-ink text-xs font-medium">
                {t("stage")}: {stageDisplay}
              </span>
              {decisionStyle && decision && (
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${decisionStyle.badge}`}>
                  {decision.labels.conclusion}
                </span>
              )}
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-ink pt-1 font-semibold">
              {decision?.headline || heading}
            </h1>
            <p className="text-ink-soft text-xs md:text-sm">
              Live agronomic guidance synthesized from official ICAR, Agromet, and district Krishi Vigyan Kendra advisories verified via Serp API.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {decision && (
              <Button
                variant={speaking ? "primary" : "secondary"}
                onClick={handleToggleSpeech}
                className={`text-sm ${
                  speaking
                    ? "bg-terracotta hover:bg-terracotta/90 text-paper animate-pulse"
                    : "border-ink text-ink hover:bg-moss/10 hover:text-moss-deep hover:border-moss"
                }`}
              >
                {speaking ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2 text-moss" />}
                {audioButtonLabel}
              </Button>
            )}

            {brief && (
              <Button
                variant="secondary"
                size="sm"
                onClick={save}
                disabled={saving || isSaved}
                className="text-xs"
              >
                <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                {isSaved ? t("saved") : saving ? t("loading") : t("save")}
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              disabled={!brief}
              onClick={() => setSharing(!sharing)}
              className="text-xs"
            >
              <Share2 className="w-3.5 h-3.5 mr-1.5" />
              {t("share")}
            </Button>

            {onStartOver && (
              <Button variant="quiet" size="sm" onClick={onStartOver} className="text-xs text-ink-soft hover:text-ink">
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> {t("retry")}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Segmented Navigation Tab Bar */}
      <div className="flex border-b-[1.5px] border-ink-soft/30 gap-1 overflow-x-auto bg-paper-2 p-1.5 rounded-2xl border-[1.5px] border-ink">
        <button
          type="button"
          onClick={() => setActiveTab("advice")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "advice"
              ? "bg-moss text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{locale === "hi" ? "मुख्य निष्कर्ष और जरूरी कदम" : locale === "bn" ? "সারসংক্ষেপ ও করণীয়" : "Conclusion & Advice"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("market")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "market"
              ? "bg-moss text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-moss" />
          <span>{locale === "hi" ? "मंडी भाव और रुझान" : locale === "bn" ? "মান্ডি দর ও ট্রেন্ডস" : "Mandi Prices & Trends"}</span>
          {visibleMarket.length > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${
              activeTab === "market" ? "bg-paper text-moss" : "bg-moss/20 text-moss-deep"
            }`}>
              {visibleMarket.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "sources"
              ? "bg-moss text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <BookOpen className="w-4 h-4 text-nil" />
          <span>{locale === "hi" ? "सत्यापित स्रोत (Serp API)" : locale === "bn" ? "যাচাইকৃত তথ্যসূত্র (Serp API)" : "Verified Sources (Serp API)"}</span>
          <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${
            activeTab === "sources" ? "bg-paper text-moss" : "bg-ink/10 text-ink"
          }`}>
            {brief?.sources.length || 0}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("support")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "support"
              ? "bg-moss text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>{locale === "hi" ? "केवीके व सरकारी योजनाएं" : locale === "bn" ? "কেভিকে ও সরকারি প্রকল্প" : "KVKs & Govt Schemes"}</span>
        </button>
      </div>

      {/* Share Drawer Card */}
      {sharing && (
        <div className="space-y-3 bg-paper-2 p-5 rounded-2xl border-[1.5px] border-ink shadow-sm animate-in fade-in duration-200">
          <div className="flex justify-between items-center">
            <p className="text-sm font-semibold text-ink">{t("shareNote")}</p>
            <Button variant="quiet" size="sm" onClick={() => setSharing(false)} className="text-xs">
              ✕
            </Button>
          </div>
          <textarea
            aria-label={t("share")}
            readOnly
            value={summary}
            className="w-full min-h-36 border border-ink-soft/30 rounded-xl p-3 bg-paper text-xs font-mono text-ink"
          />
          <div className="flex flex-wrap gap-2.5 items-center">
            <Button variant="secondary" className="text-xs py-1.5 px-3" onClick={() => perform(() => navigator.clipboard.writeText(summary))}>
              {t("copy")}
            </Button>
            {whatsappShareUrl(summary) && (
              <a
                className="inline-flex items-center px-3.5 py-1.5 rounded-lg bg-[#25D366] text-white font-medium text-xs hover:bg-[#20ba5a] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
                href={whatsappShareUrl(summary)}
              >
                {t("whatsapp")}
              </a>
            )}
            <Button
              variant="secondary"
              className="text-xs py-1.5 px-3"
              onClick={async () => {
                try {
                  await exportSummaryImage(summary, locale);
                  if (alive.current) setNotice(t("imageReady"));
                } catch {
                  if (alive.current) setNotice(t("shareFailed"));
                }
              }}
            >
              {t("image")}
            </Button>
            <Button
              variant="secondary"
              className="text-xs py-1.5 px-3"
              onClick={() => window.print()}
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Print Summary
            </Button>
          </div>
          {notice && <p role="status" className="text-xs text-moss font-semibold">{notice}</p>}
        </div>
      )}

      {brief?.refusal && (
        <div role="alert" className="rounded-2xl border-2 border-terracotta bg-terracotta/10 p-5 text-ink">
          <strong className="text-terracotta text-lg">{t("refusal")}</strong>
          <p className="mt-2 leading-relaxed">{brief.refusal}</p>
        </div>
      )}

      {/* TAB 1: CONCLUSION & ACTION STEPS */}
      {activeTab === "advice" && decision && decisionStyle && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Main Hero Card */}
          <section
            aria-labelledby="krishi-conclusion"
            className={`rounded-3xl border-[2px] p-6 sm:p-8 ${decisionStyle.card} relative overflow-hidden shadow-sm`}
          >
            <div className="flex gap-4 items-start">
              <div className="shrink-0 mt-0.5">{decisionStyle.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-3">
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${decisionStyle.badge}`}>
                    {decision.labels.conclusion}
                  </span>
                  {speaking && (
                    <span className="text-xs text-terracotta font-medium animate-pulse flex items-center gap-1.5 bg-terracotta/10 px-2.5 py-0.5 rounded-full">
                      <Volume2 className="w-3.5 h-3.5" /> Playing voice...
                    </span>
                  )}
                </div>

                <h2 id="krishi-conclusion" className="font-display text-2xl sm:text-3xl text-ink mt-3 font-semibold leading-snug">
                  {decision.headline}
                </h2>

                {/* Plain Language Summary */}
                <div className="text-base sm:text-lg mt-4 leading-relaxed text-ink/90 whitespace-pre-line bg-paper/70 p-5 rounded-2xl border border-ink-soft/15">
                  {decision.summary}
                </div>

                <p className="text-xs text-ink-soft/90 mt-3 italic">
                  {decision.labels.serpApiNote || "Suggestions and conclusions are based on public web searches conducted using Serp API."}
                </p>
              </div>
            </div>

            {/* ACTION STEPS SECTION */}
            <div className="mt-8 border-t border-ink-soft/20 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display text-xl sm:text-2xl text-ink font-semibold flex items-center gap-2">
                  <span>{decision.labels.doNow}</span>
                </h3>
                <span className="text-xs text-ink-soft font-mono bg-paper-2 border border-ink-soft/20 px-2.5 py-1 rounded-full">
                  {decision.steps.length} {locale === "hi" ? "कदम" : locale === "bn" ? "টি পদক্ষেপ" : "Steps"}
                </span>
              </div>

              <div className="space-y-4">
                {decision.steps.map((step, index) => {
                  const refs = decisionStepSources(step);
                  const isContact = step.kind === "contact";

                  return (
                    <article
                      key={`${step.kind}-${index}`}
                      className={`rounded-2xl border p-5 transition-all shadow-xs ${
                        isContact
                          ? "bg-nil/10 border-nil/30"
                          : step.sourceBacked
                          ? "bg-[#FCFDFB] border-moss/30"
                          : "bg-paper border-ink-soft/20"
                      }`}
                    >
                      <div className="flex gap-4 items-start">
                        <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                          <div className="w-8 h-8 rounded-full bg-paper-2 border border-ink-soft/30 flex items-center justify-center font-bold text-sm text-ink shadow-xs">
                            {index + 1}
                          </div>
                          <div className="mt-0.5">{stepIcon(step)}</div>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                                step.sourceBacked
                                  ? "bg-moss/20 text-moss-deep"
                                  : isContact
                                  ? "bg-nil/20 text-nil"
                                  : "bg-ink-soft/15 text-ink"
                              }`}
                            >
                              {step.sourceBacked
                                ? locale === "hi"
                                  ? "वेब स्रोत से सत्यापित"
                                  : locale === "bn"
                                  ? "উৎস থেকে যাচাইকৃত"
                                  : "Verified from Search"
                                : isContact
                                ? locale === "hi"
                                  ? "मुफ्त हेल्पलाइन"
                                  : locale === "bn"
                                  ? "বিনামূল্যে হেল্পলাইন"
                                  : "Free Helpline"
                                : locale === "hi"
                                ? "व्यावहारिक कृषि परामर्श"
                                : locale === "bn"
                                ? "ব্যবহারিক পরামর্শ"
                                : "Practical Farm Guidance"}
                            </span>
                          </div>

                          <p className="font-medium text-ink leading-relaxed text-base sm:text-lg">{step.text}</p>

                          {step.quote && (
                            <blockquote className="text-xs sm:text-sm text-ink-soft mt-2.5 border-l-2 border-moss/60 pl-3 italic bg-moss/5 py-1.5 rounded-r">
                              “{step.quote}”
                            </blockquote>
                          )}

                          {refs.length > 0 && (
                            <div className="mt-2.5">
                              {refs.map((source) => (
                                <SourceChip key={source.id} source={source} />
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Best Next Step & Coverage */}
              <div className="mt-6 bg-paper/70 rounded-2xl p-4 sm:p-5 border border-ink-soft/20 text-sm space-y-1.5">
                <p className="text-ink">
                  <strong className="text-moss-deep font-semibold">{decision.labels.nextStep}:</strong>{" "}
                  {decision.nextStep}
                </p>
                <p className="text-xs text-ink-soft">{decision.labels.coverage}</p>
              </div>
            </div>
          </section>

          {/* National Kisan Call Centre Toll-Free Banner */}
          {brief?.kisanCallCentre && (
            <section className="bg-gradient-to-r from-moss/15 via-moss/10 to-moss/5 border-[1.5px] border-moss/30 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-moss-deep">
                  National Agricultural Toll-Free Helpline
                </span>
                <h3 className="font-display text-xl sm:text-2xl text-ink font-semibold mt-0.5">
                  {brief.kisanCallCentre.name}
                </h3>
                <p className="text-xs sm:text-sm text-ink-soft mt-1">
                  Free call, 6:00 AM to 10:00 PM daily in all regional Indian languages.
                </p>
              </div>
              <a
                className="inline-flex items-center gap-2.5 bg-moss hover:bg-moss-deep text-paper font-bold px-6 py-3.5 rounded-2xl shadow-md transition-transform hover:scale-105 shrink-0"
                href={`tel:${brief.kisanCallCentre.phone}`}
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call {brief.kisanCallCentre.phone}</span>
              </a>
            </section>
          )}

          {/* Active News or Weather Alerts if present */}
          {visibleAlerts.length > 0 && (
            <section className="mt-6">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink mb-3 font-semibold">
                <AlertTriangle className="w-5 h-5 text-terracotta" />
                {t("alerts")}
              </h2>
              <div className="space-y-3">{visibleAlerts.map((a, i) => claimView(a.claim, i))}</div>
            </section>
          )}

          {/* Official Advisory Actions from Serp API if present */}
          {visibleActions.length > 0 && (
            <section className="mt-6">
              <h2 className="flex items-center gap-2 font-display text-xl text-ink mb-3 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-moss" />
                {t("actions")}
              </h2>
              <div className="space-y-3">{visibleActions.map((a, i) => claimView(a, i))}</div>
            </section>
          )}

          {/* Quick Action Footer Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-ink-soft/20 bg-paper-2 p-5 rounded-2xl border-[1.5px] border-ink">
            <div className="text-xs text-ink-soft">
              <span className="font-semibold text-ink">Household Protection:</span> This advisory can be saved locally on your device or printed for your village cooperative.
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button
                variant="primary"
                className="bg-moss hover:bg-moss-deep text-paper"
                onClick={save}
                disabled={saving || isSaved}
              >
                <Bookmark className="w-4 h-4 mr-1.5" />
                {isSaved ? "Saved to Dashboard" : "Save to Dashboard"}
              </Button>
              {whatsappShareUrl(summary) && (
                <a
                  className="inline-flex items-center px-4 py-2 rounded-xl bg-[#25D366] text-white font-medium text-sm hover:bg-[#20ba5a] transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  href={whatsappShareUrl(summary)}
                >
                  <Share2 className="w-4 h-4 mr-1.5" /> Share on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MANDI PRICES & MARKET TRENDS */}
      {activeTab === "market" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Market Prices */}
          {visibleMarket.length > 0 ? (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="flex items-center gap-2 font-display text-2xl text-ink font-semibold">
                  <TrendingUp className="w-6 h-6 text-moss" />
                  {t("market")}
                </h2>
                <span className="text-xs text-ink-soft font-mono bg-paper-2 border border-ink-soft/20 px-2.5 py-1 rounded-full">
                  Official Mandi Feed
                </span>
              </div>
              <div className="space-y-4">
                {visibleMarket.map((m, i) => {
                  const refs = brief!.sources.filter(
                    (s) => s.id === m.evidenceId || s.id === m.source || s.url === m.source
                  );
                  return (
                    <article key={i} className="bg-paper-2 border-[1.5px] border-ink rounded-2xl p-6 shadow-xs">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-moss/10 text-moss text-xs font-semibold uppercase">
                              APMC Mandi
                            </span>
                            <span className="text-xs text-ink-soft">{m.date}</span>
                          </div>
                          <p className="font-display text-2xl text-ink font-semibold mt-1">{m.marketName}</p>
                          <p className="text-xs text-ink-soft mt-0.5">Commodity: {cropDisplay}</p>
                        </div>
                        <div className="sm:text-right bg-paper p-3 rounded-xl border border-ink-soft/20">
                          <span className="text-xs text-ink-soft block">Modal Price</span>
                          <span className="text-3xl font-bold font-mono text-moss">{m.price}</span>
                          <span className="text-xs text-ink-soft ml-1">/ {m.unit}</span>
                        </div>
                      </div>
                      {refs.map((s) => (
                        <SourceChip key={s.id} source={s} />
                      ))}
                    </article>
                  );
                })}
              </div>
            </section>
          ) : (
            <div className="p-8 text-center bg-paper-2 rounded-2xl border border-ink-soft/20 space-y-2">
              <TrendingUp className="w-10 h-10 text-ink-soft/40 mx-auto" />
              <p className="font-semibold text-ink">{t("empty")}</p>
              <p className="text-sm text-ink-soft">No live mandi rate card published online for this district today.</p>
            </div>
          )}

          {/* Google Trends Search Interest Signal */}
          {visibleTrend ? (
            <section>
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink mb-4 font-semibold">
                <TrendingUp className="w-6 h-6 text-moss" />
                {t("trend")}
              </h2>
              <article className="bg-paper-2 border-[1.5px] border-ink rounded-2xl p-6 shadow-xs space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-moss-deep bg-moss/15 px-2.5 py-0.5 rounded-full">
                      Serp API Google Trends
                    </span>
                    <p className="font-medium text-ink text-xl mt-1.5">{t(visibleTrend.signal)} Regional Interest</p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-moss font-bold text-3xl">{visibleTrend.value}</span>
                    <span className="text-xs text-ink-soft font-mono"> / 100</span>
                  </div>
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full bg-paper rounded-full h-3 border border-ink-soft/20 overflow-hidden">
                  <div
                    className="bg-moss h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(5, visibleTrend.value))}%` }}
                  />
                </div>

                <p className="text-sm text-ink-soft leading-relaxed">
                  {t("trendProxy", { region: visibleTrend.region, window: visibleTrend.window })}
                </p>
              </article>
            </section>
          ) : (
            <div className="p-6 bg-paper-2 rounded-2xl border border-ink-soft/20 text-xs text-ink-soft">
              {t("trendEmptyDetail")}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VERIFIED SOURCES (SERP API) */}
      {activeTab === "sources" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="bg-paper-2 border-[1.5px] border-ink rounded-2xl p-6 shadow-xs">
            <h2 className="font-display text-2xl text-ink font-semibold">{t("sources")}</h2>
            <p className="text-sm text-ink-soft mt-1 leading-relaxed">
              {brief?.sources.length || 0} public web sources retrieved in real-time via Serp API (Google Search, Google News, Google Maps, YouTube, and Google Trends) and filtered through strict official domain and relevance guardrails.
            </p>
            <p className="text-xs text-ink-soft/90 mt-2 italic border-t border-ink-soft/15 pt-2">
              Suggestions and conclusions are based on public web searches conducted using Serp API.
            </p>
          </div>

          <div className="space-y-4">
            {brief?.sources.map((source) => (
              <article key={source.id} className="bg-paper-2 border-[1.5px] border-ink-soft/30 rounded-2xl p-5 shadow-xs hover:border-moss transition-colors">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-full bg-moss/10 text-moss">
                    Serp API · {engineLabel(source.engine)}
                  </span>
                  <span className="text-xs text-ink-soft">{source.retrievedAt}</span>
                </div>
                <h3 className="font-display text-lg text-ink font-semibold">{source.title}</h3>
                <p className="text-sm text-ink-soft mt-2 leading-relaxed">{source.snippet}</p>
                <SourceChip source={source} />
              </article>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: KVKS & GOVERNMENT SCHEMES */}
      {activeTab === "support" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* National Kisan Call Centre Banner */}
          {brief?.kisanCallCentre && (
            <section className="bg-gradient-to-r from-moss/15 via-moss/10 to-moss/5 border-[1.5px] border-moss/30 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-moss-deep">
                  Toll-Free Agricultural Helpline
                </span>
                <h3 className="font-display text-2xl text-ink font-semibold mt-0.5">
                  {brief.kisanCallCentre.name}
                </h3>
                <p className="text-sm text-ink-soft mt-1">
                  Available free of cost from 6:00 AM to 10:00 PM daily across all Indian states and languages.
                </p>
              </div>
              <a
                className="inline-flex items-center gap-2 bg-moss hover:bg-moss-deep text-paper font-bold px-6 py-3.5 rounded-2xl shadow-md transition-transform hover:scale-105 shrink-0"
                href={`tel:${brief.kisanCallCentre.phone}`}
              >
                <PhoneCall className="w-5 h-5" />
                <span>Call {brief.kisanCallCentre.phone}</span>
              </a>
            </section>
          )}

          {/* Local KVK / Support Offices */}
          {visibleSupport.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink mb-4 font-semibold">
                <MapPin className="w-6 h-6 text-moss" />
                {t("support")}
              </h2>
              <div className="space-y-4">
                {visibleSupport.map((p, i) => {
                  const refs = sources([p.evidenceId]);
                  if (!refs.length) return null;
                  const map = safeWebUrl(p.mapsUrl);
                  const phone = safePhone(p.phone);
                  const verifiedPhone =
                    phone &&
                    refs.some(
                      (s) =>
                        safePhone(s.maps?.phone) === phone ||
                        s.snippet.replace(/[^\d]/g, "").includes(phone.replace(/\D/g, ""))
                    );
                  return (
                    <article key={i} className="bg-paper-2 border-[1.5px] border-ink rounded-2xl p-6 shadow-xs">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                        <div>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-moss/10 text-moss uppercase">
                            Official Agricultural Extension
                          </span>
                          <h3 className="font-display text-xl text-ink font-semibold mt-1">{p.name}</h3>
                          <p className="text-sm text-ink-soft mt-1">{p.address}</p>
                          {p.hoursText && <p className="text-xs text-ink-soft mt-1">Hours: {p.hoursText}</p>}
                        </div>
                        <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                          {map && (
                            <a
                              href={map}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-nil/40 text-nil text-xs font-medium hover:bg-nil/5"
                            >
                              <MapPin className="w-3.5 h-3.5" /> {t("map")} <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          {verifiedPhone && (
                            <a
                              href={`tel:${phone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-moss/10 text-moss font-semibold text-xs hover:bg-moss/20"
                            >
                              <PhoneCall className="w-3.5 h-3.5" /> Call {phone}
                            </a>
                          )}
                        </div>
                      </div>
                      {refs.map((s) => (
                        <SourceChip key={s.id} source={s} />
                      ))}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Government Schemes */}
          {visibleSchemes.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink mb-4 font-semibold">
                <Landmark className="w-6 h-6 text-turmeric-deep" />
                {t("schemes")}
              </h2>
              <div className="space-y-4">
                {visibleSchemes.map((s, i) => {
                  const refs = brief!.sources.filter((e) => e.id === s.evidenceId || e.url === s.url);
                  return (
                    <article key={i} className="bg-paper-2 border-[1.5px] border-ink rounded-2xl p-6 shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-turmeric/20 text-turmeric-deep uppercase">
                          Government Welfare Scheme
                        </span>
                        {s.deadline && <span className="text-xs text-terracotta font-semibold">Deadline: {s.deadline}</span>}
                      </div>
                      <h3 className="font-display text-xl text-ink font-semibold">{s.name}</h3>
                      <p className="text-sm text-ink mt-2 leading-relaxed">{s.description}</p>
                      <div className="mt-3 p-3 bg-paper rounded-xl border border-ink-soft/20 text-xs text-ink-soft">
                        <strong className="text-ink font-medium">Eligibility: </strong>
                        {s.eligibility}
                      </div>
                      {refs.map((e) => (
                        <SourceChip key={e.id} source={e} />
                      ))}
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* Advisory Videos */}
          {visibleVideos.length > 0 && (
            <section>
              <h2 className="flex items-center gap-2 font-display text-2xl text-ink mb-4 font-semibold">
                <Video className="w-6 h-6 text-nil" />
                {t("videos")}
              </h2>
              <div className="space-y-4">
                {visibleVideos.map((video) => {
                  const source = brief!.sources.find((s) => s.id === video.evidenceId);
                  return (
                    <article key={video.evidenceId} className="bg-paper-2 border-[1.5px] border-ink rounded-2xl p-6 shadow-xs">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded bg-nil/10 text-nil font-mono">
                          YouTube (Serp API)
                        </span>
                        <span className="text-xs text-ink-soft">{video.channelName}</span>
                        {video.duration && <span className="text-xs text-ink-soft">· {video.duration}</span>}
                      </div>
                      <a
                        className="text-nil underline font-semibold text-lg hover:text-nil/80 block mt-1"
                        href={safeWebUrl(video.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {video.title} <ExternalLink className="w-3.5 h-3.5 inline" />
                      </a>
                      <p className="text-sm text-ink-soft mt-2">{video.description}</p>
                      {source && <SourceChip source={source} />}
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Global Safety Disclaimers */}
      <div className="bg-paper-2 border-[1.5px] border-ink-soft/30 rounded-2xl p-6 text-xs sm:text-sm text-ink-soft space-y-2">
        <strong className="text-ink font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-turmeric-deep" /> {t("disclaimer")}
        </strong>
        {brief?.disclaimers.map((d, i) => (
          <p key={i} className="leading-relaxed">
            {d}
          </p>
        ))}
        <p className="text-xs text-ink-soft/80 pt-3 border-t border-ink-soft/20 italic">
          Suggestions and conclusions are based on public web searches conducted using Serp API.
        </p>
      </div>
    </div>
  );
}
