import Dexie, { type Table } from "dexie";
import { z } from "zod";
import { SurakshaDecisionSchema, EvidenceSchema } from "@/lib/schemas";

export const SavedSurakshaCaseSchema = z.object({
  id: z.string().uuid(),
  module: z.literal("suraksha"),
  version: z.literal(1),
  createdAt: z.string().datetime(),
  locale: z.enum(["en", "hi", "bn"]),
  content: z.string(),
  sourceType: z.enum(["whatsapp", "sms", "link", "apk", "other"]).default("whatsapp"),
  appName: z.string().optional(),
  decision: SurakshaDecisionSchema,
  evidence: z.array(EvidenceSchema).default([]),
  mode: z.enum(["live", "recorded"]),
  warnings: z.array(z.string()).default([])
}).strict();

export type SavedSurakshaCase = z.infer<typeof SavedSurakshaCaseSchema>;

let db: (Dexie & { cases: Table<SavedSurakshaCase, string> }) | undefined;

function database() {
  if (!db) {
    db = new Dexie("gramraksha-suraksha-cases") as Dexie & { cases: Table<SavedSurakshaCase, string> };
    db.version(1).stores({ cases: "id,createdAt" });
  }
  return db;
}

export async function saveSurakshaCase(value: unknown): Promise<SavedSurakshaCase> {
  const record = SavedSurakshaCaseSchema.parse(value);
  await database().cases.put(record);
  return record;
}

export async function listSurakshaCases(): Promise<SavedSurakshaCase[]> {
  return (await database().cases.orderBy("createdAt").reverse().toArray()).map((row) =>
    SavedSurakshaCaseSchema.parse(row)
  );
}

export async function deleteSurakshaCase(id: string): Promise<void> {
  await database().cases.delete(id);
}

export async function deleteAllSurakshaCases(): Promise<void> {
  await database().cases.clear();
}
