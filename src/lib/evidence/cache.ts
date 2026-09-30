import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { PlannedQuery } from "@/lib/schemas";
import { normalizeQueryForKey } from "@/lib/evidence/planner";

export interface CachedSearch {
  version: 1;
  cachedAt: string;
  query: PlannedQuery;
  raw: unknown;
}

export interface SearchCache {
  keyFor(query: PlannedQuery): string;
  get(query: PlannedQuery): Promise<CachedSearch | null>;
  set(query: PlannedQuery, raw: unknown): Promise<void>;
}

function currentCacheWeek(): string {
  const now = new Date();
  const firstDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const day = firstDay.getUTCDay() || 7;
  firstDay.setUTCDate(firstDay.getUTCDate() - day + 1);
  return firstDay.toISOString().slice(0, 10);
}

function canonicalParameters(parameters: Record<string, string>): string {
  return Object.entries(parameters)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
}

export function createSearchCache(directory: string): SearchCache {
  const memory = new Map<string, CachedSearch>();

  const keyFor = (query: PlannedQuery): string => {
    const material = [
      currentCacheWeek(),
      query.engine,
      normalizeQueryForKey(query.query),
      canonicalParameters(query.parameters)
    ].join("|");
    return createHash("sha256").update(material).digest("hex");
  };

  const fileFor = (key: string) => path.join(directory, `${key}.json`);

  return {
    keyFor,
    async get(query) {
      const key = keyFor(query);
      const inMemory = memory.get(key);
      if (inMemory) return inMemory;

      try {
        const contents = await readFile(fileFor(key), "utf8");
        const parsed = JSON.parse(contents) as CachedSearch;
        if (parsed.version !== 1 || !parsed.cachedAt || !parsed.query || !parsed.raw) return null;
        memory.set(key, parsed);
        return parsed;
      } catch (error) {
        const code = error && typeof error === "object" && "code" in error ? error.code : undefined;
        if (code === "ENOENT") return null;
        return null;
      }
    },
    async set(query, raw) {
      const key = keyFor(query);
      const record: CachedSearch = {
        version: 1,
        cachedAt: new Date().toISOString(),
        query,
        raw
      };
      memory.set(key, record);

      await mkdir(directory, { recursive: true });
      const target = fileFor(key);
      const temporary = `${target}.${process.pid}.${Date.now()}.tmp`;
      await writeFile(temporary, JSON.stringify(record), { encoding: "utf8", flag: "wx" });
      await rename(temporary, target);
    }
  };
}
