import Dexie, { type Table } from "dexie";
import { VillagePocketCardSchema, type VillagePocketCard } from "@/lib/pocket-card/types";

let db: (Dexie & { cards: Table<VillagePocketCard, string> }) | undefined;

function database() {
  if (!db) {
    db = new Dexie("gramraksha-pocket-cards") as Dexie & { cards: Table<VillagePocketCard, string> };
    db.version(1).stores({ cards: "id,createdAt" });
  }
  return db;
}

export async function savePocketCard(value: unknown): Promise<VillagePocketCard> {
  const record = VillagePocketCardSchema.parse(value);
  await database().cards.put(record);
  return record;
}

export async function listPocketCards(): Promise<VillagePocketCard[]> {
  const rows = await database().cards.orderBy("createdAt").reverse().toArray();
  return rows.map((row) => VillagePocketCardSchema.parse(row));
}

export async function getPocketCard(id: string): Promise<VillagePocketCard | undefined> {
  const row = await database().cards.get(id);
  return row ? VillagePocketCardSchema.parse(row) : undefined;
}

export async function deletePocketCard(id: string): Promise<void> {
  await database().cards.delete(id);
}

export async function deleteAllPocketCards(): Promise<void> {
  await database().cards.clear();
}
