"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import statesData from "@/data/states-and-districts.json";
import { Button } from "@/components/ui/button";
import { PashuEvidenceRequest } from "@/lib/schemas";
import {
  HeartPulse,
  Mic,
  MicOff,
  Activity,
  ShieldCheck
} from "lucide-react";

interface PashuFormProps {
  onSubmit: (data: PashuEvidenceRequest) => void;
  isLoading?: boolean;
}

const ANIMAL_OPTIONS = [
  { id: "Cow", labelEn: "Cow / Cattle", labelHi: "गाय / गोवंश", labelBn: "গরু / গোবংশ", emoji: "🐄" },
  { id: "Buffalo", labelEn: "Buffalo", labelHi: "भैंस", labelBn: "মহিষ", emoji: "🐃" },
  { id: "Goat", labelEn: "Goat", labelHi: "बकरी", labelBn: "ছাগল", emoji: "🐐" },
  { id: "Sheep", labelEn: "Sheep", labelHi: "भेड़", labelBn: "ভেড়া", emoji: "🐑" },
  { id: "Poultry", labelEn: "Poultry / Chicken", labelHi: "मुर्गी / कुक्कुट", labelBn: "মুরগি", emoji: "🐓" },
  { id: "Pig", labelEn: "Pig", labelHi: "सुअर / शूकर", labelBn: "শূকর", emoji: "🐖" }
];

