"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Settings, X } from "lucide-react";
import type { EvidenceMode } from "@/lib/schemas";
import {
  getClientEvidenceMetrics,
  getClientEvidenceMode,
  subscribeToClientEvidenceState,
  setClientEvidenceMode,
  type ClientEvidenceMetrics
} from "@/lib/evidence/client-state";

import { Suspense } from "react";

function JudgePanelInner() {
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<EvidenceMode>(() => getClientEvidenceMode());
  const [metrics, setMetrics] = useState<ClientEvidenceMetrics>(() => getClientEvidenceMetrics());
  const show = searchParams.get("demo") === "1" || process.env.NEXT_PUBLIC_DEMO === "1";

  useEffect(() => {
    return subscribeToClientEvidenceState(() => {
      setMode(getClientEvidenceMode());
      setMetrics(getClientEvidenceMetrics());
    });
  }, []);

  if (!show) return null;

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-ink text-paper rounded-full shadow-lg z-50 hover:scale-105 transition-transform flex items-center justify-center group"
      >
        <Settings className="w-6 h-6 group-hover:rotate-90 transition-transform duration-500" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-paper-2 border-[1.5px] border-ink rounded-[16px] shadow-print z-50 overflow-hidden font-mono text-sm">
      <div className="bg-ink text-paper p-3 flex justify-between items-center">
        <span className="font-bold flex items-center gap-2"><Settings className="w-4 h-4"/> Judge Panel</span>
        <button onClick={() => setIsOpen(false)} className="hover:text-paper/70">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4 space-y-4 text-ink">
        <div className="flex justify-between items-center pb-2 border-b-[1.5px] border-dashed border-ink-soft/30">
          <span className="text-ink-soft">Evidence Mode</span>
          <select
            value={mode}
            onChange={(event) => {
              const nextMode = event.target.value as EvidenceMode;
              setMode(nextMode);
              setClientEvidenceMode(nextMode);
            }}
            className="bg-paper border border-ink-soft/30 rounded px-2 py-1 outline-none text-xs"
          >
            <option>Live</option>
            <option>Recorded</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-ink-soft">Status:</span>
            <span className="text-moss font-medium">{mode === "live" ? "SerpApi Live" : "Recorded replay"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Searches Run:</span>
            <span>{metrics.queriesRun}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Sources Kept:</span>
            <span>{metrics.sourcesKept}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Sources Dropped:</span>
            <span>{metrics.sourcesDropped}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-soft">Cache Hits:</span>
            <span>{metrics.cacheHits}</span>
          </div>
        </div>
        
        <div className="pt-2 border-t-[1.5px] border-dashed border-ink-soft/30 text-xs text-ink-soft">
          Live searches stay server-side. Recorded mode is available for offline demonstrations.
        </div>
      </div>
    </div>
  );
}

export function JudgePanel() {
  return (
    <Suspense fallback={null}>
      <JudgePanelInner />
    </Suspense>
  );
}
