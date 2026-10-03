"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  ShieldAlert,
  AlertTriangle,
  Volume2,
  VolumeX,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Share2,
  Phone,
  Bookmark,
  RotateCcw,
  CheckCircle,
  Smartphone,
  Globe,
  Radio
} from "lucide-react";
import type { Evidence, SurakshaDecision } from "@/lib/schemas";
import { safeWebUrl, safePhone } from "@/lib/krishi-share";
import { engineLabel } from "@/lib/evidence/trust";

interface SurakshaResultsProps {
  decision: SurakshaDecision;
  evidence: Evidence[];
  content: string;
  sourceType: string;
  onStartOver?: () => void;
  onSave?: () => void;
  saved?: boolean;
}

type TabKey = "verdict" | "sources" | "redressal" | "villageCard";

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/SerpApi/gi, "Serp A-P-I")
    .replace(/Chakshu/gi, "Chakshu portal")
    .replace(/Sanchar Saathi/gi, "Sanchar Saathi")
    .replace(/1930/g, "1 9 3 0")
    .replace(/₹/g, "Rupees ")
    .replace(/\.apk/gi, "dot A-P-K file")
    .replace(/[*_#`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function SurakshaResults({
  decision,
  evidence,
  content,
  sourceType,
  onStartOver,
  onSave,
  saved
}: SurakshaResultsProps) {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabKey>("verdict");
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedWarning, setCopiedWarning] = useState(false);
  const [speechSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleToggleSpeech = () => {
    if (!speechSupported || !decision) return;
    const synth = window.speechSynthesis;

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    synth.cancel();
    const textToSpeak = cleanTextForSpeech(decision.speechSummary || `${decision.headline}. ${decision.summary}`);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    const voices = synth.getVoices();
    const langCode = locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN";
    const matchedVoice = voices.find((v) => v.lang === langCode || v.lang.startsWith(locale));
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.rate = 0.95;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synth.speak(utterance);
    setIsPlaying(true);
  };

  const handleCopyWarning = async () => {
    try {
      await navigator.clipboard.writeText(decision.warningMessage);
      setCopiedWarning(true);
      setTimeout(() => setCopiedWarning(false), 2500);
    } catch {
      // Fallback
    }
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(decision.warningMessage);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const isDanger = decision.verdict === "danger";
  const isSafe = decision.verdict === "safe";

  const bannerColor = isDanger
    ? "bg-red-50/80 border-red-600 text-red-950"
    : isSafe
      ? "bg-emerald-50/80 border-emerald-600 text-emerald-950"
      : "bg-amber-50/80 border-amber-600 text-amber-950";

  const badgeColor = isDanger
    ? "bg-red-600 text-white"
    : isSafe
      ? "bg-emerald-600 text-white"
      : "bg-amber-600 text-white";

  const verdictLabel = isDanger
    ? locale === "hi"
      ? "उच्च साइबर खतरा"
      : locale === "bn"
        ? "উচ্চ সাইবার ঝুঁকি"
        : "HIGH RISK THREAT"
    : isSafe
      ? locale === "hi"
      ? "सत्यापित सुरक्षित स्रोत"
      : locale === "bn"
        ? "যাচাইকৃত নিরাপদ উৎস"
        : "OFFICIALLY VERIFIED"
      : locale === "hi"
        ? "सतर्कता आवश्यक"
        : locale === "bn"
          ? "সতর্কতা প্রয়োজন"
          : "CAUTION REQUIRED";

  const labels = decision.labels || {};

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-4 shadow-[2px_2px_0_0_#1b382b]">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink/70">
            Channel: <span className="text-ink font-black capitalize">{sourceType}</span>
          </span>
          <span className="text-ink/30">•</span>
          <span className="text-xs text-ink/70">
            {evidence.length} sources reviewed via Serp API
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onSave && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onSave}
              className={`rounded-full text-xs font-bold border-ink/40 gap-1.5 transition-all ${
                saved ? "bg-emerald-100 text-emerald-900 border-emerald-500" : "hover:bg-paper-2"
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${saved ? "fill-emerald-800" : ""}`} />
              {saved
                ? locale === "hi"
                  ? "सहेजा गया"
                  : locale === "bn"
                    ? "সংরক্ষিত"
                    : "Saved to Cases"
                : locale === "hi"
                  ? "केस सहेजें"
                  : locale === "bn"
                    ? "কেস সংরক্ষণ করুন"
                    : "Save Case"}
            </Button>
          )}

          {onStartOver && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onStartOver}
              className="rounded-full text-xs font-bold border-ink/40 hover:bg-paper-2 gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {locale === "hi" ? "नया चेक" : locale === "bn" ? "নতুন চেক" : "New Check"}
            </Button>
          )}
        </div>
      </div>

      {/* Main Verdict Card */}
      <div className={`border-2 rounded-[24px] p-6 md:p-8 shadow-[4px_4px_0_0_#1b382b] transition-all ${bannerColor}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1 rounded-full text-xs font-black tracking-wider uppercase shadow-sm ${badgeColor}`}>
              {verdictLabel}
            </span>
            <div className="flex items-center gap-1.5 text-xs font-bold text-ink/80 bg-paper px-3 py-1 rounded-full border border-ink/15">
              <span>{labels.riskScore || "Risk Score"}:</span>
              <span className={`font-black ${isDanger ? "text-red-700" : isSafe ? "text-emerald-700" : "text-amber-700"}`}>
                {decision.riskScore}%
              </span>
            </div>
          </div>

          {speechSupported && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleToggleSpeech}
              className="rounded-full text-xs font-bold border-ink/30 bg-paper hover:bg-white text-ink gap-2 shadow-sm"
            >
              {isPlaying ? (
                <>
                  <VolumeX className="w-4 h-4 text-red-600 animate-pulse" />
                  {labels.speechStop || "Stop Audio"}
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-forest" />
                  {labels.speechPlay || "Listen to Safety Advisory"}
                </>
              )}
            </Button>
          )}
        </div>

        <h3 className="text-2xl md:text-3xl font-serif font-black mb-3 tracking-tight">
          {decision.headline}
        </h3>
        <p className="text-sm md:text-base leading-relaxed font-sans mb-4 max-w-3xl opacity-90">
          {decision.summary}
        </p>

        {/* Quick Official Guarantee Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-paper border border-ink/20 text-xs font-bold text-forest">
          <CheckCircle className="w-4 h-4 text-forest" />
          <span>{labels.freeSchemeBadge || "Official Guarantee: Central & State Schemes are 100% Free"}</span>
        </div>
      </div>

      {/* Segmented 4-Tab Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-1.5 bg-paper-2 border-[1.5px] border-ink rounded-[18px]">
        {[
          { id: "verdict" as const, label: labels.tabVerdict || "Verdict & Threats", icon: ShieldAlert },
          { id: "sources" as const, label: labels.tabSources || "Verified Sources", icon: Globe },
          { id: "redressal" as const, label: labels.tabRedressal || "Report (Chakshu/1930)", icon: Phone },
          { id: "villageCard" as const, label: labels.tabVillageCard || "Village Warning Card", icon: Share2 }
        ].map((tab) => {
          const Icon = tab.icon;
          const isCurrent = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-[12px] text-xs md:text-sm font-bold transition-all ${
                isCurrent
                  ? "bg-forest text-paper-1 shadow-[2px_2px_0_0_#1b382b]"
                  : "text-ink/70 hover:text-ink hover:bg-paper-1"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Verdict & Threat Analysis */}
      {activeTab === "verdict" && (
        <div className="space-y-4">
          <div className="bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-6 shadow-[2px_2px_0_0_#1b382b]">
            <h4 className="text-base font-bold text-ink mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-ochre" />
              {locale === "hi"
                ? "पहचाने गए खतरे एवं पैटर्न"
                : locale === "bn"
                  ? "সনাক্ত করা ঝুঁকি ও প্যাটার্ন"
                  : "Detected Threat Indicators & Patterns"}
            </h4>

            {decision.patterns.length === 0 ? (
              <div className="p-4 rounded-[14px] bg-emerald-50 border border-emerald-300 text-xs text-emerald-900 font-medium">
                No high-risk scam patterns detected in this message.
              </div>
            ) : (
              <div className="grid gap-3">
                {decision.patterns.map((pattern, idx) => {
                  const isCrit = pattern.severity === "critical";
                  const isWarn = pattern.severity === "warning";
                  return (
                    <div
                      key={idx}
                      className={`p-4 rounded-[16px] border transition-all ${
                        isCrit
                          ? "bg-red-50/70 border-red-300 text-red-950"
                          : isWarn
                            ? "bg-amber-50/70 border-amber-300 text-amber-950"
                            : "bg-blue-50/70 border-blue-300 text-blue-950"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-bold text-sm flex items-center gap-2">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCrit ? "bg-red-600" : isWarn ? "bg-amber-600" : "bg-blue-600"
                            }`}
                          />
                          {pattern.title}
                        </span>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isCrit
                              ? "bg-red-200 text-red-900"
                              : isWarn
                                ? "bg-amber-200 text-amber-900"
                                : "bg-blue-200 text-blue-900"
                          }`}
                        >
                          {pattern.severity}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed opacity-90 mb-2">
                        {pattern.description}
                      </p>
                      {pattern.matchedText && (
                        <div className="text-[11px] font-mono bg-paper p-2 rounded-[8px] border border-ink/15 text-ink/80">
                          Matched: <span className="font-bold text-red-700">{pattern.matchedText}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Spoon-Fed Immediate Action Checklist */}
          <div className="bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-6 shadow-sm space-y-4">
            <h4 className="text-base font-bold text-ink flex items-center gap-2">
              <span>🚨</span>
              <span>
                {locale === "hi"
                  ? "अब आपको क्या करना चाहिए (तत्काल जरूरी कदम)"
                  : locale === "bn"
                  ? "এখন আপনার কী করা উচিত (তাত্ক্ষণিক প্রয়োজনীয় পদক্ষেপ)"
                  : "Immediate Action Checklist (What to do Right Now)"}
              </span>
            </h4>
            
            <div className="space-y-3 text-xs md:text-sm">
              <div className="p-3.5 rounded-xl bg-red-50/80 border border-red-200 flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">1</span>
                <div>
                  <div className="font-bold text-red-950">
                    {locale === "hi" ? "लिंक पर क्लिक न करें, कोई ऐप न डालें और ओटीपी न दें" : locale === "bn" ? "কোনো লিঙ্কে ক্লিক করবেন না এবং ওটিপি দেবেন না" : "Do Not Click Links, Install .APK, or Share OTP"}
                  </div>
                  <p className="text-red-900/80 text-xs mt-0.5 leading-relaxed">
                    {locale === "hi" 
                      ? "सरकारी योजनाएं पूरी तरह निःशुल्क होती हैं। यदि आपने पहले से कोई .apk डाउनलोड कर ली है, तो फोन की Settings > Apps में जाकर उसे तुरंत 'Uninstall' करें।" 
                      : locale === "bn"
                      ? "সরকারি প্রকল্প সম্পূর্ণ বিনামূল্যে পাওয়া যায়। যদি কোনো .apk ফাইল ডাউনলোড করে থাকেন, তবে ফোন সেটিংস থেকে অবিলম্বে তা আনইনস্টল করুন।"
                      : "Official schemes are 100% free. If an .apk was already downloaded, immediately go to Settings > Apps on your phone and Uninstall it."}
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-paper-2 border border-ink/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">2</span>
                  <div>
                    <div className="font-bold text-ink">
                      {locale === "hi" ? "यदि खाते से पैसे कट गए हैं: 1930 पर तुरंत कॉल करें" : locale === "bn" ? "টাকা কেটে নেওয়া হলে: তৎক্ষণাৎ ১৯৩০ নম্বরে কল করুন" : "If Money Was Debited: Dial 1930 Within Golden Hour"}
                    </div>
                    <p className="text-ink-soft text-xs mt-0.5">
                      {locale === "hi" ? "पुलिस व बैंक फ्रॉड डेस्क तुरंत जालसाज के खाते को फ्रीज कर सकते हैं।" : locale === "bn" ? "পুলিশ ও ব্যাংক ফ্রড সেল জালিয়াতদের অ্যাকাউন্ট দ্রুত ফ্রিজ করতে পারে।" : "Authorities can instantly freeze the fraudster's mule account before funds leave."}
                    </p>
                  </div>
                </div>
                <a
                  href="tel:1930"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shrink-0 inline-flex items-center gap-1.5 shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{locale === "hi" ? "1930 डायल करें" : locale === "bn" ? "১৯৩০ ডায়াল করুন" : "Dial 1930"}</span>
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-paper-2 border border-ink/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">3</span>
                  <div>
                    <div className="font-bold text-ink">
                      {locale === "hi" ? "संदिग्ध नंबर की रिपोर्ट चक्षु (संचार साथी) पर करें" : locale === "bn" ? "সন্দেহজনক নম্বর চক্ষু (সঞ্চার সাথী) পোর্টালে রিপোর্ট করুন" : "Report Fraud Number on DoT Chakshu Portal"}
                    </div>
                    <p className="text-ink-soft text-xs mt-0.5">
                      {locale === "hi" ? "दूरसंचार विभाग इस फर्जी सिम और व्हाट्सएप अकाउंट को पूरे देश में ब्लॉक करेगा।" : locale === "bn" ? "টেলিকম বিভাগ এই জাল সিম নম্বর সারা দেশে ব্লক করবে।" : "Department of Telecom will deactivate the fraudulent SIM nationwide."}
                    </p>
                  </div>
                </div>
                <a
                  href="https://sancharsaathi.gov.in/sfc/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-forest hover:bg-forest-dark text-paper font-bold text-xs shrink-0 inline-flex items-center gap-1.5 shadow-xs"
                >
                  <span>{locale === "hi" ? "चक्षु खोलें" : locale === "bn" ? "চক্ষু খুলুন" : "Open Chakshu"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-paper-2 border border-ink/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-ink text-paper flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">4</span>
                  <div>
                    <div className="font-bold text-ink">
                      {locale === "hi" ? "गांव के व्हाट्सएप ग्रुप पर चेतावनी साझा करें" : locale === "bn" ? "গ্রামের হোয়াটসঅ্যাপ গ্রুপে সতর্কতা শেয়ার করুন" : "Warn Your Village & Family WhatsApp Group"}
                    </div>
                    <p className="text-ink-soft text-xs mt-0.5">
                      {locale === "hi" ? "यह संदेश गांव के बुजुर्गों और किसानों को ठगी से बचाएगा।" : locale === "bn" ? "এই বার্তা গ্রামের কৃষক ও প্রবীণদের প্রতারণা থেকে রক্ষা করবে।" : "Prevents other villagers and elders from falling victim to this forward."}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleShareWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shrink-0 inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{locale === "hi" ? "व्हाट्सएप साझा करें" : locale === "bn" ? "শেয়ার করুন" : "Share Alert"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Original Analyzed Content */}
          <div className="bg-paper-2 border border-ink/20 rounded-[18px] p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-ink/60 mb-2">
              Original Message Analyzed
            </div>
            <p className="text-xs text-ink/80 font-mono whitespace-pre-wrap bg-paper-1 p-3.5 rounded-[12px] border border-ink/15">
              {content}
            </p>
          </div>
        </div>
      )}

      {/* Tab 2: Verified Sources & Fact-Check */}
      {activeTab === "sources" && (
        <div className="space-y-4">
          {/* Fact Check Card */}
          <div className="bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-6 shadow-[2px_2px_0_0_#1b382b]">
            <h4 className="text-base font-bold text-ink mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-forest" />
              {labels.officialCheck || "Official Welfare Fact-Check"}
            </h4>

            <div className="grid md:grid-cols-2 gap-3 mb-4">
              <div className="p-3.5 rounded-[14px] bg-paper-2 border border-ink/15">
                <div className="text-xs text-ink/60 font-medium">Scheme Verified</div>
                <div className="font-bold text-ink text-sm mt-0.5">
                  {decision.officialFactCheck.schemeName}
                </div>
              </div>

              <div className="p-3.5 rounded-[14px] bg-paper-2 border border-ink/15">
                <div className="text-xs text-ink/60 font-medium">Fee Requirement</div>
                <div className="font-bold text-emerald-800 text-sm mt-0.5">
                  100% Free (Zero Registration Charges)
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-[14px] bg-forest/5 border border-forest/20 text-xs text-forest-dark leading-relaxed mb-4">
              <div className="font-bold mb-1">Official Guidance:</div>
              {decision.officialFactCheck.officialGuidance}
            </div>

            <div className="p-3.5 rounded-[14px] bg-paper-2 border border-ink/15 text-xs text-ink/80 leading-relaxed flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-ochre shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-ink">Google Play Store Status: </span>
                {decision.officialFactCheck.playStoreStatus}
              </div>
            </div>
          </div>

          {/* SerpApi Kept Sources List */}
          <div className="bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-6 shadow-[2px_2px_0_0_#1b382b]">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-base font-bold text-ink flex items-center gap-2">
                <Radio className="w-4 h-4 text-forest" />
                Live SerpApi Evidence Trail ({evidence.length})
              </h4>
              <span className="text-[11px] text-ink/60 font-medium">
                {labels.serpApiNote || "Live-verified via Serp API"}
              </span>
            </div>

            {evidence.length === 0 ? (
              <p className="text-xs text-ink/60">No external sources were captured.</p>
            ) : (
              <div className="divide-y divide-ink/10">
                {evidence.map((source, index) => {
                  const targetUrl = safeWebUrl(source.url);
                  return (
                    <div key={index} className="py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-forest uppercase">
                            {engineLabel(source.engine)}
                          </span>
                          <span className="text-ink/30">•</span>
                          <span className="text-xs font-semibold text-ink/80">{source.publisher}</span>
                        </div>
                        <span
                          className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            source.trust === "official"
                              ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                              : source.trust === "news"
                                ? "bg-blue-100 text-blue-900 border border-blue-300"
                                : "bg-paper-2 text-ink/70"
                          }`}
                        >
                          {source.trust}
                        </span>
                      </div>
                      <div className="text-sm font-bold text-ink mb-1">
                        {targetUrl ? (
                          <a
                            href={targetUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline flex items-center gap-1.5 group text-forest hover:text-forest-dark"
                          >
                            <span>{source.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0" />
                          </a>
                        ) : (
                          source.title
                        )}
                      </div>
                      <p className="text-xs text-ink/70 leading-relaxed font-sans line-clamp-3">
                        {source.snippet}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Report & Redressal Routes */}
      {activeTab === "redressal" && (
        <div className="space-y-4">
          <div className="bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-6 shadow-[2px_2px_0_0_#1b382b]">
            <h4 className="text-base font-bold text-ink mb-2">
              {locale === "hi"
                ? "आधिकारिक शिकायत एवं समाधान चैनल"
                : locale === "bn"
                  ? "অফিসিয়াল অভিযোগ ও প্রতিকার ব্যবস্থা"
                  : "Official Fraud Redressal & Reporting Channels"}
            </h4>
            <p className="text-xs text-ink/70 mb-5 leading-relaxed">
              If you received a suspicious message, report it on Chakshu immediately. If money was already debited, call 1930 within the golden hour to freeze bank accounts.
            </p>

            <div className="grid gap-3.5">
              {decision.redressalRoutes.map((route, idx) => {
                const targetUrl = route.url ? safeWebUrl(route.url) : null;
                const phoneUrl = route.phone ? safePhone(route.phone) : null;
                const isChakshu = route.type === "chakshu";
                const isCyber = route.type === "cybercrime";

                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-[16px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                      isChakshu
                        ? "bg-purple-50/70 border-purple-300"
                        : isCyber
                          ? "bg-red-50/70 border-red-300"
                          : "bg-paper-2 border-ink/20"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-ink text-sm mb-1">{route.name}</div>
                      <p className="text-xs text-ink/70 leading-relaxed max-w-xl">
                        {route.action}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
                      {phoneUrl && (
                        <a
                          href={phoneUrl}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[12px] bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          {labels.call1930 || "Call 1930"}
                        </a>
                      )}
                      {targetUrl && (
                        <a
                          href={targetUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-[12px] bg-forest hover:bg-forest-dark text-paper-1 text-xs font-bold shadow-sm transition-all"
                        >
                          <span>{isChakshu ? labels.reportChakshu || "Open Chakshu" : "Open Portal"}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Village Warning Card (WhatsApp Ready) */}
      {activeTab === "villageCard" && (
        <div className="space-y-4">
          <div className="bg-paper-1 border-[1.5px] border-ink rounded-[20px] p-6 shadow-[2px_2px_0_0_#1b382b]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h4 className="text-base font-bold text-ink">
                  {labels.tabVillageCard || "Village Warning Bulletin"}
                </h4>
                <p className="text-xs text-ink/70">
                  Ready to copy and share in village WhatsApp groups, Panchayat boards, or KVK farmer circles.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleCopyWarning}
                  className="rounded-full text-xs font-bold bg-paper-2 hover:bg-paper-1 text-ink border border-ink/30 gap-1.5 cursor-pointer"
                >
                  {copiedWarning ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      {labels.copied || "Copied!"}
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      {labels.copyWarning || "Copy Text"}
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={handleShareWhatsApp}
                  className="rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {labels.shareWhatsApp || "Share to WhatsApp"}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-[16px] bg-paper-2 border border-ink/20 font-sans text-xs sm:text-sm text-ink leading-relaxed whitespace-pre-wrap select-all">
              {decision.warningMessage}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
