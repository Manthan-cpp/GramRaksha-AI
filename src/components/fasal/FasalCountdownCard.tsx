"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { FasalCountdownStatus } from "@/lib/schemas";
import { calculateFasalCountdown } from "@/lib/fasal/calculator";
import {
  Clock,
  AlertTriangle,
  CheckCircle2,
  Volume2,
  VolumeX,
  Flame,
  Calendar
} from "lucide-react";

interface FasalCountdownCardProps {
  initialCountdown: FasalCountdownStatus;
  incidentTime: string;
  calamityLabel: string;
  crop: string;
  lossPercentage: number;
  district: string;
  state: string;
  village: string;
  speechSummary?: string;
}

export function FasalCountdownCard({
  initialCountdown,
  incidentTime,
  calamityLabel,
  crop,
  lossPercentage,
  district,
  state,
  village,
  speechSummary
}: FasalCountdownCardProps) {
  const locale = useLocale() as "en" | "hi" | "bn";
  const [countdown, setCountdown] = useState<FasalCountdownStatus>(initialCountdown);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Live timer tick every 1000ms
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateFasalCountdown(incidentTime, Date.now(), locale));
    }, 1000);

    return () => clearInterval(timer);
  }, [incidentTime, locale]);

  const handleSpeak = () => {
    if (!speechSummary || typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(speechSummary);
    utterance.lang = locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const isExpired = countdown.isExpired;
  const isCritical = countdown.urgency === "critical";
  const isWarning = countdown.urgency === "warning";

  const bannerColor = isExpired
    ? "bg-ink/5 border-ink/20 text-ink"
    : isCritical
    ? "bg-rose-50 border-rose-300 text-rose-950"
    : isWarning
    ? "bg-amber-50 border-amber-300 text-amber-950"
    : "bg-moss/10 border-moss/30 text-moss-deep";

  const badgeColor = isExpired
    ? "bg-ink/10 text-ink-soft border-ink/20"
    : isCritical
    ? "bg-rose-600 text-white animate-pulse"
    : isWarning
    ? "bg-amber-500 text-white"
    : "bg-moss-deep text-white";

  const deadlineFormatted = new Date(countdown.deadlineIso).toLocaleString(
    locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN",
    { dateStyle: "medium", timeStyle: "short" }
  );

  return (
    <div className={`rounded-2xl border-2 p-6 md:p-8 transition-all ${bannerColor}`}>
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-paper shadow-sm border border-ink/10">
            {isExpired ? (
              <AlertTriangle className="w-7 h-7 text-ink-soft" />
            ) : isCritical ? (
              <Flame className="w-7 h-7 text-rose-600 animate-bounce" />
            ) : isWarning ? (
              <Clock className="w-7 h-7 text-amber-600" />
            ) : (
              <CheckCircle2 className="w-7 h-7 text-moss" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${badgeColor}`}>
                {isExpired
                  ? locale === "hi" ? "समय-सीमा समाप्त" : locale === "bn" ? "সময় উত্তীর্ণ" : "Deadline Expired"
                  : isCritical
                  ? locale === "hi" ? "अति-गंभीर: तुरंत दावा करें" : locale === "bn" ? "জরুরি: অবিলম্বে রিপোর্ট করুন" : "Critical: Action Required"
                  : isWarning
                  ? locale === "hi" ? "चेतावनी: 48 घंटे से कम" : locale === "bn" ? "সতর্কতা: ৪৮ ঘণ্টার কম" : "Warning: Under 48h"
                  : locale === "hi" ? "सक्रिय सूचना विंडो" : locale === "bn" ? "দাবি উইন্ডো সক্রিয়" : "Active Window"}
              </span>
              <span className="text-xs font-mono text-ink-soft">PMFBY Clause 15.3</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-ink mt-1">
              {locale === "hi" ? "72-घंटे की स्थानीयकृत दावा उलटी गिनती" : locale === "bn" ? "৭২ ঘণ্টার সংবিধিবদ্ধ দাবি কাউন্টডাউন" : "72-Hour Statutory Intimation Countdown"}
            </h2>
          </div>
        </div>

        {speechSummary && (
          <button
            onClick={handleSpeak}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm ${
              isSpeaking
                ? "bg-rose-600 text-white border-rose-600"
                : "bg-paper text-ink hover:bg-paper-2 border-ink/20"
            }`}
            title="Read instructions aloud"
          >
            {isSpeaking ? (
              <>
                <VolumeX className="w-4 h-4 animate-pulse" />
                <span>{locale === "hi" ? "आवाज़ रोकें" : locale === "bn" ? "থামুন" : "Stop Audio"}</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-moss-deep" />
                <span>{locale === "hi" ? "निर्देश सुनें" : locale === "bn" ? "নির্দেশ শুনুন" : "Listen in Voice"}</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Main Countdown Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-6 items-center">
        {/* Big Digit Box */}
        <div className="md:col-span-2 bg-paper/90 backdrop-blur rounded-2xl border border-ink/10 p-6 shadow-sm">
          <div className="text-xs uppercase font-mono tracking-wider text-ink-soft mb-2">
            {locale === "hi" ? "दावा दर्ज करने के लिए शेष समय" : locale === "bn" ? "দাবি নিবন্ধনের জন্য বাকি সময়" : "Time Remaining to Intimate Loss"}
          </div>

          {isExpired ? (
            <div className="py-2">
              <div className="text-3xl font-display text-rose-700 font-bold">
                {locale === "hi" ? "72 घंटे की विधिक समय-सीमा समाप्त हो गई है" : locale === "bn" ? "৭২ ঘণ্টার সংবিধিবদ্ধ সময়সীমা সমাপ্ত হয়েছে" : "72-Hour Intimation Window Expired"}
              </div>
              <p className="text-sm text-ink-soft mt-2 leading-relaxed">
                {locale === "hi"
                  ? "चूंकि 72 घंटे का समय बीत चुका है, सामान्य ऐप दावा अस्वीकृत हो सकता है। तुरंत ज़िला कृषि अधिकारी और राजस्व तहसीलदार से मिलकर विशेष प्राकृतिक आपदा राहत (SDRF) का प्रतिवेदन दें।"
                  : locale === "bn"
                  ? "৭২ ঘণ্টা পার হওয়ায় সাধারণ অ্যাপ দাবি বাতিল হতে পারে। অবিলম্বে জেলা কৃষি আধিকারিক এবং ব্লক অফিসে গিয়ে বিশেষ দুর্যোগ ত্রাণের জন্য আবেদন করুন।"
                  : "Under PMFBY rules, delayed intimations face repudiation. Immediately approach the District Agriculture Officer with medical/calamity proof to appeal under State Disaster Relief (SDRF)."}
              </p>
            </div>
          ) : (
            <div className="flex items-baseline gap-3 sm:gap-6 flex-wrap">
              <div className="text-center">
                <div className="font-mono text-4xl sm:text-6xl font-bold tracking-tight text-ink">
                  {String(countdown.hoursLeft).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase font-mono text-ink-soft mt-1">
                  {locale === "hi" ? "घंटे" : locale === "bn" ? "ঘণ্টা" : "Hours"}
                </div>
              </div>
              <div className="font-mono text-3xl sm:text-5xl font-light text-ink-soft/40">:</div>
              <div className="text-center">
                <div className="font-mono text-4xl sm:text-6xl font-bold tracking-tight text-ink">
                  {String(countdown.minutesLeft).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase font-mono text-ink-soft mt-1">
                  {locale === "hi" ? "मिनट" : locale === "bn" ? "মিনিট" : "Minutes"}
                </div>
              </div>
              <div className="font-mono text-3xl sm:text-5xl font-light text-ink-soft/40">:</div>
              <div className="text-center">
                <div className="font-mono text-4xl sm:text-6xl font-bold tracking-tight text-ink">
                  {String(countdown.secondsLeft).padStart(2, "0")}
                </div>
                <div className="text-xs uppercase font-mono text-ink-soft mt-1">
                  {locale === "hi" ? "सेकंड" : locale === "bn" ? "সেকেন্ড" : "Seconds"}
                </div>
              </div>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs font-mono text-ink-soft mb-1.5">
              <span>{locale === "hi" ? "घटना का समय" : locale === "bn" ? "দুর্যোগের সময়" : "Incident Time"} (0h)</span>
              <span>{countdown.percentElapsed}% {locale === "hi" ? "बीत चुका" : locale === "bn" ? "অতিক্রান্ত" : "Elapsed"}</span>
              <span>{locale === "hi" ? "विधिक कटऑफ" : locale === "bn" ? "সর্বশেষ সময়" : "Cutoff"} (72h)</span>
            </div>
            <div className="w-full h-3 rounded-full bg-paper-2 overflow-hidden border border-ink/10">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  isExpired
                    ? "bg-ink-soft"
                    : isCritical
                    ? "bg-rose-600"
                    : isWarning
                    ? "bg-amber-500"
                    : "bg-moss"
                }`}
                style={{ width: `${countdown.percentElapsed}%` }}
              />
            </div>
          </div>
        </div>

        {/* Incident Summary Card */}
        <div className="bg-paper/90 backdrop-blur rounded-2xl border border-ink/10 p-5 shadow-sm space-y-3.5">
          <div className="text-xs uppercase font-mono tracking-wider text-ink-soft">
            {locale === "hi" ? "आपदा एवं फसल का विवरण" : locale === "bn" ? "ক্ষয়ক্ষতির বিবরণ" : "Reported Particulars"}
          </div>

          <div className="flex items-center justify-between text-sm py-1 border-b border-ink/5">
            <span className="text-ink-soft">{locale === "hi" ? "आपदा" : locale === "bn" ? "দুর্যোগ" : "Calamity"}:</span>
            <span className="font-semibold text-ink text-right">{calamityLabel}</span>
          </div>

          <div className="flex items-center justify-between text-sm py-1 border-b border-ink/5">
            <span className="text-ink-soft">{locale === "hi" ? "फसल" : locale === "bn" ? "ফসল" : "Crop"}:</span>
            <span className="font-semibold text-ink">{crop}</span>
          </div>

          <div className="flex items-center justify-between text-sm py-1 border-b border-ink/5">
            <span className="text-ink-soft">{locale === "hi" ? "अनुमानित नुकसान" : locale === "bn" ? "আনুমানিক ক্ষতি" : "Loss Extent"}:</span>
            <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              {lossPercentage}%
            </span>
          </div>

          <div className="flex items-center justify-between text-sm py-1 border-b border-ink/5">
            <span className="text-ink-soft">{locale === "hi" ? "स्थान" : locale === "bn" ? "এলাকা" : "Location"}:</span>
            <span className="font-medium text-ink text-right">{village}, {district}, {state}</span>
          </div>

          <div className="flex items-start justify-between text-xs pt-1">
            <span className="text-ink-soft flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {locale === "hi" ? "कटऑफ तिथि" : locale === "bn" ? "সময়সীমা" : "Deadline"}:
            </span>
            <span className="font-mono text-ink text-right">{deadlineFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
