"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import statesData from "@/data/states-and-districts.json";
import { Button } from "@/components/ui/button";
import { FasalIncidentInput, FasalPhotoEvidence } from "@/lib/fasal/types";
import { FasalEvidenceLog } from "./FasalEvidenceLog";
import {
  CloudLightning,
  CloudRain,
  Flame,
  Clock,
  Send,
  Zap,
  Info
} from "lucide-react";

interface FasalFormProps {
  onSubmit: (data: {
    incident: FasalIncidentInput;
    photos: FasalPhotoEvidence[];
    mode: "live" | "recorded";
  }) => void;
  isLoading?: boolean;
}

// Function to get ISO string for N hours ago in local time format for datetime-local
function getDefaultIncidentTime(hoursAgo = 8): string {
  const d = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function FasalForm({ onSubmit, isLoading = false }: FasalFormProps) {
  const locale = useLocale() as "en" | "hi" | "bn";

  const [calamityType, setCalamityType] = useState<FasalIncidentInput["calamityType"]>("hailstorm");
  const [incidentDateTime, setIncidentDateTime] = useState<string>(getDefaultIncidentTime(6));
  const [state, setState] = useState<string>("Maharashtra");
  const [district, setDistrict] = useState<string>("Pune");
  const [village, setVillage] = useState<string>("Baramati");
  const [crop, setCrop] = useState<string>("Onion");
  const [lossPercentage, setLossPercentage] = useState<number>(75);
  const [khasraNo, setKhasraNo] = useState<string>("142/3A");
  const [applicationNo, setApplicationNo] = useState<string>("PMFBY-2026-MH-99482");
  const [bankAccountRef, setBankAccountRef] = useState<string>("KCC-SBI-882194");
  const [farmerName, setFarmerName] = useState<string>("Ramesh Tukaram Patil");
  const [farmerPhone, setFarmerPhone] = useState<string>("9876543210");
  const [photos, setPhotos] = useState<FasalPhotoEvidence[]>([]);
  const [mode, setMode] = useState<"live" | "recorded">("live");

  const currentDistricts = statesData.states.find((s) => s.state === state)?.districts || [];

  const handleStateChange = (newState: string) => {
    setState(newState);
    const districts = statesData.states.find((s) => s.state === newState)?.districts || [];
    if (districts.length > 0) setDistrict(districts[0]);
  };

  const handleApplyPreset = (preset: {
    calamityType: FasalIncidentInput["calamityType"];
    state: string;
    district: string;
    village: string;
    crop: string;
    lossPercentage: number;
    hoursAgo: number;
    farmerName: string;
  }) => {
    setCalamityType(preset.calamityType);
    setState(preset.state);
    setDistrict(preset.district);
    setVillage(preset.village);
    setCrop(preset.crop);
    setLossPercentage(preset.lossPercentage);
    setIncidentDateTime(getDefaultIncidentTime(preset.hoursAgo));
    setFarmerName(preset.farmerName);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const incident: FasalIncidentInput = {
      calamityType,
      incidentTime: new Date(incidentDateTime).toISOString(),
      state,
      district,
      village,
      crop,
      lossPercentage,
      khasraNo: khasraNo.trim() || undefined,
      applicationNo: applicationNo.trim() || undefined,
      bankAccountRef: bankAccountRef.trim() || undefined,
      farmerName: farmerName.trim() || "Beneficiary Farmer",
      farmerPhone: farmerPhone.trim() || undefined
    };

    onSubmit({ incident, photos, mode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 1-Click Demo Presets */}
      <div className="bg-paper rounded-2xl border border-ink/15 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-moss-deep" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-ink-soft">
            {locale === "hi" ? "त्वरित परीक्षण परिदृश्य (1-Click Presets)" : locale === "bn" ? "দ্রুত টেস্ট সিনারিও" : "Quick Test Scenarios"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                calamityType: "hailstorm",
                state: "Maharashtra",
                district: "Pune",
                village: "Baramati",
                crop: "Onion",
                lossPercentage: 75,
                hoursAgo: 6,
                farmerName: "Ramesh Tukaram Patil"
              })
            }
            className="p-3 rounded-xl border border-ink/15 text-left hover:bg-paper-2 transition-all group"
          >
            <div className="text-xs font-bold text-ink group-hover:text-moss-deep flex items-center justify-between">
              <span>{locale === "hi" ? "पुणे ओलावृष्टि (प्याज)" : locale === "bn" ? "পুনে শিলাবৃষ্টি (পেঁয়াজ)" : "Pune Hailstorm (Onion)"}</span>
              <span className="text-[10px] font-mono text-moss-deep font-bold">6h ago</span>
            </div>
            <div className="text-[11px] text-ink-soft mt-1">Maharashtra • 75% crop loss</div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                calamityType: "flood_inundation",
                state: "West Bengal",
                district: "Nadia",
                village: "Kalyani Block",
                crop: "Paddy",
                lossPercentage: 65,
                hoursAgo: 14,
                farmerName: "Subir Mondal"
              })
            }
            className="p-3 rounded-xl border border-ink/15 text-left hover:bg-paper-2 transition-all group"
          >
            <div className="text-xs font-bold text-ink group-hover:text-moss-deep flex items-center justify-between">
              <span>{locale === "hi" ? "नादिया जलभराव (धान)" : locale === "bn" ? "নদিয়া প্লাবন (ধান)" : "Nadia Inundation (Paddy)"}</span>
              <span className="text-[10px] font-mono text-amber-600 font-bold">14h ago</span>
            </div>
            <div className="text-[11px] text-ink-soft mt-1">West Bengal • 65% loss</div>
          </button>

          <button
            type="button"
            onClick={() =>
              handleApplyPreset({
                calamityType: "lightning_cloudburst",
                state: "Bihar",
                district: "Samastipur",
                village: "Pusa Gram",
                crop: "Maize",
                lossPercentage: 90,
                hoursAgo: 58,
                farmerName: "Santosh Kumar"
              })
            }
            className="p-3 rounded-xl border border-ink/15 text-left hover:bg-paper-2 transition-all group"
          >
            <div className="text-xs font-bold text-ink group-hover:text-rose-600 flex items-center justify-between">
              <span>{locale === "hi" ? "समस्तीपुर आकाशीय बिजली" : locale === "bn" ? "সমস্তিপুর বজ্রপাত (ভুট্টা)" : "Bihar Lightning (Maize)"}</span>
              <span className="text-[10px] font-mono text-rose-600 font-bold">58h ago (Urgent)</span>
            </div>
            <div className="text-[11px] text-ink-soft mt-1">Bihar • 90% loss • 14h left</div>
          </button>
        </div>
      </div>

      {/* Main Form Box */}
      <div className="bg-paper rounded-2xl border border-ink/15 p-6 md:p-8 shadow-sm space-y-6">
        <div>
          <h2 className="font-display text-2xl text-ink">
            {locale === "hi" ? "आपदा एवं दावा विवरण दर्ज करें" : locale === "bn" ? "দুর্যোগ ও ফসলের তথ্য" : "Report Localized Calamity & Crop Loss"}
          </h2>
          <p className="text-xs text-ink-soft mt-1">
            {locale === "hi"
              ? "PMFBY नियम 15.3: ओलावृष्टि, जलभराव या बिजली गिरने पर 72 घंटे के भीतर सूचना देना अनिवार्य है।"
              : locale === "bn"
              ? "PMFBY নিয়ম ১৫.৩: শিলাবৃষ্টি, জলমগ্নতা বা বজ্রপাতে ৭২ ঘণ্টার মধ্যে ক্ষতি জানানো বাধ্যতামূলক।"
              : "PMFBY Clause 15.3: Loss intimation within 72 hours of localized calamity is required for claim admissibility."}
          </p>
        </div>

        {/* Calamity Type Selector */}
        <div>
          <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-2">
            {locale === "hi" ? "प्राकृतिक आपदा का प्रकार *" : locale === "bn" ? "দুর্যোগের ধরন *" : "Nature of Calamity *"}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              { id: "hailstorm", label: "Hailstorm", labelHi: "ओलावृष्टि", labelBn: "শিলাবৃষ্টি", icon: CloudRain },
              { id: "flood_inundation", label: "Inundation / Flood", labelHi: "जलभराव / बाढ़", labelBn: "জলমগ্নতা বা বন্যা", icon: CloudRain },
              { id: "lightning_cloudburst", label: "Lightning / Cloudburst", labelHi: "आकाशीय बिजली / बादल फटना", labelBn: "বজ্রপাত / মেঘভাঙা বৃষ্টি", icon: CloudLightning },
              { id: "unseasonal_rain", label: "Unseasonal Rain", labelHi: "बेमौसम बारिश", labelBn: "অসময়ের বৃষ্টি", icon: CloudRain },
              { id: "landslide", label: "Landslide", labelHi: "भूस्खलन", labelBn: "ভূমিধস", icon: Flame },
              { id: "other", label: "Other Calamity", labelHi: "अन्य स्थानीय आपदा", labelBn: "অন্যান্য দুর্যোগ", icon: Info }
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = calamityType === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setCalamityType(item.id as FasalIncidentInput["calamityType"])}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-moss-deep text-paper border-moss-deep shadow-sm"
                      : "bg-paper-2 border-ink/15 text-ink hover:border-ink/40"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isSelected ? "text-paper" : "text-moss-deep"}`} />
                  <span className="text-xs sm:text-sm font-semibold truncate">
                    {locale === "hi" ? item.labelHi : locale === "bn" ? item.labelBn : item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Date & Time of Occurrence */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "घटना की तिथि एवं समय *" : locale === "bn" ? "ঘটনার তারিখ ও সময় *" : "Incident Date & Time *"}
            </label>
            <input
              type="datetime-local"
              value={incidentDateTime}
              onChange={(e) => setIncidentDateTime(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper font-mono text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
            <span className="text-[11px] text-ink-soft mt-1 block">
              {locale === "hi" ? "इसी समय से 72-घंटे की विधिक उलटी गिनती शुरू होती है।" : locale === "bn" ? "এই সময় থেকে ৭২ ঘণ্টার উইন্ডো গণনা শুরু হবে।" : "The statutory 72-hour window starts from this timestamp."}
            </span>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "प्रभावित फसल का नाम *" : locale === "bn" ? "ক্ষতিগ্রস্ত ফসলের নাম *" : "Affected Crop Name *"}
            </label>
            <input
              type="text"
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              placeholder="e.g. Onion, Wheat, Paddy, Cotton"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>
        </div>

        {/* Location: State, District, Village */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "राज्य *" : locale === "bn" ? "রাজ্য *" : "State *"}
            </label>
            <select
              value={state}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            >
              {statesData.states.map((s) => (
                <option key={s.state} value={s.state}>
                  {s.state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "ज़िला *" : locale === "bn" ? "জেলা *" : "District *"}
            </label>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            >
              {currentDistricts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "ग्राम / पंचायत *" : locale === "bn" ? "গ্রাম / পঞ্চায়েত *" : "Village / Panchayat *"}
            </label>
            <input
              type="text"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g. Baramati"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>
        </div>

        {/* Estimated Loss Extent Slider */}
        <div className="bg-paper-2/60 p-4 rounded-xl border border-ink/10">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-mono font-bold uppercase tracking-wider text-ink-soft">
              {locale === "hi" ? "अनुमानित फसल क्षति प्रतिशत *" : locale === "bn" ? "আনুমানিক ক্ষতির শতকরা হার *" : "Estimated Crop Loss Extent *"}
            </label>
            <span className="font-mono text-base font-bold text-rose-600 bg-rose-50 px-3 py-0.5 rounded-lg border border-rose-200">
              {lossPercentage}%
            </span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={lossPercentage}
            onChange={(e) => setLossPercentage(Number(e.target.value))}
            className="w-full accent-moss-deep cursor-pointer"
          />
          <div className="flex justify-between text-[11px] font-mono text-ink-soft mt-1">
            <span>10% (Minor)</span>
            <span>50% (Moderate)</span>
            <span>100% (Total Failure)</span>
          </div>
        </div>

        {/* Land & Policy Optional Particulars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "खसरा / सर्वे संख्या" : locale === "bn" ? "খতিয়ান / দাগ নং" : "Khasra / Survey No."}
            </label>
            <input
              type="text"
              value={khasraNo}
              onChange={(e) => setKhasraNo(e.target.value)}
              placeholder="e.g. 142/3A"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "PMFBY पॉलिसी / आवेदन संख्या" : locale === "bn" ? "বিমা পলিসি নং" : "PMFBY Policy / App No."}
            </label>
            <input
              type="text"
              value={applicationNo}
              onChange={(e) => setApplicationNo(e.target.value)}
              placeholder="e.g. PMFBY-2026-MH"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "KCC / बैंक खाता संदर्भ" : locale === "bn" ? "KCC / ব্যাংক রেফারেন্স" : "Bank / KCC Reference"}
            </label>
            <input
              type="text"
              value={bankAccountRef}
              onChange={(e) => setBankAccountRef(e.target.value)}
              placeholder="e.g. KCC-SBI-882"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>
        </div>

        {/* Farmer Name & Contact */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "बीमित किसान का नाम *" : locale === "bn" ? "কৃষকের নাম *" : "Farmer Name *"}
            </label>
            <input
              type="text"
              value={farmerName}
              onChange={(e) => setFarmerName(e.target.value)}
              placeholder="e.g. Ramesh Tukaram Patil"
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-bold uppercase tracking-wider text-ink-soft mb-1.5">
              {locale === "hi" ? "मोबाइल नंबर" : locale === "bn" ? "মোবাইল নম্বর" : "Farmer Mobile No."}
            </label>
            <input
              type="tel"
              value={farmerPhone}
              onChange={(e) => setFarmerPhone(e.target.value)}
              placeholder="e.g. 9876543210"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            />
          </div>
        </div>

        {/* Embedded Evidence Photo Log */}
        <div className="pt-2">
          <FasalEvidenceLog photos={photos} onChange={setPhotos} disabled={isLoading} />
        </div>

        {/* Bottom Mode Selector & Submit */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-ink/10">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-ink-soft uppercase font-semibold">Mode:</span>
            <div className="flex rounded-lg border border-ink/15 p-0.5 bg-paper-2 text-xs font-medium">
              <button
                type="button"
                onClick={() => setMode("live")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  mode === "live" ? "bg-moss-deep text-paper font-semibold shadow-xs" : "text-ink hover:text-ink-soft"
                }`}
              >
                Live SerpApi
              </button>
              <button
                type="button"
                onClick={() => setMode("recorded")}
                className={`px-3 py-1 rounded-md transition-colors ${
                  mode === "recorded" ? "bg-moss-deep text-paper font-semibold shadow-xs" : "text-ink hover:text-ink-soft"
                }`}
              >
                Recorded Demo
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="big"
            disabled={isLoading}
            className="w-full sm:w-auto shadow-md"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 animate-spin" />
                <span>Planning 72-Hour Evidence...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>
                  {locale === "hi"
                    ? "72-घंटे की किट और उलटी गिनती शुरू करें"
                    : locale === "bn"
                    ? "৭২ ঘণ্টার কিট ও কাউন্টডাউন শুরু করুন"
                    : "Launch 72-Hour Kit & Countdown"}
                </span>
              </span>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
