import path from "node:path";

import type { EvidenceMode } from "@/lib/schemas";

const DEFAULT_MONTHLY_CAP = 250;
const DEFAULT_QUERY_BUDGET = 7;

function positiveInteger(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function resolveCacheDirectory(value: string | undefined): string {
  const configured = value?.trim() || ".cache/serpapi";
  return path.isAbsolute(configured) ? configured : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}

export interface EvidenceConfig {
  apiKey: string | undefined;
  monthlyCap: number;
  queryBudgetPerCase: number;
  cacheDirectory: string;
  defaultMode: EvidenceMode;
  requestTimeoutMs: number;
}

export function getEvidenceConfig(): EvidenceConfig {
  const configuredMode = process.env.EVIDENCE_MODE === "recorded" ? "recorded" : "live";

  return {
    apiKey: process.env.SERPAPI_API_KEY?.trim() || undefined,
    monthlyCap: positiveInteger(process.env.SERPAPI_MONTHLY_CAP, DEFAULT_MONTHLY_CAP),
    queryBudgetPerCase: positiveInteger(process.env.QUERY_BUDGET_PER_CASE, DEFAULT_QUERY_BUDGET),
    cacheDirectory: resolveCacheDirectory(process.env.SERPAPI_CACHE_DIR),
    defaultMode: configuredMode,
    requestTimeoutMs: positiveInteger(process.env.SERPAPI_TIMEOUT_MS, 30_000)
  };
}

export function getRecordedDirectory(): string {
  const configured = process.env.RECORDED_EVIDENCE_DIR?.trim() || "fixtures/recorded";
  return path.isAbsolute(configured) ? configured : path.resolve(/* turbopackIgnore: true */ process.cwd(), configured);
}
