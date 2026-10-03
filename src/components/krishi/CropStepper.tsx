"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CROPS, STATES_AND_DISTRICTS, GROWTH_STAGES } from "@/data/krishi";
import { Leaf, MapPin, Sprout, AlertCircle, Mic } from "lucide-react";
import { useVoiceInput } from "@/lib/voice/useVoiceInput";

export interface CropProfile {
  crop: string;
  state: string;
  district: string;
  stage: string;
  concern?: string;
}

export function CropStepper({ onComplete }: { onComplete: (profile: CropProfile) => void }) {
  const t = useTranslations("Krishi");
  const locale = useLocale();
  const [step, setStep] = useState(1);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState(2); // Default to index 2 (Flowering)
  const [concern, setConcern] = useState("");

  const { isListening, isSupported, toggleListening } = useVoiceInput({
    locale,
    onTranscript: (spokenText) => {
      setConcern((prev) => (prev ? `${prev} ${spokenText}` : spokenText));
    }
  });

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
    else if (selectedCrop && selectedState && selectedDistrict) {
      onComplete({
        crop: CROPS.find((crop) => crop.id === selectedCrop)?.name || selectedCrop,
        state: selectedState,
        district: selectedDistrict,
        stage: GROWTH_STAGES[selectedStage],
        concern: concern.trim() || undefined
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-paper-2 rounded-[16px] border-[1.5px] border-ink shadow-print">
      <div className="flex justify-between items-center mb-8 border-b-[1.5px] border-dashed border-ink-soft/30 pb-4">
        <h2 className="font-display text-2xl text-ink">{t("protect")}</h2>
        <span className="text-moss font-mono">{t("step", { step })}</span>
      </div>

      {step === 1 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-lg text-ink-soft mb-4">
            <Leaf className="w-5 h-5" /> {t("selectCrop")}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {CROPS.map(c => (
              <button
                key={c.id}
                aria-pressed={selectedCrop === c.id}
                onClick={() => setSelectedCrop(c.id)}
                className={`p-4 rounded-xl border-[1.5px] transition-all flex flex-col items-center gap-2 ${
                  selectedCrop === c.id 
                    ? "border-moss bg-moss/10 text-moss-deep" 
                    : "border-ink-soft/20 bg-paper text-ink hover:border-moss"
                }`}
              >
                <div className="w-10 h-10 bg-paper-2 rounded-full flex items-center justify-center border border-ink-soft/10">
                  🌱
                </div>
                <span className="font-medium">{t(`crops.${c.name}`)}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-lg text-ink-soft mb-4">
            <MapPin className="w-5 h-5" /> {t("selectLocation")}
          </div>
          <p className="text-xs text-ink-soft">{t("namesOriginal")}</p>
          <div className="space-y-4">
            <div>
              <label htmlFor="crop-state" className="block text-sm text-ink-soft mb-2">{t("state")}</label>
              <select 
                id="crop-state"
                className="w-full p-4 rounded-xl border-[1.5px] border-ink-soft/20 bg-paper text-ink focus:border-moss outline-none"
                value={selectedState || ""}
                onChange={(e) => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict(null);
                }}
              >
                <option value="" disabled>{t("chooseState")}</option>
                {Object.keys(STATES_AND_DISTRICTS).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            
            {selectedState && (
              <div>
                <label htmlFor="crop-district" className="block text-sm text-ink-soft mb-2">{t("district")}</label>
                <select 
                  id="crop-district"
                  className="w-full p-4 rounded-xl border-[1.5px] border-ink-soft/20 bg-paper text-ink focus:border-moss outline-none"
                  value={selectedDistrict || ""}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                >
                  <option value="" disabled>{t("chooseDistrict")}</option>
                  {(STATES_AND_DISTRICTS[selectedState] ?? []).map((d: string) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-lg text-ink-soft mb-4">
            <Sprout className="w-5 h-5" /> {t("stage")}
          </div>
          <div className="py-8 px-4">
            <input 
              type="range" 
              aria-label={t("stage")}
              aria-valuetext={t(`stages.${GROWTH_STAGES[selectedStage]}`)}
              min="0" 
              max={GROWTH_STAGES.length - 1} 
              value={selectedStage}
              onChange={(e) => setSelectedStage(Number(e.target.value))}
              className="w-full accent-moss"
            />
            <div className="flex justify-between mt-4 text-sm text-ink-soft">
              {GROWTH_STAGES.map((stage, i) => (
                <span key={stage} className={i === selectedStage ? "text-moss font-bold" : ""}>
                  {t(`stages.${stage}`)}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2 text-lg text-ink-soft mb-4">
            <AlertCircle className="w-5 h-5" /> {t("concern")}
          </div>
          <div className="relative">
            <textarea
              className="w-full p-4 rounded-xl border-[1.5px] border-ink-soft/20 bg-paper text-ink focus:border-moss outline-none resize-none min-h-[120px]"
              placeholder={t("placeholder")}
              aria-label={t("concern")}
              maxLength={240}
              value={concern}
              onChange={(e) => setConcern(e.target.value)}
            />
            <button
              type="button"
              onClick={toggleListening}
              disabled={!isSupported}
              title={
                isListening
                  ? locale === "hi"
                    ? "आवाज रिकॉर्डिंग रोकें"
                    : locale === "bn"
                    ? "রেকর্ডিং বন্ধ করুন"
                    : "Stop voice listening"
                  : isSupported
                  ? locale === "hi"
                    ? "बोलकर समस्या बताएं (माइक)"
                    : locale === "bn"
                    ? "কথা বলে সমস্যা জানান"
                    : "Tap to speak in your language"
                  : t("voice")
              }
              aria-label={isListening ? "Stop voice listening" : "Start voice listening"}
              className={`absolute bottom-4 right-4 p-3 rounded-full border-[1.5px] transition-all ${
                isListening
                  ? "bg-terracotta text-paper border-terracotta animate-pulse scale-110 shadow-md"
                  : isSupported
                  ? "bg-paper-2 border-ink text-ink hover:bg-moss/10 hover:text-moss hover:border-moss cursor-pointer"
                  : "bg-paper-2 border-ink text-ink opacity-40 cursor-not-allowed"
              }`}
            >
              <Mic className="w-5 h-5" />
            </button>
          </div>
          {isListening && (
            <p className="text-xs font-semibold text-terracotta animate-pulse flex items-center gap-1.5 -mt-2">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-ping inline-block" />
              {locale === "hi"
                ? "माइक चालू है... अपनी समस्या बोलें"
                : locale === "bn"
                ? "মাইক চালু আছে... বলুন"
                : "Microphone active... please speak"}
            </p>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-between">
        {step > 1 ? (
          <Button variant="quiet" onClick={() => setStep(step - 1)}>{t("back")}</Button>
        ) : <div />}
        
        <Button 
          variant="primary" 
          onClick={handleNext}
          disabled={
            (step === 1 && !selectedCrop) || 
            (step === 2 && !selectedDistrict)
          }
        >
          {step === 4 ? t("find") : t("continue")}
        </Button>
      </div>
    </div>
  );
}
