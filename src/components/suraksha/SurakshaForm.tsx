"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";
import {
  ShieldAlert,
  Mic,
  MicOff,
  Sparkles,
  MessageSquare,
  Smartphone,
  Link2,
  Send,
  RotateCcw,
  Zap,
  Info
} from "lucide-react";

interface SurakshaFormProps {
  onSubmit: (data: {
    content: string;
    sourceType: "whatsapp" | "sms" | "link" | "apk" | "other";
    appName?: string;
    mode: "live" | "recorded";
  }) => void;
  isLoading?: boolean;
}

const PRESETS = [
  {
    label: "Fake PM Kisan APK",
    labelHi: "फर्जी पीएम किसान APK",
    labelBn: "ভুয়া পিএম কিষাণ APK",
    sourceType: "whatsapp" as const,
    appName: "PM Kisan Yojana APK",
    text: "PM Kisan 17th Installment ₹2000 bonus approved. Download PMKisan.apk immediately to update e-KYC and pay ₹250 registration fee."
  },
  {
    label: "Electricity Cutoff Threat",
    labelHi: "बिजली कटने की धमकी",
    labelBn: "বিদ্যুৎ সংযোগ কাটার হুমকি",
    sourceType: "sms" as const,
    text: "Dear consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid bill. Immediately contact power officer on 9876543210 and pay ₹499."
  },
  {
    label: "Tractor Subsidy 80%",
    labelHi: "80% ट्रैक्टर सब्सिडी झांसा",
    labelBn: "৮০% ট্র্যাক্টর ভর্তুকি ফাঁদ",
    sourceType: "link" as const,
    text: "Pradhan Mantri Kisan Tractor Yojana 2026: Get 80% subsidy on all tractors. Limited slots! Deposit ₹1200 processing fee on http://pm-tractor-subsidy.online before midnight."
  },
  {
    label: "Authentic Official Portal",
    labelHi: "सत्यापित सरकारी पोर्टल",
    labelBn: "খাঁটি সরকারি পোর্টাল",
    sourceType: "link" as const,
    text: "Please verify your PM-Kisan Samman Nidhi installment status directly on the official portal at https://pmkisan.gov.in without paying any fee."
  }
];

