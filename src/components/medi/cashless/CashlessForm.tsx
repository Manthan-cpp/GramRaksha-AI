"use client";

import { useState } from "react";
import type { AyushmanCashlessRequest } from "@/lib/medi/cashless-types";
import { STATE_HEALTH_AGENCIES } from "@/lib/medi/cashless-directory";
import { getClientEvidenceMode, setClientEvidenceMode } from "@/lib/evidence/client-state";

interface CashlessFormProps {
  onSubmit: (data: AyushmanCashlessRequest) => void;
  loading?: boolean;
}

interface CashlessFormProps {
  onSubmit: (data: AyushmanCashlessRequest) => void;
  loading?: boolean;
}

export function CashlessForm({ onSubmit, loading = false }: CashlessFormProps) {
  const [hospital, setHospital] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [procedure, setProcedure] = useState("");
  const [depositDemanded, setDepositDemanded] = useState<number | "">("");
  const [patientName, setPatientName] = useState("");
  const [pmjayId, setPmjayId] = useState("");
  const [demandedReason, setDemandedReason] = useState("");

  const [mode, setModeState] = useState<"live" | "recorded">(() => getClientEvidenceMode());

  const handleModeChange = (newMode: "live" | "recorded") => {
    setClientEvidenceMode(newMode);
    setModeState(newMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital.trim() || !city.trim() || !procedure.trim() || !depositDemanded || Number(depositDemanded) <= 0) return;

    onSubmit({
      hospital: hospital.trim(),
      city: city.trim(),
      state: state.trim() || "National",
      procedure: procedure.trim(),
      depositDemanded: Number(depositDemanded),
      patientName: patientName.trim() || undefined,
      pmjayId: pmjayId.trim() || undefined,
      demandedReason: demandedReason.trim() || undefined
    });
  };

  const statesList = Object.values(STATE_HEALTH_AGENCIES).map((s) => s.state);

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Main Dispute Form */}
      <form onSubmit={handleSubmit} className="bg-paper rounded-2xl border border-ink/15 p-6 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-ink/10">
          <div>
            <h2 className="font-display text-xl text-ink font-bold">
              Hospital Admission & Advance Deposit Details
            </h2>
            <p className="text-xs text-ink-soft">
              Enter the hospital details to check empanelment and invoke PM-JAY Clause 8.2 protection
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-paper-2 border border-ink/15 text-xs font-semibold">
            <button
              type="button"
              onClick={() => handleModeChange("recorded")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === "recorded" ? "bg-nil text-paper font-bold shadow-xs" : "text-ink hover:text-nil"
              }`}
            >
              Recorded Replay
            </button>
            <button
              type="button"
              onClick={() => handleModeChange("live")}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                mode === "live" ? "bg-nil text-paper font-bold shadow-xs" : "text-ink hover:text-nil"
              }`}
            >
              Live SerpApi
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Hospital Name *
            </label>
            <input
              type="text"
              required
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              placeholder="e.g., Apex Multispeciality Hospital"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              City / District *
            </label>
            <input
              type="text"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g., Varanasi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              State (for State Health Agency Lookup) *
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            >
              <option value="">-- Select State --</option>
              {statesList.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Treatment / Procedure / Ward *
            </label>
            <input
              type="text"
              required
              value={procedure}
              onChange={(e) => setProcedure(e.target.value)}
              placeholder="e.g., Emergency C-Section / ICU Admission"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-terracotta/10 border border-terracotta/30">
          <label className="block text-xs font-bold uppercase tracking-wider text-terracotta mb-1.5">
            Advance Cash Deposit Demanded (₹) *
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-ink">
              ₹
            </span>
            <input
              type="number"
              min={1}
              required
              value={depositDemanded || ""}
              onChange={(e) => setDepositDemanded(Number(e.target.value))}
              placeholder="e.g., 20000"
              className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-terracotta/40 bg-paper text-ink font-mono text-base font-bold focus:outline-hidden focus:border-terracotta transition-colors"
            />
          </div>
          <p className="text-[11px] text-ink-soft mt-1">
            Amount the admission counter has demanded upfront before allotting bed or starting procedure.
          </p>
        </div>

        {/* Optional Beneficiary Details for Formal Letter */}
        <div className="border-t border-ink/15 pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Beneficiary & Card Details (Optional for Letter Generation)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-ink-soft mb-1">
                Patient / Beneficiary Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                placeholder="e.g., Sunita Devi"
                className="w-full px-3 py-2 rounded-xl border border-ink/20 bg-paper text-ink text-xs focus:outline-hidden focus:border-nil"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink-soft mb-1">
                Ayushman Golden Card ID / ABHA Number
              </label>
              <input
                type="text"
                value={pmjayId}
                onChange={(e) => setPmjayId(e.target.value)}
                placeholder="e.g., PMJAY-UP-88421-A"
                className="w-full px-3 py-2 rounded-xl border border-ink/20 bg-paper text-ink text-xs font-mono focus:outline-hidden focus:border-nil"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-soft mb-1">
              Reason Given by Hospital for Demanding Deposit (Optional)
            </label>
            <input
              type="text"
              value={demandedReason}
              onChange={(e) => setDemandedReason(e.target.value)}
              placeholder="e.g., Server down / quota exhausted / security deposit for medicines"
              className="w-full px-3 py-2 rounded-xl border border-ink/20 bg-paper text-ink text-xs focus:outline-hidden focus:border-nil"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl font-display font-bold text-sm md:text-base text-paper bg-nil hover:bg-nil/90 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
              <span>Verifying Empanelment & Statutory Rules...</span>
            </>
          ) : (
            <>
              <span>🛡️ Check Empanelment & Activate Cashless Shield</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
