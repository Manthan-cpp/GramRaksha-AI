"use client";

import { useState } from "react";
import type { AyushmanCashlessDecision } from "@/lib/medi/cashless-types";
import type { Evidence } from "@/lib/schemas";
import { CashlessEscalationCard } from "./CashlessEscalationCard";

interface CashlessResultsProps {
  decision: AyushmanCashlessDecision;
  evidence: Evidence[];
  onOpenLetter: () => void;
  onStartOver: () => void;
  onSave: () => void;
  saved: boolean;
  locale?: "en" | "hi" | "bn";
}

export function CashlessResults({
  decision,
  evidence,
  onOpenLetter,
  onStartOver,
  onSave,
  saved,
  locale = "en"
}: CashlessResultsProps) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleAudioPlayback = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(decision.speechSummary);
    utterance.lang = locale === "hi" ? "hi-IN" : locale === "bn" ? "bn-IN" : "en-IN";
    utterance.rate = 0.95;
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const depositFormatted = `₹${decision.depositDemanded.toLocaleString("en-IN")}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Statutory Banner */}
      <div className="bg-paper-2 rounded-2xl p-5 md:p-6 border-[1.5px] border-nil/30 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-nil text-paper text-xs font-bold uppercase tracking-wider">
              <span>🛡️ PM-JAY Cashless Shield Active</span>
            </div>
            <h2 className="font-display text-2xl md:text-3xl text-ink font-bold">
              Advance Deposit Demanded: <span className="text-terracotta font-mono font-bold">{depositFormatted}</span>
            </h2>
            <p className="text-xs md:text-sm text-ink-soft max-w-2xl leading-relaxed">
              Under National Health Authority PM-JAY Guidelines Clause 8.2, all empanelled secondary and tertiary care procedures are 100% cashless with ZERO upfront deposit.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAudioPlayback}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-xs cursor-pointer ${
                isPlayingAudio
                  ? "bg-terracotta text-paper border-terracotta animate-pulse"
                  : "bg-paper text-ink border-ink/25 hover:border-ink hover:bg-paper-2"
              }`}
            >
              <span>{isPlayingAudio ? "⏹️" : "🔊"}</span>
              <span>{isPlayingAudio ? "Stop Audio" : "Listen in Audio"}</span>
            </button>
            <button
              type="button"
              onClick={onOpenLetter}
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-nil text-paper hover:bg-nil/90 transition-all flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <span>📜</span>
              <span>View Statutory Notice</span>
            </button>
          </div>
        </div>
      </div>

      {/* Rapid Action Helpline Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <a
          href={`tel:${decision.helplines.nationalTollFree}`}
          className="flex items-center justify-between p-4 rounded-xl bg-nil/10 border border-nil/25 hover:bg-nil/15 transition-all group"
        >
          <div>
            <div className="text-[11px] font-bold text-nil uppercase tracking-wider">National Helpline</div>
            <div className="font-mono text-lg font-bold text-ink group-hover:text-nil">
              📞 {decision.helplines.nationalTollFree}
            </div>
            <div className="text-[11px] text-ink-soft">NHA 24x7 Toll-Free</div>
          </div>
          <span className="text-xs font-bold text-nil group-hover:translate-x-0.5 transition-transform">Dial &rarr;</span>
        </a>

        <a
          href={`tel:${decision.helplines.stateShaTollFree.replace(/[^0-9]/g, "")}`}
          className="flex items-center justify-between p-4 rounded-xl bg-moss/10 border border-moss/25 hover:bg-moss/15 transition-all group"
        >
          <div>
            <div className="text-[11px] font-bold text-moss-deep uppercase tracking-wider">State SHA Grievance</div>
            <div className="font-mono text-lg font-bold text-ink group-hover:text-moss-deep">
              📞 {decision.helplines.stateShaTollFree}
            </div>
            <div className="text-[11px] text-ink-soft truncate max-w-[200px]">{decision.helplines.stateShaName}</div>
          </div>
          <span className="text-xs font-bold text-moss-deep group-hover:translate-x-0.5 transition-transform">Dial &rarr;</span>
        </a>

        <div className="flex items-center justify-between p-4 rounded-xl bg-turmeric/15 border border-turmeric/40">
          <div>
            <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider">Hospital Desk</div>
            <div className="font-bold text-sm text-ink mt-0.5">PM Arogya Mitra (PMAM)</div>
            <div className="text-[11px] text-ink-soft">At {decision.hospital} counter</div>
          </div>
          <span className="text-lg">🏥</span>
        </div>
      </div>

      {/* Hospital Empanelment Status & Verification */}
      <div className="bg-paper rounded-2xl border border-ink/15 p-5 md:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏥</span>
            <div>
              <h3 className="font-display text-lg text-ink font-bold">
                {decision.hospital}
              </h3>
              <p className="text-xs text-ink-soft">
                {decision.city}, {decision.state} &bull; Procedure: {decision.procedure}
              </p>
            </div>
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full border ${
              decision.empanelmentStatus === "empanelled_confirmed"
                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                : decision.empanelmentStatus === "listed_in_registry"
                ? "bg-nil/15 text-nil border-nil/30"
                : "bg-amber-100 text-amber-900 border-amber-300"
            }`}
          >
            {decision.empanelmentStatus === "empanelled_confirmed"
              ? "✓ Empanelled on SHA Record"
              : decision.empanelmentStatus === "listed_in_registry"
              ? "📋 Listed in Health Registry"
              : "ℹ️ Empanelment Verification Advisory"}
          </span>
        </div>

        <div className="p-4 rounded-xl bg-paper-2 border border-ink/10 text-xs md:text-sm text-ink leading-relaxed">
          <p className="font-medium">{decision.empanelmentStatement}</p>
        </div>

        {/* Beneficiary Details */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-paper-2 border border-ink/10">
            <span className="text-ink-soft block text-[10px] uppercase font-semibold">Patient Name</span>
            <span className="font-bold text-ink truncate block text-sm">{decision.patientName}</span>
          </div>
          <div className="p-3 rounded-xl bg-paper-2 border border-ink/10">
            <span className="text-ink-soft block text-[10px] uppercase font-semibold">Card / ABHA ID</span>
            <span className="font-bold font-mono text-ink truncate block text-sm">{decision.pmjayId}</span>
          </div>
          <div className="p-3 rounded-xl bg-paper-2 border border-ink/10">
            <span className="text-ink-soft block text-[10px] uppercase font-semibold">Statutory Clause</span>
            <span className="font-bold text-nil truncate block text-sm">{decision.statutoryClause.code}</span>
          </div>
          <div className="p-3 rounded-xl bg-paper-2 border border-ink/10">
            <span className="text-ink-soft block text-[10px] uppercase font-semibold">Zero-Deposit Mandate</span>
            <span className="font-bold text-moss-deep truncate block text-sm">Legally Enforceable</span>
          </div>
        </div>
      </div>

      {/* 4-Tier Escalation Ladder */}
      <CashlessEscalationCard tiers={decision.escalationLadder} />

      {/* Action Checklist for Distress Situation */}
      <div className="bg-paper rounded-2xl border border-ink/15 p-5 md:p-6 shadow-sm">
        <h3 className="font-display text-lg text-ink font-bold mb-1 flex items-center gap-2">
          <span>📋</span>
          <span>What to do Right Now at the Admission Desk</span>
        </h3>
        <p className="text-xs text-ink-soft mb-4">
          Key immediate protections to prevent signing away your cashless rights
        </p>

        <ul className="space-y-3 text-xs md:text-sm text-ink">
          {decision.guidanceTips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-nil/10 text-nil text-xs font-bold shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span className="leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Official SerpApi Verified Evidence */}
      <div className="bg-paper rounded-2xl border border-ink/15 p-5 md:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">🔍</span>
            <h3 className="font-display text-base text-ink font-bold">
              Official Government Evidence References ({decision.evidenceReferences.length})
            </h3>
          </div>
          <span className="text-xs text-ink-soft">
            Verified via SerpApi ({evidence?.length || decision.evidenceReferences.length} sources)
          </span>
        </div>

        <div className="space-y-3">
          {decision.evidenceReferences.map((ref, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-paper-2 border border-ink/10 text-xs">
              <div className="flex items-center justify-between gap-2 mb-1">
                <a
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-nil hover:underline line-clamp-1"
                >
                  {ref.title}
                </a>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-ink/10 text-ink shrink-0 font-semibold">
                  {ref.publisher}
                </span>
              </div>
              <p className="text-ink-soft text-[11px] leading-relaxed line-clamp-2">
                {ref.snippet}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl bg-paper border border-ink/15 shadow-sm">
        <button
          type="button"
          onClick={onStartOver}
          className="px-4 py-2.5 rounded-xl text-xs font-bold text-ink-soft hover:text-ink hover:bg-paper-2 transition-colors cursor-pointer"
        >
          &larr; Start New Check
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenLetter}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-nil/10 text-nil border border-nil/25 hover:bg-nil/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>📜</span>
            <span>Open Notice</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            disabled={saved}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              saved
                ? "bg-emerald-600 text-white cursor-default"
                : "bg-moss text-paper hover:bg-moss-deep shadow-sm cursor-pointer"
            }`}
          >
            <span>{saved ? "✓" : "💾"}</span>
            <span>{saved ? "Saved to Cases" : "Save Case to Dashboard"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
