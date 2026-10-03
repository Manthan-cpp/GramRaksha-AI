import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { EvidenceEngine } from "@/lib/schemas";

interface UsageRecord {
  version: 1;
  month: string;
  total: number;
  byEngine: Partial<Record<EvidenceEngine, number>>;
  byDay: Record<string, number>;
}

export interface UsageSnapshot {
  month: string;
  total: number;
  cap: number;
  remaining: number;
  byEngine: Partial<Record<EvidenceEngine, number>>;
  byDay: Record<string, number>;
}

export class BudgetExceededError extends Error {
  readonly code = "budget" as const;

  constructor(message = "The monthly SerpApi search budget has been reached.") {
    super(message);
    this.name = "BudgetExceededError";
  }
}

function period(): { month: string; day: string } {
  const now = new Date();
  return {
    month: now.toISOString().slice(0, 7),
    day: now.toISOString().slice(0, 10)
  };
}

function emptyRecord(month: string): UsageRecord {
  return { version: 1, month, total: 0, byEngine: {}, byDay: {} };
}

export function createUsageMeter(directory: string, cap: number) {
  const file = path.join(directory, "usage.json");
  let memory: UsageRecord | null = null;
  let queue = Promise.resolve();
  let inFlight = 0;

  const withLock = async <T>(operation: () => Promise<T>): Promise<T> => {
    const previous = queue;
    let release!: () => void;
    queue = new Promise<void>((resolve) => {
      release = resolve;
    });
    await previous;
    try {
      return await operation();
    } finally {
      release();
    }
  };

  const load = async (): Promise<UsageRecord> => {
    const { month } = period();
    if (memory?.month === month) return memory;

    try {
      const contents = await readFile(file, "utf8");
      const parsed = JSON.parse(contents) as UsageRecord;
      if (parsed.version === 1 && parsed.month === month) {
        memory = parsed;
        return parsed;
      }
    } catch {
    }

    memory = emptyRecord(month);
    return memory;
  };

  const persist = async (record: UsageRecord): Promise<void> => {
    await mkdir(directory, { recursive: true });
    const temporary = `${file}.${process.pid}.${Date.now()}.tmp`;
    await writeFile(temporary, JSON.stringify(record), { encoding: "utf8", flag: "wx" });
    await rename(temporary, file);
  };

  return {
    async reserve(): Promise<void> {
      await withLock(async () => {
        const record = await load();
        if (record.total + inFlight >= cap) throw new BudgetExceededError();
        inFlight += 1;
      });
    },
    async complete(engine: EvidenceEngine, successful: boolean): Promise<void> {
      await withLock(async () => {
        inFlight = Math.max(0, inFlight - 1);
        if (!successful) return;
        const record = await load();
        const { day } = period();
        record.total += 1;
        record.byEngine[engine] = (record.byEngine[engine] ?? 0) + 1;
        record.byDay[day] = (record.byDay[day] ?? 0) + 1;
        await persist(record);
      });
    },
    async recordSuccessful(engine: EvidenceEngine): Promise<void> {
      await withLock(async () => {
        const record = await load();
        const { day } = period();
        record.total += 1;
        record.byEngine[engine] = (record.byEngine[engine] ?? 0) + 1;
        record.byDay[day] = (record.byDay[day] ?? 0) + 1;
        await persist(record);
      });
    },
    async assertWithinBudget(): Promise<void> {
      await withLock(async () => {
        const record = await load();
        if (record.total >= cap) throw new BudgetExceededError();
      });
    },
    async snapshot(): Promise<UsageSnapshot> {
      return withLock(async () => {
        const record = await load();
        return {
          month: record.month,
          total: record.total,
          cap,
          remaining: Math.max(0, cap - record.total),
          byEngine: { ...record.byEngine },
          byDay: { ...record.byDay }
        };
      });
    }
  };
}