export function SurakshaForm({ onSubmit, isLoading }: SurakshaFormProps) {
  const locale = useLocale();
  const [content, setContent] = useState("");
  const [sourceType, setSourceType] = useState<"whatsapp" | "sms" | "link" | "apk" | "other">("whatsapp");
  const [appName, setAppName] = useState("");
  const [mode, setMode] = useState<"live" | "recorded">("live");

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    locale,
    onTranscript: (transcript) => {
      setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isLoading) return;
    onSubmit({
      content: content.trim(),
      sourceType,
      appName: appName.trim() || undefined,
      mode
    });
  };

  const loadPreset = (preset: (typeof PRESETS)[number]) => {
    setContent(preset.text);
    setSourceType(preset.sourceType);
    if (preset.appName) setAppName(preset.appName);
    else setAppName("");
  };

  const t = {
    badge: locale === "hi" ? "साइबर सुरक्षा जांच" : locale === "bn" ? "সাইবার নিরাপত্তা নিরীক্ষা" : "Cyber Fraud Audit",
    title:
      locale === "hi"
        ? "सुरक्षा जांच (Suraksha Check)"
        : locale === "bn"
          ? "সুরক্ষা চেক (Suraksha Check)"
          : "Suraksha Check",
    subtitle:
      locale === "hi"
        ? "व्हाट्सएप संदेश, संदिग्ध .apk फाइल, फर्जी सरकारी लिंक या बिजली बिल की धमकियों की सत्यता जांचें।"
        : locale === "bn"
          ? "হোয়াটসঅ্যাপ বার্তা, সন্দেহজনক .apk ফাইল, ভুয়া সরকারি লিঙ্ক বা বিদ্যুৎ বিলের হুমকির সত্যতা যাচাই করুন।"
          : "Audit suspicious WhatsApp forwards, APK downloads, fake welfare links, and urgent payment threats.",
    presetsTitle: locale === "hi" ? "त्वरित उदाहरण (परीक्षण हेतु)" : locale === "bn" ? "দ্রুত উদাহরণ (পরীক্ষার জন্য)" : "Quick Test Scenarios",
    sourceTypeLabel: locale === "hi" ? "संदेश का माध्यम" : locale === "bn" ? "বার্তার উৎস" : "Message Channel",
    appNameLabel: locale === "hi" ? "ऐप या योजना का नाम (वैकल्पिक)" : locale === "bn" ? "অ্যাপ বা প্রকল্পের নাম (ঐচ্ছিক)" : "App / Scheme Name (Optional)",
    appNamePlaceholder: locale === "hi" ? "उदा. PM Kisan Yojana APK" : locale === "bn" ? "যেমন: PM Kisan Yojana APK" : "e.g. PM Kisan Yojana APK",
    contentLabel: locale === "hi" ? "संदेश, लिंक या एसएमएस यहां पेस्ट करें" : locale === "bn" ? "বার্তা, লিঙ্ক বা এসএমএস এখানে পেস্ট করুন" : "Paste Suspicious Message, SMS, or Link",
    contentPlaceholder:
      locale === "hi"
        ? "संदेश यहां पेस्ट करें या माइक दबाकर बोलें (जैसे 'पीएम किसान ₹2000 बोनस हेतु ऐप डाउनलोड करें')..."
        : locale === "bn"
          ? "বার্তাটি এখানে পেস্ট করুন অথবা মাইক টিপে বলুন..."
          : "Paste the message here or tap the microphone to dictate (e.g. 'PM Kisan bonus APK download...')...",
    submitButton: locale === "hi" ? "सुरक्षा जांच शुरू करें" : locale === "bn" ? "সুরক্ষা নিরীক্ষা শুরু করুন" : "Run Suraksha Audit",
    submitting: locale === "hi" ? "सत्यापन जारी है..." : locale === "bn" ? "যাচাইকরণ চলছে..." : "Auditing via Serp API...",
    clearButton: locale === "hi" ? "साफ करें" : locale === "bn" ? "মুছুন" : "Clear",
    liveMode: locale === "hi" ? "लाइव खोज (SerpApi)" : locale === "bn" ? "লাইভ সার্চ (SerpApi)" : "Live Search (SerpApi)",
    recordedMode: locale === "hi" ? "रिकॉर्डेड डेटा (ऑफ़लाइन)" : locale === "bn" ? "রেকর্ড করা ডেটা" : "Recorded Fixture"
  };

  return (
    <div className="bg-paper-1 border-[1.5px] border-ink rounded-[24px] p-6 md:p-8 shadow-[4px_4px_0_0_#1b382b] transition-all">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase bg-forest/10 text-forest border border-forest/20">
          <ShieldAlert className="w-3.5 h-3.5" />
          {t.badge}
        </span>
        <div className="inline-flex items-center gap-1 p-1 bg-paper-2 border border-ink/20 rounded-full text-xs font-medium">
          <button
            type="button"
            onClick={() => setMode("live")}
            className={`px-3 py-1 rounded-full transition-colors ${
              mode === "live" ? "bg-forest text-paper-1 font-bold shadow-sm" : "text-ink/70 hover:text-ink"
            }`}
          >
            {t.liveMode}
          </button>
          <button
            type="button"
            onClick={() => setMode("recorded")}
            className={`px-3 py-1 rounded-full transition-colors ${
              mode === "recorded" ? "bg-forest text-paper-1 font-bold shadow-sm" : "text-ink/70 hover:text-ink"
            }`}
          >
            {t.recordedMode}
          </button>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-serif font-black text-ink mb-2 tracking-tight">
          {t.title}
        </h2>
        <p className="text-ink/70 text-sm md:text-base leading-relaxed">
          {t.subtitle}
        </p>
      </div>

      {/* Quick Test Presets */}
      <div className="mb-6 bg-paper-2/70 border border-ink/15 rounded-[16px] p-4">
        <div className="flex items-center gap-2 mb-2.5 text-xs font-bold uppercase tracking-wider text-ink/70">
          <Zap className="w-3.5 h-3.5 text-ochre" />
          {t.presetsTitle}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadPreset(preset)}
              className="text-left p-2.5 rounded-[12px] bg-paper-1 border border-ink/20 hover:border-forest hover:bg-forest/5 text-xs font-medium text-ink transition-all group"
            >
              <div className="font-bold text-forest group-hover:text-forest-dark line-clamp-1">
                {locale === "hi" ? preset.labelHi : locale === "bn" ? preset.labelBn : preset.label}
              </div>
              <div className="text-[11px] text-ink/60 line-clamp-1 mt-0.5">
                {preset.text}
              </div>
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Source Channel Selector */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-2">
            {t.sourceTypeLabel}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: "whatsapp", label: "WhatsApp", icon: MessageSquare },
              { id: "sms", label: "SMS", icon: Send },
              { id: "link", label: "Link / Web", icon: Link2 },
              { id: "apk", label: "Android APK", icon: Smartphone },
              { id: "other", label: "Other", icon: Info }
            ].map((item) => {
              const Icon = item.icon;
              const selected = sourceType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSourceType(item.id as typeof sourceType)}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-[12px] border text-xs font-bold transition-all ${
                    selected
                      ? "bg-forest text-paper-1 border-forest shadow-sm"
                      : "bg-paper-2 text-ink/70 border-ink/20 hover:border-ink/50"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Optional App Name input */}
        <div>
          <label htmlFor="appName" className="block text-xs font-bold uppercase tracking-wider text-ink/80 mb-1.5">
            {t.appNameLabel}
          </label>
          <input
            id="appName"
            type="text"
            value={appName}
            onChange={(e) => setAppName(e.target.value)}
            placeholder={t.appNamePlaceholder}
            className="w-full px-4 py-2.5 rounded-[12px] border border-ink/25 bg-paper-2 text-ink text-sm focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest"
          />
        </div>

        {/* Suspicious Content Textarea with Voice Dictation */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="content" className="block text-xs font-bold uppercase tracking-wider text-ink/80">
              {t.contentLabel}
            </label>
            <div className="flex items-center gap-2">
              {content && (
                <button
                  type="button"
                  onClick={() => setContent("")}
                  className="text-xs text-ink/60 hover:text-red-600 flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t.clearButton}
                </button>
              )}
              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium transition-all ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse"
                      : "bg-forest/10 text-forest hover:bg-forest/20"
                  }`}
                  title={isListening ? "Stop listening" : "Speak text"}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-3 h-3" />
                      Listening...
                    </>
                  ) : (
                    <>
                      <Mic className="w-3 h-3" />
                      Voice Input
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
          <div className="relative">
            <textarea
              id="content"
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={t.contentPlaceholder}
              required
              className="w-full p-3.5 rounded-[14px] border border-ink/25 bg-paper-2 text-ink text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-forest/50 focus:border-forest placeholder:text-ink/40 resize-none font-sans"
            />
            <div className="absolute right-3 bottom-2 text-[10px] text-ink/40">
              {content.length} / 2000
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={!content.trim() || isLoading}
          className="w-full py-3.5 text-base font-bold bg-forest hover:bg-forest-dark text-paper-1 rounded-[14px] border-[1.5px] border-ink shadow-[2px_2px_0_0_#1b382b] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-paper-1 border-t-transparent rounded-full animate-spin" />
              {t.submitting}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-ochre" />
              {t.submitButton}
            </>
          )}
        </Button>
      </form>
    </div>
  );
}
