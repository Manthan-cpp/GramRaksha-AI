"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { PashuDecision, Evidence } from "@/lib/schemas";
import {
  HeartPulse,
  PhoneCall,
  Volume2,
  VolumeX,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  MapPin,
  ExternalLink,
  Share2,
  Download,
  ShieldCheck,
  Stethoscope,
  Info,
  Building2,
  Sparkles
} from "lucide-react";

interface PashuResultsProps {
  decision: PashuDecision;
  evidence: Evidence[];
  onSaveCase?: () => void;
  isSaved?: boolean;
}

export function PashuResults({
  decision,
  evidence,
  onSaveCase,
  isSaved = false
}: PashuResultsProps) {
  const locale = useLocale() as "en" | "hi" | "bn";
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported on this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(decision.speechSummary);
    utterance.lang = locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN";
    utterance.rate = 0.9; // slightly slower for easy understanding
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleShareWhatsApp = () => {
    const text = `🚨 *${decision.headline}* (${decision.animal})\n\n` +
      `📋 *तुरंत क्या करें (कदम दर कदम):*\n` +
      decision.doNowSteps.map((s) => `${s.stepNumber}. *${s.title}*: ${s.instruction}`).join("\n\n") +
      `\n\n⛔ *भूलकर भी न करें:*\n` +
      decision.neverDoWarnings.slice(0, 3).join("\n") +
      `\n\n🚑 *पशु एम्बुलेंस:* 1962 (टोल-फ्री)\n` +
      `🌾 ग्रामरक्षा एआई - पशुसहाय सलाह`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const statusBg =
    decision.status === "emergency"
      ? "bg-red-500/10 border-red-600 text-red-900"
      : decision.status === "critical"
      ? "bg-amber-500/10 border-amber-600 text-amber-900"
      : "bg-emerald-500/10 border-emerald-600 text-emerald-900";

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className={`p-6 sm:p-8 rounded-3xl border-[2px] border-ink ${statusBg} shadow-[6px_6px_0_rgba(62,39,35,1)] relative overflow-hidden backdrop-blur-md`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-ink text-paper">
                {decision.animal} • {decision.status.toUpperCase()}
              </span>
              <span className="text-xs font-bold text-ink-soft">
                {locale === "hi" ? "सत्यापित प्राथमिक चिकित्सा" : locale === "bn" ? "যাচাইকৃত প্রাথমিক চিকিৎসা" : "Verified Clinical Guidance"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ink leading-tight">
              {decision.headline}
            </h2>

            <p className="text-sm text-ink-soft max-w-2xl leading-relaxed">
              {decision.summary}
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0 w-full md:w-auto">
            <button
              type="button"
              onClick={handleToggleSpeech}
              className={`flex-1 sm:flex-none px-4 py-3 rounded-2xl font-bold text-xs border-[2px] border-ink shadow-[3px_3px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2 ${
                isSpeaking
                  ? "bg-red-600 text-white animate-pulse"
                  : "bg-amber-400 text-ink hover:bg-amber-500"
              }`}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isSpeaking ? (locale === "hi" ? "बोलना रोकें" : "Stop Voice") : (locale === "hi" ? "सलाह सुनें (आवाज़ में)" : locale === "bn" ? "পরামর্শ শুনুন" : "Listen to Advice")}</span>
            </button>

            <a
              href="tel:1962"
              className="flex-1 sm:flex-none px-4 py-3 rounded-2xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white border-[2px] border-ink shadow-[3px_3px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4" />
              <span>{decision.labels.ambulanceButton || "Call 1962 MVU"}</span>
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-moss text-paper flex items-center justify-center font-bold text-sm shadow-xs">
            ✓
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-ink">
              {decision.labels.stepsHeader || "What To Do Immediately (Step-by-Step)"}
            </h3>
            <p className="text-xs text-ink-soft">
              {locale === "hi"
                ? "सरल भाषा में निर्देश — इन्हें क्रम से एक-एक करके करें:"
                : locale === "bn"
                ? "সহজ ভাষায় ধাপসমূহ — পর্যায়ক্রমে সম্পন্ন করুন:"
                : "Simple, spoon-fed instructions — follow them in sequence:"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {decision.doNowSteps.map((step) => (
            <div
              key={step.id}
              className={`p-5 rounded-3xl bg-white/40 backdrop-blur-md border-[2px] border-ink shadow-[4px_4px_0_rgba(62,39,35,1)] flex flex-col justify-between space-y-3 relative overflow-hidden ${
                step.isEmergency ? "border-amber-700" : ""
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="w-7 h-7 rounded-full bg-ink text-paper font-mono font-bold text-xs flex items-center justify-center">
                    {step.stepNumber}
                  </span>
                  {step.badge && (
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-900 border border-amber-600/30">
                      {step.badge}
                    </span>
                  )}
                </div>

                <h4 className="text-base font-bold text-ink leading-snug">
                  {step.title}
                </h4>

                <p className="text-xs text-ink font-medium mt-2 leading-relaxed bg-amber-50/50 p-2.5 rounded-xl border border-ink/10">
                  👉 <span className="font-bold">{step.instruction}</span>
                </p>
              </div>

              <div className="pt-2 border-t border-ink/10 flex items-start gap-1.5 text-[11px] text-ink-soft">
                <Info className="w-3.5 h-3.5 text-moss-deep shrink-0 mt-0.5" />
                <span>{step.explanation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="p-6 rounded-3xl bg-red-500/10 backdrop-blur-md border-[2px] border-red-700 shadow-[6px_6px_0_rgba(185,28,28,1)] space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-xs">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-red-950">
              {decision.labels.neverDoHeader || "What NEVER To Do (Strict Clinical Warnings)"}
            </h3>
            <p className="text-xs text-red-800">
              {locale === "hi"
                ? "इन गलतियों से पशु की जान जा सकती है — इन्हें भूलकर भी न करें:"
                : locale === "bn"
                ? "এই ভুলগুলোর কারণে পশুর মৃত্যু হতে পারে — কখনোই করবেন না:"
                : "Crucial veterinary hazards — avoid these dangerous quack practices:"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          {decision.neverDoWarnings.map((warning, index) => (
            <div
              key={index}
              className="p-3.5 rounded-2xl bg-white/70 border-[1.5px] border-red-700/40 text-xs font-semibold text-red-900 leading-relaxed shadow-xs flex items-start gap-2"
            >
              <span>{warning}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-nil text-paper flex items-center justify-center font-bold text-sm shadow-xs">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-display font-bold text-ink">
              {decision.labels.hospitalHeader || "Nearby Government Veterinary Hospitals"}
            </h3>
            <p className="text-xs text-ink-soft">
              {locale === "hi"
                ? "गूगल मैप्स से प्राप्त आपके जिले के सरकारी पशु चिकित्सालय व औषधालय:"
                : locale === "bn"
                ? "গুগল ম্যাপস থেকে প্রাপ্ত আপনার জেলার সরকারি পশু হাসপাতাল:"
                : "Live dispensaries retrieved via Google Maps for immediate medical attention:"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {decision.nearbyHospitals.map((hospital, index) => (
            <div
              key={index}
              className="p-5 rounded-3xl bg-white/40 backdrop-blur-md border-[2px] border-ink shadow-[4px_4px_0_rgba(62,39,35,1)] flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-ink leading-tight">
                    {hospital.name}
                  </h4>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-900 border border-emerald-600/30 shrink-0">
                    Govt Vet
                  </span>
                </div>

                <p className="text-xs text-ink-soft mt-1.5 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-moss-deep shrink-0 mt-0.5" />
                  <span>{hospital.address}</span>
                </p>

                {hospital.phone && (
                  <p className="text-xs font-mono font-bold text-ink mt-2">
                    📞 {hospital.phone}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-ink/10 flex items-center justify-between">
                <a
                  href={hospital.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-nil hover:underline"
                >
                  <span>{locale === "hi" ? "गूगल मैप्स पर रास्ता देखें" : "Navigate on Google Maps"}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {hospital.phone && hospital.phone.startsWith("1962") && (
                  <a
                    href="tel:1962"
                    className="px-2.5 py-1 rounded-xl bg-red-600 text-white text-xs font-bold shadow-xs hover:bg-red-700 transition-colors"
                  >
                    1962 Dial
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {decision.dietAndCareTips.length > 0 && (
        <div className="p-5 rounded-3xl bg-white/30 backdrop-blur-md border-[2px] border-ink shadow-[4px_4px_0_rgba(62,39,35,1)] space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-moss-deep" />
            <h4 className="text-sm font-bold text-ink">
              {locale === "hi" ? "आहार व देखभाल की जरूरी सावधानियां:" : locale === "bn" ? "খাবার ও যত্নের জরুরি নিয়মাবলী:" : "Diet & Recovery Care Guidelines:"}
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-ink font-medium">
            {decision.dietAndCareTips.map((tip, index) => (
              <div key={index} className="flex items-start gap-2 p-2 rounded-xl bg-white/50 border border-ink/10">
                <span className="text-moss-deep font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-5 rounded-3xl bg-white/30 backdrop-blur-md border-[2px] border-ink shadow-[4px_4px_0_rgba(62,39,35,1)] space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-moss-deep" />
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider font-mono">
            {decision.labels.sourcesHeader || "Official ICAR / IVRI Guidelines & Sources"}
          </h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {decision.sourceReferences.map((ref, idx) => (
            <a
              key={idx}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-2xl bg-white/60 hover:bg-white border-[1.5px] border-ink/30 hover:border-ink transition-all text-left shadow-xs flex flex-col justify-between group"
            >
              <div>
                <p className="text-xs font-bold text-ink group-hover:text-moss-deep transition-colors line-clamp-2">
                  {ref.title}
                </p>
                <p className="text-[10px] text-ink-soft mt-1 font-mono">
                  {ref.publisher}
                </p>
              </div>
              <div className="mt-2 text-[10px] font-bold text-nil flex items-center gap-1">
                <span>{locale === "hi" ? "स्रोत देखें" : "Open Source"}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={handleShareWhatsApp}
          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold border-[2px] border-ink shadow-[3px_3px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center gap-2"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>{locale === "hi" ? "व्हाट्सएप पर शेयर करें" : locale === "bn" ? "হোয়াটসঅ্যাপে শেয়ার করুন" : "Share on WhatsApp"}</span>
        </button>

        {onSaveCase && (
          <button
            type="button"
            onClick={onSaveCase}
            disabled={isSaved}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold border-[2px] border-ink transition-all flex items-center gap-2 ${
              isSaved
                ? "bg-moss/20 text-moss-deep border-moss shadow-none"
                : "bg-white/80 hover:bg-white text-ink shadow-[3px_3px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isSaved ? (locale === "hi" ? "केस सहेजा गया ✓" : "Case Saved ✓") : (locale === "hi" ? "केस डिवाइस में सहेजें" : "Save Case Offline")}</span>
          </button>
        )}
      </div>
    </div>
  );
}
