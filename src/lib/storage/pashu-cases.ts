import Dexie, { type Table } from "dexie";
import { z } from "zod";
import { PashuDecisionSchema, EvidenceSchema } from "@/lib/schemas";

export const SavedPashuCaseSchema = z.object({
  id: z.string().uuid(),
  module: z.literal("pashu"),
  version: z.literal(1),
  createdAt: z.string().datetime(),
  locale: z.enum(["en", "hi", "bn"]),
  animal: z.string(),
  concern: z.string(),
  state: z.string(),
  district: z.string(),
  decision: PashuDecisionSchema,
  evidence: z.array(EvidenceSchema).default([]),
  mode: z.enum(["live", "recorded"]),
  warnings: z.array(z.string()).default([])
}).strict();

export type SavedPashuCase = z.infer<typeof SavedPashuCaseSchema>;

let db: (Dexie & { cases: Table<SavedPashuCase, string> }) | undefined;

function database() {
  if (!db) {
    db = new Dexie("gramraksha-pashu-cases") as Dexie & { cases: Table<SavedPashuCase, string> };
    db.version(1).stores({ cases: "id,createdAt" });
  }
  return db;
}

export async function savePashuCase(value: unknown): Promise<SavedPashuCase> {
  const record = SavedPashuCaseSchema.parse(value);
  await database().cases.put(record);
  return record;
}

export async function listPashuCases(): Promise<SavedPashuCase[]> {
  return (await database().cases.orderBy("createdAt").reverse().toArray()).map((row) =>
    SavedPashuCaseSchema.parse(row)
  );
}

export async function deletePashuCase(id: string): Promise<void> {
  await database().cases.delete(id);
}

export async function deleteAllPashuCases(): Promise<void> {
  await database().cases.clear();
}
