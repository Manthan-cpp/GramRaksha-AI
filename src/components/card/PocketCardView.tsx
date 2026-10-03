"use client";

import { useState } from "react";
import {
  Phone,
  Printer,
  Download,
  Share2,
  Bookmark,
  CheckCircle2,
  MapPin,
  ExternalLink,
  ShieldCheck,
  RotateCw,
  Building,
  HeartPulse,
  Scale,
  Leaf,
  Layers
} from "lucide-react";
import type { VillagePocketCard } from "@/lib/pocket-card/types";
import { downloadVCard, generateWhatsAppEmergencyText } from "@/lib/pocket-card/vcard";
import { PocketCardPrint } from "./PocketCardPrint";

interface PocketCardViewProps {
  card: VillagePocketCard;
  onReset: () => void;
  onSave?: () => void;
  saved?: boolean;
}

export function PocketCardView({ card, onReset, onSave, saved = false }: PocketCardViewProps) {
  const [activeSide, setActiveSide] = useState<"front" | "back">("front");
  const [showPrintLayout, setShowPrintLayout] = useState(false);
  const [copied, setCopied] = useState(false);

  const phc = card.places.find((p) => p.category === "phc");
  const police = card.places.find((p) => p.category === "police");
  const kvk = card.places.find((p) => p.category === "kvk");
  const dao = card.places.find((p) => p.category === "dao");
  const dlsa = card.places.find((p) => p.category === "dlsa");

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppEmergencyText(card);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, "_blank");
  };

  const handleCopyText = async () => {
    try {
      const text = generateWhatsAppEmergencyText(card);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      {/* Top Banner */}
      <div className="bg-paper-2 rounded-3xl p-6 sm:p-8 border-[1.5px] border-nil/30 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-nil text-paper text-xs font-bold uppercase tracking-wider">
            <span>📇 Verified Village Pocket Card</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl text-ink font-bold">
            {card.location.village}, <span className="text-nil">{card.location.district}</span>
          </h2>
          <p className="text-xs sm:text-sm text-ink-soft">
            Block: {card.location.block} &bull; State: {card.location.state}
            {card.location.pinCode ? ` &bull; PIN: ${card.location.pinCode}` : ""}
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-emerald-800 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pre-fetched & cached locally in IndexedDB &bull; Works 100% Offline</span>
          </div>
        </div>

        {/* Rapid Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowPrintLayout(!showPrintLayout)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-paper text-ink border border-ink/20 hover:bg-paper-2 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>{showPrintLayout ? "Hide Print View" : "Print Wallet Card"}</span>
          </button>

          <button
            type="button"
            onClick={() => downloadVCard(card)}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-paper text-ink border border-ink/20 hover:bg-paper-2 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Download .vcf</span>
          </button>

          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={saved}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-xs ${
                saved
                  ? "bg-emerald-600 text-white cursor-default"
                  : "bg-moss text-paper hover:bg-moss-deep cursor-pointer"
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>{saved ? "✓ Saved to Vault" : "Save Offline"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Print View Sheet (If toggled) */}
      {showPrintLayout && (
        <div className="bg-paper-2 p-6 rounded-3xl border border-ink/20 shadow-sm animate-fade-in space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-display font-bold text-sm text-ink">Print Preview (85mm × 54mm ID Pocket Card)</span>
            <button
              type="button"
              onClick={() => setShowPrintLayout(false)}
              className="text-xs text-ink-soft hover:text-ink cursor-pointer font-bold"
            >
              ✕ Close Preview
            </button>
          </div>
          <PocketCardPrint card={card} />
        </div>
      )}

      {/* Spoon-Fed Action Instructions */}
      <div className="bg-paper rounded-2xl border border-ink/15 p-5 md:p-6 shadow-sm space-y-3">
        <h3 className="font-display text-base md:text-lg text-ink font-bold flex items-center gap-2">
          <span>📋</span>
          <span>How to Use Your Offline Village Pocket Card</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-paper-2 border border-ink/10 space-y-1">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-nil text-paper flex items-center justify-center text-[10px] font-bold">1</span>
              <span>Print or Slip into Wallet</span>
            </div>
            <p className="text-ink-soft leading-relaxed">
              Click <strong>"Print Wallet Card"</strong> to print the standard card size. Cut along the border and slip it inside your phone case or pocket.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-paper-2 border border-ink/10 space-y-1">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-nil text-paper flex items-center justify-center text-[10px] font-bold">2</span>
              <span>1-Tap Phonebook Sync</span>
            </div>
            <p className="text-ink-soft leading-relaxed">
              Click <strong>"Download .vcf"</strong> to instantly import all local emergency numbers (PHC, Police Thana, KVK, DAO) into your phone contacts without typing.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-paper-2 border border-ink/10 space-y-1">
            <div className="font-bold text-ink flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-nil text-paper flex items-center justify-center text-[10px] font-bold">3</span>
              <span>Works with 0% Internet</span>
            </div>
            <p className="text-ink-soft leading-relaxed">
              Cached locally in your browser memory. Access all emergency contacts anytime during rural power cuts or with zero cellular tower signal.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Wallet Card Preview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">💳</span>
            <h3 className="font-display text-lg text-ink font-bold">
              Wallet Card Simulation
            </h3>
          </div>

          {/* Flip Side Toggle */}
          <div className="flex rounded-xl border border-ink/20 p-1 bg-paper-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveSide("front")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSide === "front"
                  ? "bg-nil text-paper font-bold shadow-xs"
                  : "text-ink hover:text-nil"
              }`}
            >
              Front: Lifelines
            </button>
            <button
              type="button"
              onClick={() => setActiveSide("back")}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                activeSide === "back"
                  ? "bg-nil text-paper font-bold shadow-xs"
                  : "text-ink hover:text-nil"
              }`}
            >
              Back: Local Support
            </button>
          </div>
        </div>

        {/* 3D Realistic Wallet Card Render */}
        <div className="flex justify-center">
          <div className="w-full max-w-md aspect-[1.586/1] rounded-3xl border-2 border-ink bg-paper p-5 sm:p-6 shadow-2xl flex flex-col justify-between relative overflow-hidden transition-all">
            {/* Subtle background security pattern */}
            <div className="absolute -right-8 -bottom-8 opacity-5 pointer-events-none">
              <span className="text-9xl">🛡️</span>
            </div>

            {activeSide === "front" ? (
              /* FRONT SIDE: Lifelines */
              <>
                <div className="border-b border-ink/15 pb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-nil text-paper flex items-center justify-center font-bold text-xs shadow-xs">
                      🛡️
                    </span>
                    <div>
                      <div className="font-display font-bold text-sm text-ink leading-tight">
                        GramRaksha AI
                      </div>
                      <div className="text-[9px] text-ink-soft uppercase tracking-wider font-semibold">
                        Emergency Pocket Card
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display font-bold text-xs text-nil truncate max-w-[130px]">
                      {card.location.village}
                    </div>
                    <div className="text-[9px] text-ink-soft truncate max-w-[130px]">
                      {card.location.block}, {card.location.district}
                    </div>
                  </div>
                </div>

                {/* 24x7 Lifelines 2-Column Grid */}
                <div className="grid grid-cols-2 gap-2 my-auto text-xs py-1">
                  <div className="p-1.5 rounded-lg bg-paper-2 border border-ink/10 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-ink">🚨 Emergency</span>
                    <span className="font-mono font-bold text-terracotta">112</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-paper-2 border border-ink/10 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-ink">🚑 Ambulance</span>
                    <span className="font-mono font-bold text-emerald-700">108</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-paper-2 border border-ink/10 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-ink">🌾 Crop 72h</span>
                    <span className="font-mono font-bold text-amber-800">14447</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-paper-2 border border-ink/10 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-ink">🏥 Ayushman</span>
                    <span className="font-mono font-bold text-nil">14555</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-paper-2 border border-ink/10 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-ink">🛡️ Cyber Crime</span>
                    <span className="font-mono font-bold text-rose-700">1930</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-paper-2 border border-ink/10 flex justify-between items-center">
                    <span className="text-[11px] font-bold text-ink">⚖️ Legal Aid</span>
                    <span className="font-mono font-bold text-purple-700">15100</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-paper-2 border border-ink/10 flex justify-between items-center col-span-2">
                    <span className="text-[11px] font-bold text-ink">🧑‍🌾 Kisan Call Centre (KCC)</span>
                    <span className="font-mono font-bold text-moss-deep">1800-180-1551</span>
                  </div>
                </div>

                <div className="border-t border-ink/15 pt-1.5 flex justify-between items-center text-[10px] text-ink-soft">
                  <span>Govt. 24x7 Toll-Free</span>
                  <button
                    type="button"
                    onClick={() => setActiveSide("back")}
                    className="font-bold text-nil hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Back Side</span>
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </>
            ) : (
              /* BACK SIDE: Local Support */
              <>
                <div className="border-b border-ink/15 pb-1.5 flex items-center justify-between text-xs font-bold text-ink">
                  <div className="flex items-center gap-1.5">
                    <span>🏛️</span>
                    <span>Local Verified Support</span>
                  </div>
                  <span className="text-[10px] text-ink-soft font-normal">
                    {card.location.district} ({card.location.state})
                  </span>
                </div>

                <div className="space-y-1.5 my-auto text-[11px]">
                  {phc && (
                    <div className="flex justify-between items-center py-0.5 border-b border-ink/5">
                      <span className="truncate max-w-[210px] font-medium text-ink">🏥 {phc.name}</span>
                      <a href={`tel:${phc.phone.replace(/[^0-9]/g, "")}`} className="font-mono font-bold text-nil hover:underline shrink-0">
                        {phc.phone}
                      </a>
                    </div>
                  )}
                  {police && (
                    <div className="flex justify-between items-center py-0.5 border-b border-ink/5">
                      <span className="truncate max-w-[210px] font-medium text-ink">👮 {police.name}</span>
                      <a href={`tel:${police.phone.replace(/[^0-9]/g, "")}`} className="font-mono font-bold text-nil hover:underline shrink-0">
                        {police.phone}
                      </a>
                    </div>
                  )}
                  {dao && (
                    <div className="flex justify-between items-center py-0.5 border-b border-ink/5">
                      <span className="truncate max-w-[210px] font-medium text-ink">🌾 Agriculture Office (DAO)</span>
                      <a href={`tel:${dao.phone.replace(/[^0-9]/g, "")}`} className="font-mono font-bold text-amber-800 hover:underline shrink-0">
                        {dao.phone}
                      </a>
                    </div>
                  )}
                  {kvk && (
                    <div className="flex justify-between items-center py-0.5 border-b border-ink/5">
                      <span className="truncate max-w-[210px] font-medium text-ink">🔬 KVK Center</span>
                      <a href={`tel:${kvk.phone.replace(/[^0-9]/g, "")}`} className="font-mono font-bold text-moss-deep hover:underline shrink-0">
                        {kvk.phone}
                      </a>
                    </div>
                  )}
                  {dlsa && (
                    <div className="flex justify-between items-center py-0.5 border-b border-ink/5">
                      <span className="truncate max-w-[210px] font-medium text-ink">⚖️ DLSA Legal Aid</span>
                      <a href={`tel:${dlsa.phone.replace(/[^0-9]/g, "")}`} className="font-mono font-bold text-purple-700 hover:underline shrink-0">
                        {dlsa.phone}
                      </a>
                    </div>
                  )}
                  {card.panchayatContact && (
                    <div className="flex justify-between items-center py-0.5">
                      <span className="truncate max-w-[210px] font-medium text-ink">🏛️ Pradhan: {card.panchayatContact.name}</span>
                      <a href={`tel:${card.panchayatContact.phone.replace(/[^0-9]/g, "")}`} className="font-mono font-bold text-emerald-700 hover:underline shrink-0">
                        {card.panchayatContact.phone}
                      </a>
                    </div>
                  )}
                </div>

                <div className="border-t border-ink/15 pt-1.5 flex justify-between items-center text-[10px] text-ink-soft">
                  <span>Keep inside wallet or phone case</span>
                  <button
                    type="button"
                    onClick={() => setActiveSide("front")}
                    className="font-bold text-nil hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View Front Side</span>
                    <RotateCw className="w-3 h-3" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Comprehensive Verified Directory Cards */}
      <div className="bg-paper rounded-3xl border border-ink/15 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-4">
          <div>
            <h3 className="font-display text-xl text-ink font-bold flex items-center gap-2">
              <span>🏥</span>
              <span>Local District & Village Directory ({card.places.length} Verified Facilities)</span>
            </h3>
            <p className="text-xs text-ink-soft mt-0.5">
              Verified addresses and direct dial links for emergency, agricultural, and legal authorities
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {card.places.map((place) => (
            <div
              key={place.id}
              className="p-4 rounded-2xl bg-paper-2 border border-ink/10 hover:border-nil/40 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nil/10 text-nil">
                    {place.badge || "Verified District Facility"}
                  </span>
                  {place.distance && (
                    <span className="text-[11px] text-ink-soft font-mono">
                      {place.distance}
                    </span>
                  )}
                </div>

                <h4 className="font-bold text-sm text-ink">{place.name}</h4>
                <p className="text-xs text-ink-soft mt-1 leading-relaxed line-clamp-2">
                  <MapPin className="w-3 h-3 inline-block mr-1 text-ink-soft shrink-0" />
                  {place.address}
                </p>
              </div>

              <div className="pt-2 border-t border-ink/10 flex items-center justify-between gap-2">
                <a
                  href={`tel:${place.phone.replace(/[^0-9]/g, "")}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-mono text-xs font-bold bg-paper border border-ink/15 text-nil hover:bg-nil hover:text-paper transition-all cursor-pointer shadow-2xs"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call {place.phone}</span>
                </a>

                {place.mapsUrl && (
                  <a
                    href={place.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-ink-soft hover:text-nil flex items-center gap-1"
                  >
                    <span>View Map</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* WhatsApp & Copy Share Toolbar */}
      <div className="bg-paper-2 rounded-3xl border border-ink/15 p-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h4 className="font-display font-bold text-sm text-ink">Share Emergency Directory</h4>
          <p className="text-xs text-ink-soft mt-0.5">
            Send this verified contact sheet across your village or family WhatsApp groups
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyText}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-paper border border-ink/20 text-ink hover:bg-paper-2 transition-all cursor-pointer shadow-2xs"
          >
            {copied ? "✓ Copied Text" : "📋 Copy Summary"}
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-700 text-paper hover:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>

      {/* Bottom Start New / Reset */}
      <div className="flex justify-between items-center pt-2">
        <button
          type="button"
          onClick={onReset}
          className="px-4 py-2 text-xs font-bold text-ink-soft hover:text-ink hover:bg-paper-2 rounded-xl transition-colors cursor-pointer"
        >
          &larr; Create Another Village Card
        </button>

        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 text-xs font-bold bg-ink text-paper hover:bg-ink/90 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          🖨️ Direct Print
        </button>
      </div>
    </div>
  );
}
