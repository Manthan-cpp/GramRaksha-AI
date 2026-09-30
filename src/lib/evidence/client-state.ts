import type { EvidenceMode } from "@/lib/schemas";

const MODE_KEY = "gramraksha:evidence-mode";
const METRICS_KEY = "gramraksha:evidence-metrics";
const METRICS_EVENT = "gramraksha:evidence-metrics-updated";

export interface ClientEvidenceMetrics {
  queriesRun: number;
  liveSearches: number;
  cacheHits: number;
  sourcesKept: number;
  sourcesDropped: number;
}

const EMPTY_METRICS: ClientEvidenceMetrics = {
  queriesRun: 0,
  liveSearches: 0,
  cacheHits: 0,
  sourcesKept: 0,
  sourcesDropped: 0
};

export function getClientEvidenceMode(): EvidenceMode {
  if (typeof window === "undefined") return "live";
  return window.localStorage.getItem(MODE_KEY) === "recorded" ? "recorded" : "live";
}

export function setClientEvidenceMode(mode: EvidenceMode): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(MODE_KEY, mode);
  window.dispatchEvent(new CustomEvent(METRICS_EVENT));
}

export function getClientEvidenceMetrics(): ClientEvidenceMetrics {
  if (typeof window === "undefined") return EMPTY_METRICS;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(METRICS_KEY) || "null") as Partial<ClientEvidenceMetrics> | null;
    return { ...EMPTY_METRICS, ...parsed };
  } catch {
    return EMPTY_METRICS;
  }
}

export function addClientEvidenceMetrics(run: Partial<ClientEvidenceMetrics>): void {
  if (typeof window === "undefined") return;
  const current = getClientEvidenceMetrics();
  const next = {
    queriesRun: current.queriesRun + (run.queriesRun || 0),
    liveSearches: current.liveSearches + (run.liveSearches || 0),
    cacheHits: current.cacheHits + (run.cacheHits || 0),
    sourcesKept: current.sourcesKept + (run.sourcesKept || 0),
    sourcesDropped: current.sourcesDropped + (run.sourcesDropped || 0)
  };
  window.localStorage.setItem(METRICS_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent(METRICS_EVENT));
}

export function subscribeToClientEvidenceState(listener: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(METRICS_EVENT, listener);
  window.addEventListener("storage", listener);
  return () => {
    window.removeEventListener(METRICS_EVENT, listener);
    window.removeEventListener("storage", listener);
  };
}
