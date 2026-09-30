import Dexie, { type Table } from "dexie";
import { z } from "zod";
import {
  FasalDecisionSchema,
  FasalPhotoEvidenceSchema,
  FasalCalamityTypeSchema,
  EvidenceSchema
} from "@/lib/schemas";

export const FasalIncidentInputSchema = z.object({
  calamityType: FasalCalamityTypeSchema,
  incidentTime: z.string(),
  state: z.string(),
  district: z.string(),
  village: z.string(),
  khasraNo: z.string().optional(),
  applicationNo: z.string().optional(),
  bankAccountRef: z.string().optional(),
  crop: z.string(),
  areaAcres: z.number().optional(),
  lossPercentage: z.number().min(1).max(100),
  farmerName: z.string(),
  farmerPhone: z.string().optional()
});

export const SavedFasalCaseSchema = z.object({
  id: z.string().uuid(),
  module: z.literal("fasal"),
  version: z.literal(1),
  createdAt: z.string().datetime(),
  locale: z.enum(["en", "hi", "bn"]),
  incident: FasalIncidentInputSchema,
  photos: z.array(FasalPhotoEvidenceSchema).default([]),
  decision: FasalDecisionSchema,
  evidence: z.array(EvidenceSchema).default([]),
  mode: z.enum(["live", "recorded"]),
  warnings: z.array(z.string()).default([])
}).strict();

export type SavedFasalCase = z.infer<typeof SavedFasalCaseSchema>;

let db: (Dexie & { cases: Table<SavedFasalCase, string> }) | undefined;

function database() {
  if (!db) {
    db = new Dexie("gramraksha-fasal-cases") as Dexie & { cases: Table<SavedFasalCase, string> };
    db.version(1).stores({ cases: "id,createdAt" });
  }
  return db;
}

export async function saveFasalCase(value: unknown): Promise<SavedFasalCase> {
  const record = SavedFasalCaseSchema.parse(value);
  await database().cases.put(record);
  return record;
}

export async function listFasalCases(): Promise<SavedFasalCase[]> {
  return (await database().cases.orderBy("createdAt").reverse().toArray()).map((row) =>
    SavedFasalCaseSchema.parse(row)
  );
}

export async function getFasalCase(id: string): Promise<SavedFasalCase | undefined> {
  const row = await database().cases.get(id);
  return row ? SavedFasalCaseSchema.parse(row) : undefined;
}

export async function deleteFasalCase(id: string): Promise<void> {
  await database().cases.delete(id);
}

export async function deleteAllFasalCases(): Promise<void> {
  await database().cases.clear();
}
