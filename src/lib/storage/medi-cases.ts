import Dexie, { type Table } from "dexie";
import { z } from "zod";
import { BillItemSchema, MediDecisionSchema, AyushmanCashlessDecisionSchema } from "@/lib/schemas";

export const SavedMediCaseSchema = z.object({
  id: z.string().uuid(),
  module: z.literal("medi"),
  subModule: z.enum(["bill_audit", "cashless_shield"]).default("bill_audit").optional(),
  version: z.literal(1),
  createdAt: z.string().datetime(),
  locale: z.enum(["en", "hi", "bn"]),
  hospital: z.string(),
  city: z.string(),
  state: z.string().optional(),
  procedure: z.string(),
  total: z.number().default(0),
  depositDemanded: z.number().optional(),
  patientName: z.string().optional(),
  pmjayId: z.string().optional(),
  items: z.array(BillItemSchema).default([]),
  decision: MediDecisionSchema.optional(),
  cashlessDecision: AyushmanCashlessDecisionSchema.optional(),
  mode: z.enum(["live", "recorded"]),
  warnings: z.array(z.string()).default([])
}).strict();

export type SavedMediCase = z.infer<typeof SavedMediCaseSchema>;

let db: (Dexie & { cases: Table<SavedMediCase, string> }) | undefined;

function database() {
  if (!db) {
    db = new Dexie("gramraksha-medi-cases") as Dexie & { cases: Table<SavedMediCase, string> };
    db.version(1).stores({ cases: "id,createdAt" });
  }
  return db;
}

export async function saveMediCase(value: unknown): Promise<SavedMediCase> {
  const record = SavedMediCaseSchema.parse(value);
  await database().cases.put(record);
  return record;
}

export async function listMediCases(): Promise<SavedMediCase[]> {
  return (await database().cases.orderBy("createdAt").reverse().toArray()).map((row) =>
    SavedMediCaseSchema.parse(row)
  );
}

export async function deleteMediCase(id: string): Promise<void> {
  await database().cases.delete(id);
}

export async function deleteAllMediCases(): Promise<void> {
  await database().cases.clear();
}
