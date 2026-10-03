"use client";

import type { VillagePocketCard } from "@/lib/pocket-card/types";

interface PocketCardPrintProps {
  card: VillagePocketCard;
}

export function PocketCardPrint({ card }: PocketCardPrintProps) {
  const phc = card.places.find((p) => p.category === "phc");
  const police = card.places.find((p) => p.category === "police");
  const kvk = card.places.find((p) => p.category === "kvk");
  const dao = card.places.find((p) => p.category === "dao");
  const dlsa = card.places.find((p) => p.category === "dlsa");

  return (
    <div className="pocket-card-print-container p-4 bg-white text-black font-sans text-[11px] leading-tight">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .pocket-card-print-container,
          .pocket-card-print-container * {
            visibility: visible;
          }
          .pocket-card-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 10mm;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div className="mb-4 p-3 bg-neutral-100 rounded-xl border border-neutral-300 print:hidden text-xs text-neutral-700 flex items-center justify-between">
        <div>
          <span className="font-bold">🖨️ Pocket Wallet Card (Standard ID Size: 85mm × 54mm)</span>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Cut along the dashed lines and fold in half to create a durable, double-sided wallet card.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="px-4 py-2 bg-neutral-900 text-white font-bold rounded-lg cursor-pointer hover:bg-neutral-850"
        >
          Print Now
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-center max-w-2xl mx-auto">
        <div className="w-[85.6mm] h-[54mm] border-2 border-dashed border-neutral-800 rounded-xl p-3 bg-white flex flex-col justify-between shadow-xs box-border overflow-hidden">
          <div className="border-b border-neutral-300 pb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🛡️</span>
              <div>
                <div className="font-bold text-[12px] tracking-tight uppercase">GramRaksha AI</div>
                <div className="text-[8px] text-neutral-600 font-semibold leading-none">
                  EMERGENCY POCKET CARD
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[10px] text-neutral-900 leading-none">
                {card.location.village}
              </div>
              <div className="text-[8px] text-neutral-500">
                {card.location.block}, {card.location.district}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1 my-auto text-[9.5px]">
            <div className="flex justify-between items-center bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
              <span className="font-medium">🚨 Emergency</span>
              <span className="font-mono font-bold">112</span>
            </div>
            <div className="flex justify-between items-center bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
              <span className="font-medium">🚑 Ambulance</span>
              <span className="font-mono font-bold">108</span>
            </div>
            <div className="flex justify-between items-center bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
              <span className="font-medium">🌾 Crop 72h</span>
              <span className="font-mono font-bold">14447</span>
            </div>
            <div className="flex justify-between items-center bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
              <span className="font-medium">🏥 Ayushman</span>
              <span className="font-mono font-bold">14555</span>
            </div>
            <div className="flex justify-between items-center bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
              <span className="font-medium">🛡️ Cyber Fraud</span>
              <span className="font-mono font-bold">1930</span>
            </div>
            <div className="flex justify-between items-center bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200">
              <span className="font-medium">⚖️ Legal Aid</span>
              <span className="font-mono font-bold">15100</span>
            </div>
            <div className="flex justify-between items-center bg-neutral-50 px-1.5 py-0.5 rounded border border-neutral-200 col-span-2">
              <span className="font-medium">🧑‍🌾 Kisan Call Centre (KCC)</span>
              <span className="font-mono font-bold">1800-180-1551</span>
            </div>
          </div>

          <div className="border-t border-neutral-200 pt-1 text-[7.5px] text-neutral-500 flex justify-between">
            <span>Govt. 24x7 Toll-Free</span>
            <span>CARD FRONT &bull; FOLD HERE &rarr;</span>
          </div>
        </div>

        <div className="w-[85.6mm] h-[54mm] border-2 border-dashed border-neutral-800 rounded-xl p-3 bg-white flex flex-col justify-between shadow-xs box-border overflow-hidden">
          <div className="border-b border-neutral-300 pb-1 flex justify-between items-center text-[9px] font-bold">
            <span>LOCAL VERIFIED SUPPORT</span>
            <span className="text-neutral-500 font-normal text-[8px]">{card.location.district} ({card.location.state})</span>
          </div>

          <div className="space-y-1 my-auto text-[8.5px]">
            {phc && (
              <div className="flex justify-between items-center">
                <span className="truncate max-w-[170px]">🏥 {phc.name}</span>
                <span className="font-mono font-bold shrink-0">{phc.phone}</span>
              </div>
            )}
            {police && (
              <div className="flex justify-between items-center">
                <span className="truncate max-w-[170px]">👮 {police.name}</span>
                <span className="font-mono font-bold shrink-0">{police.phone}</span>
              </div>
            )}
            {dao && (
              <div className="flex justify-between items-center">
                <span className="truncate max-w-[170px]">🌾 DAO Agriculture Office</span>
                <span className="font-mono font-bold shrink-0">{dao.phone}</span>
              </div>
            )}
            {kvk && (
              <div className="flex justify-between items-center">
                <span className="truncate max-w-[170px]">🔬 KVK Krishi Kendra</span>
                <span className="font-mono font-bold shrink-0">{kvk.phone}</span>
              </div>
            )}
            {dlsa && (
              <div className="flex justify-between items-center">
                <span className="truncate max-w-[170px]">⚖️ DLSA Legal Clinic</span>
                <span className="font-mono font-bold shrink-0">{dlsa.phone}</span>
              </div>
            )}
            {card.panchayatContact && (
              <div className="flex justify-between items-center pt-0.5 border-t border-neutral-200">
                <span className="truncate max-w-[170px]">🏛️ Pradhan: {card.panchayatContact.name}</span>
                <span className="font-mono font-bold shrink-0">{card.panchayatContact.phone}</span>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-200 pt-1 text-[7px] text-neutral-500 flex justify-between items-center">
            <span>CARD BACK &bull; Keep inside wallet or laminate</span>
            <span className="font-mono font-bold">gramraksha.gov.in</span>
          </div>
        </div>
      </div>
    </div>
  );
}
