"use client";

import { useState } from "react";
import type { AyushmanCashlessRequest } from "@/lib/medi/cashless-types";
import { STATE_HEALTH_AGENCIES } from "@/lib/medi/cashless-directory";
import { getClientEvidenceMode, setClientEvidenceMode } from "@/lib/evidence/client-state";

interface CashlessFormProps {
  onSubmit: (data: AyushmanCashlessRequest) => void;
  loading?: boolean;
}

interface Preset {
  label: string;
  badge: string;
  data: AyushmanCashlessRequest;
}

const PRESETS: Preset[] = [
  {
    label: "Varanasi: Emergency C-Section (₹20,000 Advance)",
    badge: "⚡ Recorded Live Capture",
    data: {
      hospital: "Apex Multispeciality Hospital",
      city: "Varanasi",
      state: "Uttar Pradesh",
      procedure: "Emergency C-Section",
      depositDemanded: 20000,
      patientName: "Sunita Devi",
      pmjayId: "PMJAY-UP-88421-A",
      demandedReason: "Bed allotment security deposit and pre-auth buffer"
    }
  },
  {
    label: "Patna: Laparoscopic Surgery (₹15,000 Deposit)",
    badge: "Bihar BSSS",
    data: {
      hospital: "Medipark Healthcare & Research",
      city: "Patna",
      state: "Bihar",
      procedure: "Laparoscopic Appendectomy",
      depositDemanded: 15000,
      patientName: "Rameshwar Prasad",
      pmjayId: "PMJAY-BR-10492-B",
      demandedReason: "Surgical consumables advance"
    }
  },
  {
    label: "Ranchi: Orthopedic Trauma (₹25,000 Advance)",
    badge: "Jharkhand JSAS",
    data: {
      hospital: "City Hospital & Trauma Center",
      city: "Ranchi",
      state: "Jharkhand",
      procedure: "Orthopedic Fracture Fixation",
      depositDemanded: 25000,
      patientName: "Manoj Soren",
      pmjayId: "PMJAY-JH-55219-C",
      demandedReason: "Implant cost security deposit"
    }
  }
];

export function CashlessForm({ onSubmit, loading = false }: CashlessFormProps) {
  const [hospital, setHospital] = useState(PRESETS[0].data.hospital);
  const [city, setCity] = useState(PRESETS[0].data.city);
  const [state, setState] = useState(PRESETS[0].data.state);
  const [procedure, setProcedure] = useState(PRESETS[0].data.procedure);
  const [depositDemanded, setDepositDemanded] = useState(PRESETS[0].data.depositDemanded);
  const [patientName, setPatientName] = useState(PRESETS[0].data.patientName || "");
  const [pmjayId, setPmjayId] = useState(PRESETS[0].data.pmjayId || "");
  const [demandedReason, setDemandedReason] = useState(PRESETS[0].data.demandedReason || "");

  const [mode, setModeState] = useState<"live" | "recorded">(() => getClientEvidenceMode());

  const handleModeChange = (newMode: "live" | "recorded") => {
    setClientEvidenceMode(newMode);
    setModeState(newMode);
  };

  const handleApplyPreset = (p: Preset) => {
    setHospital(p.data.hospital);
    setCity(p.data.city);
    setState(p.data.state);
    setProcedure(p.data.procedure);
    setDepositDemanded(p.data.depositDemanded);
    setPatientName(p.data.patientName || "");
    setPmjayId(p.data.pmjayId || "");
    setDemandedReason(p.data.demandedReason || "");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospital.trim() || !city.trim() || !procedure.trim() || depositDemanded <= 0) return;

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
      {/* Test Presets */}
      <div className="bg-paper rounded-2xl border border-nil/20 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink">
              Quick Test Presets (Instant Demonstration)
            </span>
          </div>
          <span className="text-[11px] text-ink-soft">Click any case to fill form instantly</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3.5 rounded-xl border border-ink/15 hover:border-nil bg-paper-2 hover:bg-paper transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-nil/15 text-nil">
                  {p.badge}
                </span>
                <span className="text-xs text-ink-soft group-hover:text-nil group-hover:translate-x-0.5 transition-transform font-bold">
                  &rarr;
                </span>
              </div>
              <div className="text-xs font-bold text-ink line-clamp-1">{p.label}</div>
              <div className="text-[11px] text-terracotta font-mono font-bold mt-1">
                Deposit: ₹{p.data.depositDemanded.toLocaleString("en-IN")}
              </div>
            </button>
          ))}
        </div>
      </div>

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
