"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { Evidence, FasalDecision, FasalPhotoEvidence } from "@/lib/schemas";
import { FasalCountdownCard } from "./FasalCountdownCard";
import { FasalHelplineBar } from "./FasalHelplineBar";
import { FasalEvidenceLog } from "./FasalEvidenceLog";
import { FasalLetterModal } from "./FasalLetterModal";
import { saveFasalCase } from "@/lib/storage/fasal-cases";
import {
  MapPin,
  ExternalLink,
  Bookmark,
  Check,
  RotateCcw,
  Phone,
  FileCheck2
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface FasalResultsProps {
  decision: FasalDecision;
  evidence: Evidence[];
  photos: FasalPhotoEvidence[];
  onReset: () => void;
  mode: "live" | "recorded";
}

export function FasalResults({
  decision,
  evidence,
  photos,
  onReset,
  mode
}: FasalResultsProps) {
  const locale = useLocale() as "en" | "hi" | "bn";
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (saved || isSaving) return;
    setIsSaving(true);
    try {
      await saveFasalCase({
        id: crypto.randomUUID(),
        module: "fasal",
        version: 1,
        createdAt: new Date().toISOString(),
        locale,
        incident: {
          calamityType: decision.calamityType,
          incidentTime: decision.incidentTime,
          state: decision.state,
          district: decision.district,
          village: decision.village,
          khasraNo: decision.khasraNo,
          applicationNo: decision.applicationNo,
          bankAccountRef: decision.bankAccountRef,
          crop: decision.crop,
          areaAcres: decision.areaAcres,
          lossPercentage: decision.lossPercentage,
          farmerName: decision.farmerName,
          farmerPhone: decision.farmerPhone
        },
        photos,
        decision,
        evidence,
        mode,
        warnings: []
      });
      setSaved(true);
    } catch (e) {
      console.error("Failed to save fasal case:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Hero Countdown Card */}
      <FasalCountdownCard
        initialCountdown={decision.countdown}
        incidentTime={decision.incidentTime}
        calamityLabel={decision.calamityLabel}
        crop={decision.crop}
        lossPercentage={decision.lossPercentage}
        district={decision.district}
        state={decision.state}
        village={decision.village}
        speechSummary={decision.speechSummary}
      />

      {/* 2. Tactile Helplines & Actions Bar */}
      <FasalHelplineBar
        insurer={decision.insurer}
        calamityLabel={decision.calamityLabel}
        crop={decision.crop}
        village={decision.village}
        district={decision.district}
        state={decision.state}
        lossPercentage={decision.lossPercentage}
        hoursLeft={decision.countdown.hoursLeft}
      />

      {/* 3. Official Entities: Insurer + District Agriculture Office */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Empanelled Insurer Card */}
        <div className="bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase font-bold text-ink-soft">
                {locale === "hi" ? "अधिसूचित बीमा कंपनी (PMFBY)" : locale === "bn" ? "অফিসিয়াল বিমা সংস্থা" : "Empanelled Crop Insurer"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-emerald-100 text-emerald-800">
                Official Cluster
              </span>
            </div>

            <h4 className="font-display text-xl text-ink font-bold mb-2">
              {decision.insurer.name}
            </h4>

            <div className="space-y-2 text-sm text-ink-soft mt-3">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-moss-deep shrink-0" />
                <span className="font-mono text-ink font-semibold">{decision.insurer.tollFree}</span>
                <span className="text-xs">(Toll-Free)</span>
              </div>
              {decision.insurer.email && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono">Email:</span>
                  <span className="text-xs text-ink">{decision.insurer.email}</span>
                </div>
              )}
            </div>
          </div>

          {decision.insurer.portalUrl && (
            <div className="pt-4 mt-4 border-t border-ink/10">
              <a
                href={decision.insurer.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss-deep hover:underline"
              >
                <span>{locale === "hi" ? "आधिकारिक पोर्टल खोलें" : locale === "bn" ? "পোর্টাল দেখুন" : "Visit Insurer Portal"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* District Agriculture Office (DAO) Card */}
        <div className="bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase font-bold text-ink-soft">
                {locale === "hi" ? "ज़िला कृषि अधिकारी (DAO)" : locale === "bn" ? "জেলা কৃষি আধিকারিক" : "District Agriculture Office"}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold bg-moss/20 text-moss-deep">
                {decision.district}
              </span>
            </div>

            <h4 className="font-display text-xl text-ink font-bold mb-2">
              {decision.daoOffice.officeName}
            </h4>

            <div className="space-y-2 text-sm text-ink-soft mt-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-moss-deep shrink-0 mt-0.5" />
                <span className="text-xs text-ink leading-relaxed">{decision.daoOffice.address}</span>
              </div>
              {decision.daoOffice.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-moss-deep shrink-0" />
                  <span className="font-mono text-ink text-xs">{decision.daoOffice.phone}</span>
                </div>
              )}
            </div>
          </div>

          {decision.daoOffice.mapsUrl && (
            <div className="pt-4 mt-4 border-t border-ink/10">
              <a
                href={decision.daoOffice.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-moss-deep hover:underline"
              >
                <span>{locale === "hi" ? "गूगल मैप्स पर रास्ता देखें" : locale === "bn" ? "গুগল ম্যাপে দেখুন" : "View Location on Google Maps"}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* 4. Local Evidence Photos */}
      <FasalEvidenceLog photos={photos} onChange={() => {}} disabled={true} />

      {/* 5. Formal 72-Hour Claim Notice (Letter) */}
      <FasalLetterModal
        incident={{
          calamityType: decision.calamityType,
          incidentTime: decision.incidentTime,
          state: decision.state,
          district: decision.district,
          village: decision.village,
          khasraNo: decision.khasraNo,
          applicationNo: decision.applicationNo,
          bankAccountRef: decision.bankAccountRef,
          crop: decision.crop,
          areaAcres: decision.areaAcres,
          lossPercentage: decision.lossPercentage,
          farmerName: decision.farmerName,
          farmerPhone: decision.farmerPhone
        }}
        insurer={decision.insurer}
        daoOfficeName={decision.daoOffice.officeName}
        daoAddress={decision.daoOffice.address}
        photos={photos}
      />

      {/* 6. Evidence Trail & Sources Cited */}
      {evidence.length > 0 && (
        <div className="bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <FileCheck2 className="w-5 h-5 text-moss-deep" />
            <h3 className="font-display text-xl text-ink">
              {locale === "hi" ? "सत्यापित साक्ष्य एवं सरकारी दिशानिर्देश" : locale === "bn" ? "সরকারি তথ্যসূত্র ও প্রমাণ" : "Verified Regulatory Sources & Local Evidence"}
            </h3>
          </div>
          <div className="space-y-3">
            {evidence.map((src) => (
              <div key={src.id} className="p-3.5 rounded-xl bg-paper-2 border border-ink/10 flex flex-col gap-1 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-ink truncate">{src.title}</span>
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-moss-deep font-mono font-medium hover:underline flex items-center gap-1 shrink-0"
                  >
                    <span>{src.publisher}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <p className="text-ink-soft leading-relaxed">{src.snippet}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. Bottom Navigation & Save to Dashboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-paper border border-ink/15 shadow-sm">
        <Button
          variant="secondary"
          size="default"
          onClick={onReset}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{locale === "hi" ? "नई आपदा की सूचना दें" : locale === "bn" ? "নতুন রিপোর্ট করুন" : "Report Another Calamity"}</span>
        </Button>

        <Button
          variant="primary"
          size="default"
          onClick={handleSave}
          disabled={saved || isSaving}
          className="flex items-center gap-2"
        >
          {saved ? (
            <>
              <Check className="w-4 h-4 text-paper" />
              <span>{locale === "hi" ? "केस डैशबोर्ड में सहेजा गया!" : locale === "bn" ? "কেস সেভ করা হয়েছে!" : "Saved to Dashboard!"}</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              <span>{isSaving ? "Saving..." : locale === "hi" ? "यह केस डैशबोर्ड में सहेजें" : locale === "bn" ? "ড্যাশবোর্ডে সংরক্ষণ করুন" : "Save Case to Dashboard"}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
