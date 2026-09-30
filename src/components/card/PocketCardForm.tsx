"use client";

import { useState } from "react";
import type { VillagePocketCardRequest } from "@/lib/pocket-card/types";
import { getClientEvidenceMode, setClientEvidenceMode } from "@/lib/evidence/client-state";

interface PocketCardFormProps {
  onSubmit: (request: VillagePocketCardRequest) => void;
  loading?: boolean;
}

interface Preset {
  label: string;
  badge: string;
  data: VillagePocketCardRequest;
}

const PRESETS: Preset[] = [
  {
    label: "Varanasi (UP) — Babura (Pindra Block)",
    badge: "⚡ Recorded Live Capture",
    data: {
      state: "Uttar Pradesh",
      district: "Varanasi",
      block: "Pindra",
      village: "Babura",
      pinCode: "221206",
      panchayatPradhanName: "Shri Ramakant Patel",
      pradhanPhone: "9839123456"
    }
  },
  {
    label: "Bharatpur (RJ) — Kumher (Mustard Belt)",
    badge: "Rajasthan Calamity Hub",
    data: {
      state: "Rajasthan",
      district: "Bharatpur",
      block: "Kumher",
      village: "Kumher Rural",
      pinCode: "321201",
      panchayatPradhanName: "Smt. Sharda Devi",
      pradhanPhone: "9414234567"
    }
  },
  {
    label: "Bardhaman (WB) — Kalna (Paddy Zone)",
    badge: "West Bengal Agri",
    data: {
      state: "West Bengal",
      district: "Purba Bardhaman",
      block: "Kalna",
      village: "Dhatrigram",
      pinCode: "713405",
      panchayatPradhanName: "Shri Subhasish Ghosh",
      pradhanPhone: "9732123456"
    }
  },
  {
    label: "Patna (BR) — Bihta Block",
    badge: "Bihar Agri Hub",
    data: {
      state: "Bihar",
      district: "Patna",
      block: "Bihta",
      village: "Katesar",
      pinCode: "801103",
      panchayatPradhanName: "Shri Dharmendra Yadav",
      pradhanPhone: "9934123456"
    }
  }
];

export function PocketCardForm({ onSubmit, loading = false }: PocketCardFormProps) {
  const [state, setState] = useState(PRESETS[0].data.state);
  const [district, setDistrict] = useState(PRESETS[0].data.district);
  const [block, setBlock] = useState(PRESETS[0].data.block);
  const [village, setVillage] = useState(PRESETS[0].data.village);
  const [pinCode, setPinCode] = useState(PRESETS[0].data.pinCode || "");
  const [pradhanName, setPradhanName] = useState(PRESETS[0].data.panchayatPradhanName || "");
  const [pradhanPhone, setPradhanPhone] = useState(PRESETS[0].data.pradhanPhone || "");

  const [mode, setModeState] = useState<"live" | "recorded">(() => getClientEvidenceMode());

  const handleModeChange = (newMode: "live" | "recorded") => {
    setClientEvidenceMode(newMode);
    setModeState(newMode);
  };

  const handleApplyPreset = (p: Preset) => {
    setState(p.data.state);
    setDistrict(p.data.district);
    setBlock(p.data.block);
    setVillage(p.data.village);
    setPinCode(p.data.pinCode || "");
    setPradhanName(p.data.panchayatPradhanName || "");
    setPradhanPhone(p.data.pradhanPhone || "");
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
      {/* Quick Test Presets */}
      <div className="bg-paper-2 rounded-3xl border border-nil/20 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <span className="text-xs font-bold uppercase tracking-wider text-ink">
              Quick Test Presets (Instant Demonstration)
            </span>
          </div>
          <span className="text-[11px] text-ink-soft">Click any preset to pre-fill village location</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESETS.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(p)}
              className="text-left p-3 rounded-2xl border border-ink/15 hover:border-nil bg-paper hover:bg-paper-2 transition-all group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-nil/15 text-nil truncate max-w-[120px]">
                  {p.badge}
                </span>
                <span className="text-xs text-ink-soft group-hover:text-nil group-hover:translate-x-0.5 transition-transform font-bold">
                  &rarr;
                </span>
              </div>
              <div className="text-xs font-bold text-ink line-clamp-1">{p.label}</div>
              <div className="text-[10px] text-ink-soft truncate mt-0.5">
                {p.data.village}, {p.data.district}
              </div>
            </button>
          ))}
        </div>
      </div>

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
