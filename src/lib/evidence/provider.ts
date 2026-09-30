import { createSearchCache, type SearchCache } from "@/lib/evidence/cache";
import { getEvidenceConfig } from "@/lib/evidence/config";
import { createUsageMeter, BudgetExceededError } from "@/lib/evidence/usage";
import type { EvidenceEngine, PlannedQuery } from "@/lib/schemas";

export interface ProviderSearchResult {
  raw: unknown;
  retrievedAt: string;
  cacheHit: boolean;
  source: "live" | "recorded" | "fixture";
}

export interface EvidenceProvider {
  readonly mode: "live" | "recorded" | "fixture";
  search(query: PlannedQuery): Promise<ProviderSearchResult>;
}

export class ProviderConfigurationError extends Error {
  readonly code = "configuration" as const;

  constructor(message: string) {
    super(message);
    this.name = "ProviderConfigurationError";
  }
}

export class ProviderUpstreamError extends Error {
  readonly code = "upstream" as const;

  constructor(message: string) {
    super(message);
    this.name = "ProviderUpstreamError";
  }
}

export function serpApiEngineName(engine: EvidenceEngine): string {
  switch (engine) {
    case "google_news":
      return "google_news";
    case "google_maps":
      return "google_maps";
    case "google_trends":
      return "google_trends";
    case "youtube":
      return "youtube";
    case "google_play":
      return "google_play";
    case "google":
      return "google";
    default:
      return engine;
  }
}

export interface SerpApiProviderOptions {
  apiKey?: string;
  cache?: SearchCache;
  usage?: ReturnType<typeof createUsageMeter>;
  timeoutMs?: number;
  endpoint?: string;
}

export class SerpApiProvider implements EvidenceProvider {
  readonly mode = "live" as const;
  private readonly apiKey: string | undefined;
  private readonly cache: SearchCache;
  private readonly usage: ReturnType<typeof createUsageMeter>;
  private readonly timeoutMs: number;
  private readonly endpoint: string;

  constructor(options: SerpApiProviderOptions = {}) {
    const config = getEvidenceConfig();
    this.apiKey = options.apiKey ?? config.apiKey;
    this.cache = options.cache ?? createSearchCache(config.cacheDirectory);
    this.usage = options.usage ?? createUsageMeter(config.cacheDirectory, config.monthlyCap);
    this.timeoutMs = options.timeoutMs ?? config.requestTimeoutMs;
    this.endpoint = options.endpoint ?? "https://serpapi.com/search.json";
  }

  async search(query: PlannedQuery): Promise<ProviderSearchResult> {
    if (!this.apiKey) {
      throw new ProviderConfigurationError("SerpApi is not configured on the server.");
    }

    const cached = await this.cache.get(query);
    if (cached) {
      return {
        raw: cached.raw,
        retrievedAt: cached.cachedAt,
        cacheHit: true,
        source: "live"
      };
    }

    let reserved = false;
    try {
      await this.usage.reserve();
      reserved = true;
    } catch (error) {
      if (error instanceof BudgetExceededError) throw error;
      throw new ProviderUpstreamError("The SerpApi usage meter could not be read.");
    }

    const params = new URLSearchParams({
      ...query.parameters,
      engine: serpApiEngineName(query.engine),
      ...(query.engine === "youtube" ? { search_query: query.query } : { q: query.query }),
      api_key: this.apiKey,
      output: "json"
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.endpoint}?${params.toString()}`, {
        method: "GET",
        headers: { accept: "application/json" },
        signal: controller.signal,
        cache: "no-store"
      });
    } catch (error) {
      if (reserved) await this.usage.complete(query.engine, false);
      if (error instanceof Error && error.name === "AbortError") {
        throw new ProviderUpstreamError("SerpApi took too long to respond.");
      }
      throw new ProviderUpstreamError("SerpApi could not be reached.");
    } finally {
      clearTimeout(timeout);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      if (reserved) await this.usage.complete(query.engine, false);
      throw new ProviderUpstreamError("SerpApi returned an unreadable response.");
    }

    if (!response.ok || (payload && typeof payload === "object" && "error" in payload)) {
      if (reserved) await this.usage.complete(query.engine, false);
      if (response.status === 429) {
        throw new ProviderUpstreamError("SerpApi rate or account search limits were reached.");
      }
      if (response.status === 401 || response.status === 403) {
        throw new ProviderConfigurationError("SerpApi rejected the server API key.");
      }
      throw new ProviderUpstreamError("SerpApi returned an unsuccessful response.");
    }

    const retrievedAt = new Date().toISOString();
    try {
      await this.cache.set(query, payload);
    } finally {
      if (reserved) await this.usage.complete(query.engine, true);
    }

    return { raw: payload, retrievedAt, cacheHit: false, source: "live" };
  }
}
