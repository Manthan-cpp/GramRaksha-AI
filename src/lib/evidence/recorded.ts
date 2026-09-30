import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

import { getRecordedDirectory } from "@/lib/evidence/config";
import { normalizeQueryForKey } from "@/lib/evidence/planner";
import type { EvidenceProvider, ProviderSearchResult } from "@/lib/evidence/provider";
import type { EvidenceRunRequest, PlannedQuery } from "@/lib/schemas";

export interface RecordedQuery {
  engine: PlannedQuery["engine"];
  query: string;
  parameters: Record<string, string>;
  raw: unknown;
}

export interface RecordedRun {
  version: 1;
  label: string;
  recordedAt: string;
  module: EvidenceRunRequest["module"];
  match: Record<string, string>;
  queries: RecordedQuery[];
}

export class RecordedDataUnavailableError extends Error {
  readonly code = "recorded_unavailable" as const;

  constructor(message = "No recorded evidence is available for this request.") {
    super(message);
    this.name = "RecordedDataUnavailableError";
  }
}

function matchingValue(input: EvidenceRunRequest, key: string): string | undefined {
  if (key === "module") return input.module;
  if (input.module === "krishi") {
    if (key === "crop" || key === "state" || key === "district" || key === "stage") return input[key].toLocaleLowerCase();
  } else if (input.module === "medi") {
    if (key === "subModule") return input.subModule?.toLocaleLowerCase() || "bill_audit";
    if (key === "hospital" || key === "city" || key === "procedure") return input[key].toLocaleLowerCase();
  } else if (input.module === "suraksha") {
    if (key === "sourceType") return input.sourceType?.toLocaleLowerCase() || "whatsapp";
    if (key === "scheme") return "pmkisan";
  } else if (input.module === "fasal") {
    if (key === "state" || key === "district" || key === "calamityType") return input[key].toLocaleLowerCase();
  } else if (input.module === "pocket_card") {
    if (key === "state" || key === "district" || key === "block") return input[key].toLocaleLowerCase();
  }
  return undefined;
}

function runMatches(run: RecordedRun, input?: EvidenceRunRequest): boolean {
  if (!input || run.module !== input.module) return false;
  return Object.entries(run.match).every(([key, expected]) => matchingValue(input, key) === expected.toLocaleLowerCase());
}

export class RecordedProvider implements EvidenceProvider {
  readonly mode = "recorded" as const;
  private readonly directory: string;
  private runsPromise: Promise<RecordedRun[]> | null = null;
  private readonly input?: EvidenceRunRequest;

  constructor(input?: EvidenceRunRequest, directory = getRecordedDirectory()) {
    this.input = input;
    this.directory = directory;
  }

  private async loadRuns(): Promise<RecordedRun[]> {
    if (!this.runsPromise) {
      this.runsPromise = (async () => {
        let files: string[];
        try {
          files = (await readdir(this.directory)).filter((file) => file.endsWith(".json"));
        } catch {
          return [];
        }

        const runs: RecordedRun[] = [];
        for (const file of files) {
          try {
            const parsed = JSON.parse(await readFile(path.join(this.directory, file), "utf8")) as RecordedRun;
            if (parsed.version === 1 && Array.isArray(parsed.queries)) runs.push(parsed);
          } catch {
            // One malformed recording should not prevent other recordings from working.
          }
        }
        return runs;
      })();
    }
    return this.runsPromise;
  }

  async search(query: PlannedQuery): Promise<ProviderSearchResult> {
    const runs = await this.loadRuns();
    const matchingRun = runs.find((run) => runMatches(run, this.input));
    const recordedQuery = matchingRun?.queries.find((candidate) => {
      return candidate.engine === query.engine && normalizeQueryForKey(candidate.query) === normalizeQueryForKey(query.query);
    });

    if (!recordedQuery) {
      throw new RecordedDataUnavailableError(
        matchingRun
          ? "This recorded run does not include the planned query."
          : "No recorded run matches this request."
      );
    }

    return {
      raw: recordedQuery.raw,
      retrievedAt: matchingRun?.recordedAt || new Date().toISOString(),
      cacheHit: false,
      source: "recorded"
    };
  }
}

export class FixtureProvider implements EvidenceProvider {
  readonly mode = "fixture" as const;
  private readonly responses: Map<string, unknown>;

  constructor(responses: Record<string, unknown>) {
    this.responses = new Map(Object.entries(responses));
  }

  async search(query: PlannedQuery): Promise<ProviderSearchResult> {
    const raw = this.responses.get(query.id);
    if (!raw) throw new RecordedDataUnavailableError(`Fixture missing for query ${query.id}.`);
    return {
      raw,
      retrievedAt: new Date().toISOString(),
      cacheHit: true,
      source: "fixture"
    };
  }
}
