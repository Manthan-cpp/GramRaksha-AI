"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Activity, X, ShieldCheck } from "lucide-react";
import type { EvidenceMode } from "@/lib/schemas";
import {
  getClientEvidenceMetrics,
  getClientEvidenceMode,
  subscribeToClientEvidenceState,
  setClientEvidenceMode,
  type ClientEvidenceMetrics
} from "@/lib/evidence/client-state";

interface EngineDiagnosticsProps {
  isOpen?: boolean;
  onClose?: () => void;
  floatingButton?: boolean;
}

export function EngineDiagnostics({
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  floatingButton = false
}: EngineDiagnosticsProps) {
  const searchParams = useSearchParams();
  const [internalOpen, setInternalOpen] = useState(false);
  const [mode, setMode] = useState<EvidenceMode>(() => getClientEvidenceMode());
  const [metrics, setMetrics] = useState<ClientEvidenceMetrics>(() => getClientEvidenceMetrics());

  const showTrigger = searchParams.get("demo") === "1" || searchParams.get("diagnostics") === "1";

  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalOpen;
  const onClose = controlledOnClose || (() => setInternalOpen(false));

  useEffect(() => {
    return subscribeToClientEvidenceState(() => {
      setMode(getClientEvidenceMode());
      setMetrics(getClientEvidenceMetrics());
    });
  }, []);

  if (!isOpen && floatingButton && showTrigger) {
    return (
      <button
        onClick={() => setInternalOpen(true)}
        className="fixed bottom-6 right-6 px-3.5 py-2 bg-ink text-paper rounded-full shadow-lg z-50 hover:scale-105 transition-transform flex items-center gap-2 border border-ink/20 cursor-pointer text-xs font-mono font-semibold"
        title="SerpApi Engine Diagnostics"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span>Diagnostics</span>
      </button>
    );
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-xs animate-fade-in font-body">
      <div
        className="bg-paper-2 border-[1.5px] border-ink rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        <div className="bg-ink text-paper p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="font-display font-bold text-sm">SerpApi Engine & Search Diagnostics</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-paper/70 hover:text-paper hover:bg-paper/10 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-ink text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-ink/15">
            <div>
              <span className="font-bold text-ink block">Evidence Source Engine</span>
              <span className="text-[11px] text-ink-soft">Switch between real-time SerpApi or deterministic test replay</span>
            </div>
            <select
              value={mode}
              onChange={(e) => {
                const nextMode = e.target.value as EvidenceMode;
                setMode(nextMode);
                setClientEvidenceMode(nextMode);
              }}
              className="bg-paper border border-ink/20 rounded-xl px-2.5 py-1.5 font-bold text-ink outline-none cursor-pointer"
            >
              <option value="live">Live SerpApi</option>
              <option value="recorded">Recorded Replay</option>
            </select>
          </div>

          <div className="space-y-2 bg-paper p-3.5 rounded-2xl border border-ink/10 font-mono text-xs">
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Engine Status:</span>
              <span className="font-bold text-moss flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {mode === "live" ? "SerpApi 3-Engine Live" : "Deterministic Captured Replay"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Searches Dispatched:</span>
              <span className="font-bold text-ink">{metrics.queriesRun}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Live Outbound Requests:</span>
              <span className="font-bold text-nil">{metrics.liveSearches}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Local Cache Hits:</span>
              <span className="font-bold text-amber-700">{metrics.cacheHits}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Sources Grounded & Kept:</span>
              <span className="font-bold text-emerald-700">{metrics.sourcesKept}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-ink-soft">Unverified Dropped:</span>
              <span className="font-bold text-terracotta">{metrics.sourcesDropped}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-moss/10 border border-moss/20 text-[11px] text-ink-soft leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-moss shrink-0" />
            <span>
              All live searches execute server-side through authorized SerpApi endpoints. No client credentials or private health data ever touch public search crawlers.
            </span>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-nil text-paper font-semibold hover:bg-nil/90 transition-colors cursor-pointer text-xs"
            >
              Close Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
