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

export function FasalForm({ onSubmit, isLoading = false }: FasalFormProps) {
  const locale = useLocale() as "en" | "hi" | "bn";

  const [calamityType, setCalamityType] = useState<FasalIncidentInput["calamityType"]>("hailstorm");
  const [incidentDateTime, setIncidentDateTime] = useState<string>("");
  const [state, setState] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [village, setVillage] = useState<string>("");
  const [crop, setCrop] = useState<string>("");
  const [lossPercentage, setLossPercentage] = useState<number>(50);
  const [khasraNo, setKhasraNo] = useState<string>("");
  const [applicationNo, setApplicationNo] = useState<string>("");
  const [bankAccountRef, setBankAccountRef] = useState<string>("");
  const [farmerName, setFarmerName] = useState<string>("");
  const [farmerPhone, setFarmerPhone] = useState<string>("");
  const [photos, setPhotos] = useState<FasalPhotoEvidence[]>([]);
  const [mode, setMode] = useState<"live" | "recorded">("live");

  const currentDistricts = statesData.states.find((s) => s.state === state)?.districts || [];

  const handleStateChange = (newState: string) => {
    setState(newState);
    setDistrict("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state || !district || !crop.trim() || !incidentDateTime || !village.trim() || !farmerName.trim()) {
      return;
    }

    const incident: FasalIncidentInput = {
      calamityType,
      incidentTime: new Date(incidentDateTime).toISOString(),
      state,
      district,
      village: village.trim(),
      crop: crop.trim(),
      lossPercentage,
      khasraNo: khasraNo.trim() || undefined,
      applicationNo: applicationNo.trim() || undefined,
      bankAccountRef: bankAccountRef.trim() || undefined,
      farmerName: farmerName.trim(),
      farmerPhone: farmerPhone.trim() || undefined
    };

    onSubmit({ incident, photos, mode });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40"
            >
              <option value="">{locale === "hi" ? "-- राज्य चुनें --" : locale === "bn" ? "-- রাজ্য নির্বাচন করুন --" : "-- Select State --"}</option>
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
              required
              disabled={!state}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-sm text-ink focus:outline-none focus:ring-2 focus:ring-moss/40 disabled:opacity-50"
            >
              <option value="">{locale === "hi" ? "-- ज़िला चुनें --" : locale === "bn" ? "-- জেলা নির্বাচন করুন --" : "-- Select District --"}</option>
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
