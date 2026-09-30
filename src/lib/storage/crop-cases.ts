import Dexie, { type Table } from "dexie";
import { z } from "zod";
import { CropBriefSchema, CropEvidenceRequestSchema } from "@/lib/schemas";

// Separate typed store: no health payloads, concerns or uploaded images.
export const SavedCropCaseSchema = z.object({
  id: z.string().uuid(), module: z.literal("krishi"), version: z.literal(1),
  createdAt: z.string().datetime(), locale: z.enum(["en", "hi", "bn"]),
  profile: CropEvidenceRequestSchema.omit({ module: true, mode: true, locale: true, concern: true }).strict(),
  brief: CropBriefSchema, mode: z.enum(["live", "recorded"]), warnings: z.array(z.string())
}).strict();
export type SavedCropCase = z.infer<typeof SavedCropCaseSchema>;
let db: (Dexie & { cases: Table<SavedCropCase, string> }) | undefined;
function database() {
  if (!db) {
    db = new Dexie("gramraksha-crop-cases") as Dexie & { cases: Table<SavedCropCase, string> };
    db.version(1).stores({ cases: "id,createdAt" });
  }
  return db;
}
export async function saveCropCase(value: unknown) {
  const record = SavedCropCaseSchema.parse(value);
  await database().cases.put(record);
  return record;
}
export async function listCropCases() {
  return (await database().cases.orderBy("createdAt").reverse().toArray()).map(row => SavedCropCaseSchema.parse(row));
}
export async function deleteCropCase(id: string) { await database().cases.delete(id); }
export async function deleteAllCropCases() { await database().cases.clear(); }