export function PashuForm({ onSubmit, isLoading = false }: PashuFormProps) {
  const locale = useLocale() as "en" | "hi" | "bn";

  const [animal, setAnimal] = useState<string>("");
  const [concern, setConcern] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [farmerName, setFarmerName] = useState<string>("");
  const [farmerPhone, setFarmerPhone] = useState<string>("");
  const [isListening, setIsListening] = useState<boolean>(false);
  const [mode, setMode] = useState<"live" | "recorded">("live");

  const currentDistricts = statesData.states.find((s) => s.state === state)?.districts || [];

  const handleStateChange = (newState: string) => {
    setState(newState);
    setDistrict("");
  };

  // Web Speech recognition for voice input
  const toggleListening = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition =
      (window as unknown as { SpeechRecognition?: any }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: any }).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(locale === "hi" ? "आपके ब्राउज़र में वॉइस इनपुट उपलब्ध नहीं है।" : "Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN";

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setConcern((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!animal.trim() || !concern.trim() || !state.trim() || !district.trim()) return;

    onSubmit({
      module: "pashu",
      animal,
      concern: concern.trim(),
      state,
      district,
      farmerName: farmerName.trim() || undefined,
      farmerPhone: farmerPhone.trim() || undefined,
      mode,
      locale
    });
  };

  const canSubmit = Boolean(animal.trim() && concern.trim() && state.trim() && district.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Main Input Card */}
      <div className="bg-white/30 backdrop-blur-md rounded-3xl border-[2px] border-ink p-6 sm:p-8 space-y-6 shadow-[6px_6px_0_rgba(62,39,35,1)]">
        
        {/* Animal Species Selection */}
        <div>
          <label className="block text-sm font-bold text-ink mb-2.5">
            {locale === "hi" ? "1. पशु की प्रजाति चुनें:" : locale === "bn" ? "১. পশুর প্রজাতি নির্বাচন করুন:" : "1. Select Animal Species:"}
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
            {ANIMAL_OPTIONS.map((opt) => {
              const selected = animal === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setAnimal(opt.id)}
                  className={`p-3 rounded-2xl border-[2px] text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    selected
                      ? "bg-amber-100 border-ink shadow-[3px_3px_0_rgba(62,39,35,1)] scale-[1.02]"
                      : "bg-white/50 border-ink/30 hover:border-ink hover:bg-white/80"
                  }`}
                >
                  <span className="text-2xl">{opt.emoji}</span>
                  <span className="text-xs font-bold text-ink leading-tight">
                    {locale === "hi" ? opt.labelHi : locale === "bn" ? opt.labelBn : opt.labelEn}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Symptoms / Guidance Required */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-bold text-ink">
              {locale === "hi" ? "2. पशु की बीमारी / लक्षण या समस्या बताएं:" : locale === "bn" ? "২. পশুর রোগ বা সমস্যা লিখুন:" : "2. Describe Symptoms / Guidance Needed:"}
            </label>
            <button
              type="button"
              onClick={toggleListening}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border-[1.5px] border-ink transition-all cursor-pointer ${
                isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-white/70 hover:bg-white text-ink shadow-[2px_2px_0_rgba(62,39,35,1)]"
              }`}
            >
              {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-moss-deep" />}
              <span>{isListening ? (locale === "hi" ? "सुन रहे हैं..." : "Listening...") : (locale === "hi" ? "बोलकर बताएं" : "Voice Input")}</span>
            </button>
          </div>
          <textarea
            rows={3}
            value={concern}
            onChange={(e) => setConcern(e.target.value)}
            placeholder={
              locale === "hi"
                ? "पशु की स्थिति दर्ज करें (उदाहरण: पेट में बहुत गैस है, पशु खड़ा नहीं हो पा रहा या थन में सूजन है)..."
                : locale === "bn"
                ? "পশুর উপসর্গ লিখুন (উদাহরণ: পেটে তীব্র গ্যাস, দাঁড়াতে পারছে না অথবা ওলানে প্রদাহ)..."
                : "Describe symptoms (e.g. acute abdominal bloat with labored breathing, or udder swelling, or skin lumps)..."
            }
            className="w-full px-4 py-3 rounded-2xl bg-white/70 border-[2px] border-ink text-ink font-medium focus:bg-white focus:outline-hidden text-sm resize-none shadow-[inset_2px_2px_0_rgba(62,39,35,0.1)]"
            required
          />
        </div>

        {/* Location & Farmer Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {locale === "hi" ? "राज्य (State):" : locale === "bn" ? "রাজ্য:" : "State:"}
            </label>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/70 border-[2px] border-ink text-ink text-xs font-bold focus:bg-white focus:outline-hidden"
            >
              <option value="">
                {locale === "hi" ? "-- राज्य चुनें --" : locale === "bn" ? "-- রাজ্য নির্বাচন করুন --" : "-- Select State --"}
              </option>
              {statesData.states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {locale === "hi" ? "ज़िला (District):" : locale === "bn" ? "জেলা:" : "District:"}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={!state}
              className="w-full px-3 py-2.5 rounded-xl bg-white/70 border-[2px] border-ink text-ink text-xs font-bold focus:bg-white focus:outline-hidden disabled:opacity-50"
            >
              <option value="">
                {locale === "hi" ? "-- ज़िला चुनें --" : locale === "bn" ? "-- জেলা নির্বাচন করুন --" : "-- Select District --"}
              </option>
              {currentDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {locale === "hi" ? "पशुपालक / किसान का नाम:" : locale === "bn" ? "কৃষকের নাম:" : "Owner / Farmer Name:"}
            </label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/70 border-[2px] border-ink text-ink text-xs font-medium focus:bg-white focus:outline-hidden"
              placeholder={locale === "hi" ? "नाम दर्ज करें" : locale === "bn" ? "নাম লিখুন" : "Enter Name"}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-ink mb-1.5">
              {locale === "hi" ? "मोबाइल नंबर (वैकल्पिक):" : locale === "bn" ? "মোবাইল নম্বর:" : "Mobile (Optional):"}
            </label>
            <input
              type="tel"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white/70 border-[2px] border-ink text-ink text-xs font-medium focus:bg-white focus:outline-hidden"
              placeholder="10 digits"
            />
          </div>
        </div>

        {/* Live Search Mode & Submission Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-ink-soft">
            <ShieldCheck className="w-4 h-4 text-moss-deep shrink-0" />
            <span>
              {locale === "hi"
                ? "आईसीएआर (ICAR-IVRI) एवं एनडीडीबी के सत्यापित वैज्ञानिक दिशानिर्देश।"
                : locale === "bn"
                ? "আইসিএআর ও এনডিডিবি অনুমোদিত নিরাপদ পশুচিকিৎসা নির্দেশিকা।"
                : "Real-time SerpApi queries grounded in ICAR-IVRI, NDDB & Google Maps."}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Live Search Toggle */}
            <button
              type="button"
              onClick={() => setMode((m) => (m === "live" ? "recorded" : "live"))}
              className={`px-3 py-2 rounded-xl text-xs font-bold border-[1.5px] border-ink transition-all cursor-pointer ${
                mode === "live"
                  ? "bg-emerald-600 text-white shadow-[2px_2px_0_rgba(62,39,35,1)]"
                  : "bg-white/60 text-ink"
              }`}
            >
              {mode === "live" ? "● Live Real-Time" : "○ Recorded Mode"}
            </button>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !canSubmit}
              className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-paper font-bold text-sm border-[2px] border-ink shadow-[4px_4px_0_rgba(62,39,35,1)] hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Activity className="w-4 h-4 animate-spin" />
                  <span>{locale === "hi" ? "सर्च हो रहा है..." : locale === "bn" ? "খোঁজা হচ্ছে..." : "Searching SerpApi..."}</span>
                </>
              ) : (
                <>
                  <HeartPulse className="w-4 h-4" />
                  <span>{locale === "hi" ? "उपचार व सलाह खोजें" : locale === "bn" ? "চিকিৎসা ও পরামর্শ খুঁজুন" : "Get Veterinary Guidance"}</span>
                </>
              )}
            </Button>
          </div>
        </div>

      </div>
    </form>
  );
}
