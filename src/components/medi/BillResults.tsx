"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  Flag as FlagIcon,
  Scale,
  Phone,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Landmark,
  FileText,
  MapPin,
  Bookmark
} from "lucide-react";
import type { Bill, Evidence, MediDecision } from "@/lib/schemas";
import { safeWebUrl, safePhone } from "@/lib/krishi-share";
import { engineLabel } from "@/lib/evidence/trust";

interface BillResultsProps {
  bill: Bill | null;
  decision: MediDecision | null;
  evidence: Evidence[];
  onOpenLetter: () => void;
  onStartOver?: () => void;
  onSave?: () => void;
  saved?: boolean;
}

type TabKey = "conclusion" | "flags" | "sources" | "grievance";

function cleanTextForSpeech(text: string): string {
  return text
    .replace(/SerpApi/gi, "Serp A-P-I")
    .replace(/(\d+)\s*[-–—]\s*(\d+)/g, "$1 to $2")
    .replace(/(\d+)%/g, "$1 percent")
    .replace(/₹/g, "Rupees ")
    .replace(/CGHS/g, "C-G-H-S")
    .replace(/PM-JAY/g, "P-M Jan Arogya Yojana")
    .replace(/DCDRC/g, "District Consumer Commission")
    .replace(/DLSA/g, "District Legal Services Authority")
    .replace(/KVK/g, "Krishi Vigyan Kendra")
    .replace(/[*_#`[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function BillResults({
  bill,
  decision,
  evidence,
  onOpenLetter,
  onStartOver,
  onSave,
  saved
}: BillResultsProps) {
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<TabKey>("conclusion");
  const [isPlaying, setIsPlaying] = useState(false);
  const [speechSupported] = useState(() => typeof window !== "undefined" && "speechSynthesis" in window);
  const [copiedQuestionId, setCopiedQuestionId] = useState<number | null>(null);
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
    const textToSpeak = cleanTextForSpeech(
      decision.speechSummary || `${decision.headline}. ${decision.summary}`
    );
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utteranceRef.current = utterance;

    const voices = synth.getVoices();
    const langCode = locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN";
    const matchedVoice = voices.find((v) => v.lang === langCode || v.lang.startsWith(locale));
    if (matchedVoice) utterance.voice = matchedVoice;
    utterance.lang = langCode;
    utterance.rate = 0.88;
    utterance.pitch = 1.0;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    synth.speak(utterance);
    setIsPlaying(true);
  };

  const handleCopyQuestion = (text: string, id: number) => {
    navigator.clipboard.writeText(text);
    setCopiedQuestionId(id);
    setTimeout(() => setCopiedQuestionId(null), 2500);
  };

  const flags = decision?.flags || [];
  const actions = decision?.actions || [];
  const mapSources = evidence.filter((e) => e.engine === "google_maps" && e.maps);
  const webSources = evidence.filter((e) => e.engine !== "google_maps");

  return (
    <div className="max-w-5xl mx-auto pb-24 space-y-8">
      <div className="bg-paper-2 border-[1.5px] border-ink rounded-[20px] p-6 shadow-print relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-nil/10 text-nil font-semibold text-xs tracking-wide uppercase">
                {bill?.procedure || "Hospital Procedure"}
              </span>
              <span className="px-3 py-1 rounded-full bg-paper border border-ink-soft/30 text-ink text-xs font-medium">
                {bill?.hospital}, {bill?.city}
              </span>
              <span className="px-3 py-1 rounded-full bg-paper border border-ink-soft/30 text-ink text-xs font-semibold">
                Total: ₹{bill?.total?.toLocaleString("en-IN") || "0"}
              </span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl text-ink pt-1">
              {decision?.headline || "Hospital Bill Audit & Advice"}
            </h1>
            <p className="text-ink-soft text-xs md:text-sm">
              Grounded analysis of charges against government benchmarks, Clinical Establishments Act rules, and patient rights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {speechSupported && (
              <Button
                variant={isPlaying ? "primary" : "secondary"}
                onClick={handleToggleSpeech}
                className={`text-sm ${isPlaying ? "bg-terracotta hover:bg-terracotta/90 text-paper animate-pulse" : "border-ink text-ink hover:bg-ink/5"}`}
              >
                {isPlaying ? <VolumeX className="w-4 h-4 mr-2" /> : <Volume2 className="w-4 h-4 mr-2 text-nil" />}
                {isPlaying ? decision?.labels?.speechStop || "Stop Audio" : decision?.labels?.speechButton || "Listen / सुनें"}
              </Button>
            )}

            {onSave && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onSave}
                disabled={saved}
                className="text-xs"
              >
                <Bookmark className="w-3.5 h-3.5 mr-1.5" />
                {saved ? "Saved" : "Save Case"}
              </Button>
            )}

            {onStartOver && (
              <Button variant="quiet" size="sm" onClick={onStartOver} className="text-xs text-ink-soft hover:text-ink">
                <RotateCcw className="w-3.5 h-3.5 mr-1" /> Start Over
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex border-b-[1.5px] border-ink-soft/30 gap-1 overflow-x-auto bg-paper-2 p-1.5 rounded-2xl border-[1.5px] border-ink">
        <button
          type="button"
          onClick={() => setActiveTab("conclusion")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "conclusion"
              ? "bg-nil text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>{decision?.labels?.conclusion || "Conclusion & Advice"}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("flags")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "flags"
              ? "bg-nil text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <FlagIcon className="w-4 h-4 text-terracotta" />
          <span>{decision?.labels?.flags || "Questions to Ask"}</span>
          {flags.length > 0 && (
            <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${
              activeTab === "flags" ? "bg-paper text-nil" : "bg-terracotta/20 text-terracotta"
            }`}>
              {flags.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("sources")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "sources"
              ? "bg-nil text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <Scale className="w-4 h-4 text-moss" />
          <span>{decision?.labels?.sources || "Verified Sources (Serp API)"}</span>
          <span className={`px-2 py-0.2 rounded-full text-xs font-bold ${
            activeTab === "sources" ? "bg-paper text-nil" : "bg-ink/10 text-ink"
          }`}>
            {evidence.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("grievance")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
            activeTab === "grievance"
              ? "bg-nil text-paper shadow-sm font-semibold"
              : "text-ink-soft hover:text-ink hover:bg-paper"
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>{decision?.labels?.grievance || "Helplines & Legal Aid"}</span>
        </button>
      </div>

      {activeTab === "conclusion" && (
        <div className="space-y-6">
          <div className="bg-paper-2 rounded-[20px] border-[1.5px] border-ink p-6 md:p-8 space-y-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-nil/10 flex items-center justify-center text-nil shrink-0 mt-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-3 flex-1">
                <h3 className="font-display text-xl text-ink">
                  {locale === "hi" ? "ऑडिट निष्कर्ष और समझ" : locale === "bn" ? "নিরীক্ষা সিদ্ধান্ত ও বিশদ বিবরণ" : "Audit Summary & Understanding"}
                </h3>
                <div className="font-body text-ink text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                  {decision?.summary}
                </div>
              </div>
            </div>

            {decision?.benchmarkRange && (
              <div className="p-4 rounded-xl border border-moss/40 bg-moss/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-moss">
                    Government Benchmark Package (CGHS / PM-JAY)
                  </span>
                  <p className="text-sm text-ink-soft">
                    Standard rates for {bill?.procedure} in semi-private ward facilities.
                  </p>
                </div>
                <div className="text-lg font-display font-bold text-moss-deep bg-paper px-4 py-2 rounded-xl border border-moss/30 shadow-xs">
                  {decision.benchmarkRange}
                </div>
              </div>
            )}
          </div>

          <div className="bg-paper-2 rounded-[20px] border-[1.5px] border-ink p-6 md:p-8 space-y-5 shadow-sm">
            <div>
              <h3 className="font-display text-xl text-ink flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-moss" />
                {locale === "hi" ? "अब आपको क्या करना चाहिए (4 जरूरी कदम)" : locale === "bn" ? "আপনার করণীয় পদক্ষেপসমূহ (৪টি জরুরি পদক্ষেপ)" : "Immediate Action Plan for You & Your Family"}
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Concrete steps to follow before making full settlement at the hospital billing counter.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {actions.map((act) => (
                <div
                  key={act.id}
                  className={`p-5 rounded-2xl border-[1.5px] transition-all bg-paper space-y-2.5 ${
                    act.urgent ? "border-terracotta/40 shadow-xs" : "border-ink-soft/25"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      act.urgent ? "bg-terracotta/15 text-terracotta" : "bg-nil/10 text-nil"
                    }`}>
                      {act.badge || "Step"}
                    </span>
                    {act.urgent && (
                      <span className="text-xs text-terracotta font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> High Priority
                      </span>
                    )}
                  </div>
                  <h4 className="font-display text-base text-ink font-semibold">{act.title}</h4>
                  <p className="text-sm text-ink-soft leading-relaxed">{act.body}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-nil/5 border-[1.5px] border-nil/30 rounded-[20px] p-6 text-center space-y-3">
            <h3 className="font-display text-xl text-ink">Need a formal document for the hospital?</h3>
            <p className="text-ink-soft text-sm max-w-xl mx-auto">
              We have generated a polite, legally structured clarification letter referencing these flagged charges and your right to full itemisation under the Clinical Establishments Act.
            </p>
            <Button
              variant="primary"
              className="bg-nil hover:bg-nil/90 text-paper font-medium py-3 px-6 shadow-print"
              onClick={onOpenLetter}
            >
              <FileText className="w-4 h-4 mr-2" /> Open Clarification Letter Editor
            </Button>
          </div>
        </div>
      )}

      {activeTab === "flags" && (
        <div className="space-y-6">
          <div className="bg-paper-2 rounded-[20px] border-[1.5px] border-ink p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="font-display text-xl text-ink flex items-center gap-2">
                <FlagIcon className="w-5 h-5 text-terracotta" />
                {locale === "hi" ? "अस्पताल बिलिंग काउंटर से पूछने योग्य सवाल" : locale === "bn" ? "বিলিং কাউন্টারে জিজ্ঞাসা করার মতো প্রশ্নসমূহ" : "Identified Points & Questions to Ask Billing Desk"}
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Show these polite, pre-drafted questions to the hospital billing executive or read them aloud.
              </p>
            </div>

            {flags.length === 0 ? (
              <div className="p-8 text-center text-ink-soft space-y-2">
                <CheckCircle2 className="w-12 h-12 text-moss mx-auto" />
                <p className="text-lg font-medium text-ink">No major anomalies detected in the provided items.</p>
                <p className="text-sm">Always ask for daily pharmacy requisition logs and itemised receipt upon discharge.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {flags.map((flag, index) => (
                  <div
                    key={index}
                    className="p-5 rounded-2xl border-[1.5px] border-ink-soft/30 bg-paper space-y-3 hover:border-nil/50 transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-terracotta/15 text-terracotta">
                        {flag.type === "vague" ? "Unspecified Charge" : flag.type === "missingQty" ? "Unitemised Pharmacy" : flag.type === "totalMismatch" ? "Math Discrepancy" : "Attention"}
                      </span>
                      {flag.itemRef && (
                        <span className="text-xs font-semibold text-ink px-2 py-0.5 rounded bg-ink/5 border border-ink-soft/20">
                          Item: {flag.itemRef}
                        </span>
                      )}
                    </div>

                    <p className="text-sm md:text-base text-ink font-medium leading-relaxed">
                      {flag.message}
                    </p>

                    <div className="p-3.5 rounded-xl bg-nil/5 border border-nil/20 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold uppercase tracking-wide text-nil">
                          Suggested Question to Billing Desk:
                        </span>
                        <button
                          type="button"
                          onClick={() => handleCopyQuestion(flag.questionText, index)}
                          className="flex items-center gap-1 text-xs text-nil hover:underline font-medium"
                        >
                          {copiedQuestionId === index ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-moss" /> Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Copy Question
                            </>
                          )}
                        </button>
                      </div>
                      <p className="text-xs md:text-sm text-ink-soft italic font-serif">
                        {flag.questionText}
                      </p>
                    </div>

                    {flag.refs && flag.refs.length > 0 && (
                      <div className="text-[11px] text-ink-soft flex items-center gap-1">
                        <span>Legal / Regulatory Basis:</span>
                        <span className="font-medium text-ink">{flag.refs.join(", ")}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === "sources" && (
        <div className="space-y-6">
          <div className="bg-paper-2 rounded-[20px] border-[1.5px] border-ink p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="font-display text-xl text-ink flex items-center gap-2">
                <Scale className="w-5 h-5 text-moss" />
                {locale === "hi" ? "प्रमाणित सरकारी संदर्भ व खोज स्रोत (Serp API)" : locale === "bn" ? "যাচাইকৃত সরকারি তথ্যসূত্র ও অনুসন্ধান (Serp API)" : "Verified Public Reference Sources (Serp API)"}
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                Official package lists, Clinical Establishments Act circulars, and consumer court precedents retrieved via Serp API.
              </p>
            </div>

            {webSources.length === 0 ? (
              <div className="p-8 text-center text-ink-soft">
                <p>No external web sources were recorded for this search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {webSources.map((src) => (
                  <div
                    key={src.id}
                    className="p-4 rounded-2xl border border-ink-soft/30 bg-paper space-y-2 flex flex-col justify-between hover:border-nil/50 transition-colors"
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="px-2 py-0.5 rounded font-semibold bg-moss/10 text-moss">
                          {engineLabel(src.engine)}
                        </span>
                        <span className="text-ink-soft font-mono text-[11px]">
                          {src.publisher}
                        </span>
                      </div>
                      <h4 className="font-display text-sm font-semibold text-ink line-clamp-2">
                        {src.title}
                      </h4>
                      <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                        {src.snippet}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-ink-soft/20 flex justify-between items-center text-xs">
                      <span className="text-[11px] text-ink-soft">Query: {src.query?.slice(0, 35)}...</span>
                      {safeWebUrl(src.url) && (
                        <a
                          href={safeWebUrl(src.url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-nil hover:underline font-medium flex items-center gap-1 shrink-0"
                        >
                          Visit Source <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="p-3.5 bg-paper rounded-xl border border-ink-soft/20 text-xs text-ink-soft text-center">
              {decision?.labels?.serpApiNote || "Suggestions and conclusions are based on public web searches conducted using Serp API."}
            </div>
          </div>
        </div>
      )}

      {activeTab === "grievance" && (
        <div className="space-y-6">
          <div className="bg-paper-2 rounded-[20px] border-[1.5px] border-ink p-6 md:p-8 space-y-6 shadow-sm">
            <div>
              <h3 className="font-display text-xl text-ink flex items-center gap-2">
                <Landmark className="w-5 h-5 text-nil" />
                {locale === "hi" ? "आधिकारिक शिकायत केंद्र व मुफ्त कानूनी सहायता" : locale === "bn" ? "অফিসিয়াল অভিযোগ কেন্দ্র ও নিখরচায় আইনি সহায়তা" : "Official Grievance Channels & Free Legal Redressal"}
              </h3>
              <p className="text-xs text-ink-soft mt-1">
                If the hospital refuses itemised receipts or overcharges, reach out to these official authorities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl border-[1.5px] border-nil/40 bg-nil/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-nil text-paper">
                    Toll-Free Government
                  </span>
                  <Phone className="w-4 h-4 text-nil" />
                </div>
                <h4 className="font-display text-lg text-ink font-semibold">National Consumer Helpline (NCH)</h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Call for assistance on unfair hospital billing, refusal to provide itemised receipts, and medical service deficiency.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="tel:1915"
                    className="px-3 py-1.5 rounded-lg bg-nil text-paper text-xs font-semibold hover:bg-nil/90 transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call 1915 (Toll-Free)
                  </a>
                  <a
                    href="https://wa.me/918800001915"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-moss text-paper text-xs font-semibold hover:bg-moss/90 transition-colors flex items-center gap-1.5"
                  >
                    WhatsApp 8800001915
                  </a>
                </div>
              </div>

              <div className="p-5 rounded-2xl border-[1.5px] border-moss/40 bg-moss/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-moss text-paper">
                    24x7 Health Helpline
                  </span>
                  <Phone className="w-4 h-4 text-moss" />
                </div>
                <h4 className="font-display text-lg text-ink font-semibold">Ayushman Bharat (PM-JAY)</h4>
                <p className="text-xs text-ink-soft leading-relaxed">
                  Inquire about empanelled hospital packages, coverage eligibility, and complaints against network hospitals demanding extra cash.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <a
                    href="tel:14555"
                    className="px-3 py-1.5 rounded-lg bg-moss text-paper text-xs font-semibold hover:bg-moss/90 transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call 14555 (Toll-Free)
                  </a>
                </div>
              </div>
            </div>

            {mapSources.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-ink-soft/20">
                <h4 className="font-display text-base text-ink font-semibold flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-terracotta" /> Nearby Consumer Commission & Legal Aid Offices (Google Maps)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mapSources.map((src) => (
                    <div
                      key={src.id}
                      className="p-4 rounded-xl border border-ink-soft/30 bg-paper space-y-2 text-xs"
                    >
                      <h5 className="font-semibold text-ink text-sm">{src.maps?.name || src.title}</h5>
                      {src.maps?.address && (
                        <p className="text-ink-soft flex items-start gap-1">
                          <MapPin className="w-3.5 h-3.5 text-ink-soft shrink-0 mt-0.5" />
                          <span>{src.maps.address}</span>
                        </p>
                      )}
                      {src.maps?.phone && (
                        <p className="text-ink-soft flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-moss shrink-0" />
                          <a href={safePhone(src.maps.phone)} className="text-moss font-semibold hover:underline">
                            {src.maps.phone}
                          </a>
                        </p>
                      )}
                      {src.maps?.hoursText && (
                        <p className="text-ink-soft text-[11px]">{src.maps.hoursText}</p>
                      )}
                      {src.maps?.mapsUrl && (
                        <a
                          href={src.maps.mapsUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-nil hover:underline font-medium pt-1"
                        >
                          View on Google Maps <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="bg-paper-2 border border-ink-soft/25 rounded-2xl p-4 text-xs text-ink-soft leading-relaxed space-y-1">
        <p>
          <strong>Safety & Limitations:</strong> GramRaksha AI analyzes public records, government packages, and standard mathematical consistency. It does not provide legal judgments or clinical malpractice verdicts. Always verify facts with authorized consumer bodies or qualified legal advocates.
        </p>
      </div>
    </div>
  );
}
