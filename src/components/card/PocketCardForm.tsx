"use client";

import { useState } from "react";
import type { VillagePocketCardRequest } from "@/lib/pocket-card/types";
import { getClientEvidenceMode, setClientEvidenceMode } from "@/lib/evidence/client-state";

interface PocketCardFormProps {
  onSubmit: (request: VillagePocketCardRequest) => void;
  loading?: boolean;
}

interface PocketCardFormProps {
  onSubmit: (request: VillagePocketCardRequest) => void;
  loading?: boolean;
}

export function PocketCardForm({ onSubmit, loading = false }: PocketCardFormProps) {
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [block, setBlock] = useState("");
  const [village, setVillage] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [pradhanName, setPradhanName] = useState("");
  const [pradhanPhone, setPradhanPhone] = useState("");

  const [mode, setModeState] = useState<"live" | "recorded">(() => getClientEvidenceMode());

  const handleModeChange = (newMode: "live" | "recorded") => {
    setClientEvidenceMode(newMode);
    setModeState(newMode);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.trim() || !district.trim() || !block.trim() || !village.trim()) return;

    onSubmit({
      state: state.trim(),
      district: district.trim(),
      block: block.trim(),
      village: village.trim(),
      pinCode: pinCode.trim() || undefined,
      panchayatPradhanName: pradhanName.trim() || undefined,
      pradhanPhone: pradhanPhone.trim() || undefined
    });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-paper rounded-3xl border border-ink/15 p-6 sm:p-8 shadow-sm space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-ink/10">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-ink font-bold">
              Village & Administrative Location
            </h2>
            <p className="text-xs text-ink-soft mt-0.5">
              Enter your village to prefetch and verify local PHC, Police Thana, KVK, and DLSA emergency contacts
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

        {/* State & District */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              State *
            </label>
            <input
              type="text"
              required
              value={state}
              onChange={(e) => setState(e.target.value)}
              placeholder="e.g., Uttar Pradesh"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper-2 text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              District *
            </label>
            <input
              type="text"
              required
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g., Varanasi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper-2 text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>
        </div>

        {/* Block & Village */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Block / Tehsil *
            </label>
            <input
              type="text"
              required
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              placeholder="e.g., Pindra"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper-2 text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              Village / Gram Panchayat *
            </label>
            <input
              type="text"
              required
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              placeholder="e.g., Babura"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper-2 text-ink text-sm focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink mb-1.5">
              PIN Code (Optional)
            </label>
            <input
              type="text"
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
              placeholder="e.g., 221206"
              className="w-full px-3.5 py-2.5 rounded-xl border border-ink/20 bg-paper-2 text-ink text-sm font-mono focus:outline-hidden focus:border-nil focus:ring-1 focus:ring-nil transition-colors"
            />
          </div>
        </div>

        {/* Optional Panchayat Pradhan Contact */}
        <div className="p-4 rounded-2xl bg-paper-2 border border-ink/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Local Panchayat Representative (Optional for Wallet Card)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-ink-soft mb-1">
                Pradhan / Mukhiya / Sarpanch Name
              </label>
              <input
                type="text"
                value={pradhanName}
                onChange={(e) => setPradhanName(e.target.value)}
                placeholder="e.g., Shri Ramakant Patel"
                className="w-full px-3 py-2 rounded-xl border border-ink/20 bg-paper text-ink text-xs focus:outline-hidden focus:border-nil"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-ink-soft mb-1">
                Pradhan Contact Phone
              </label>
              <input
                type="tel"
                value={pradhanPhone}
                onChange={(e) => setPradhanPhone(e.target.value)}
                placeholder="e.g., 9839123456"
                className="w-full px-3 py-2 rounded-xl border border-ink/20 bg-paper text-ink text-xs font-mono focus:outline-hidden focus:border-nil"
              />
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 px-6 rounded-2xl font-display font-bold text-sm md:text-base text-paper bg-nil hover:bg-nil/90 active:scale-[0.99] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-paper border-t-transparent rounded-full animate-spin" />
              <span>Querying Google Maps & Verified District Repositories...</span>
            </>
          ) : (
            <>
              <span>📇 Prefetch & Generate Emergency Pocket Card</span>
              <span>&rarr;</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
