import { z } from "zod";

export const PocketCardPlaceCategorySchema = z.enum([
  "phc",
  "police",
  "kvk",
  "dao",
  "dlsa",
  "panchayat",
  "other"
]);
export type PocketCardPlaceCategory = z.infer<typeof PocketCardPlaceCategorySchema>;

export const PocketCardPlaceSchema = z.object({
  id: z.string(),
  category: PocketCardPlaceCategorySchema,
  name: z.string(),
  address: stringFallback("Address on file"),
  phone: z.string(),
  distance: z.string().optional(),
  mapsUrl: z.string().optional(),
  verified: z.boolean().default(true),
  badge: z.string().optional()
});
export type PocketCardPlace = z.infer<typeof PocketCardPlaceSchema>;

function stringFallback(fallback: string) {
  return z.string().optional().transform((v) => v || fallback);
}

export const PocketCardLifelineCategorySchema = z.enum([
  "emergency",
  "health",
  "agriculture",
  "cyber",
  "legal",
  "consumer"
]);
export type PocketCardLifelineCategory = z.infer<typeof PocketCardLifelineCategorySchema>;

export const PocketCardLifelineSchema = z.object({
  service: z.string(),
  number: z.string(),
  description: z.string(),
  category: PocketCardLifelineCategorySchema,
  icon: z.string()
});
export type PocketCardLifeline = z.infer<typeof PocketCardLifelineSchema>;

export const VillagePocketCardRequestSchema = z.object({
  state: z.string().trim().min(1, "State is required"),
  district: z.string().trim().min(1, "District is required"),
  block: z.string().trim().min(1, "Block / Tehsil is required"),
  village: z.string().trim().min(1, "Village / Panchayat is required"),
  pinCode: z.string().trim().optional(),
  panchayatPradhanName: z.string().trim().optional(),
  pradhanPhone: z.string().trim().optional()
});
export type VillagePocketCardRequest = z.infer<typeof VillagePocketCardRequestSchema>;

export const VillagePocketCardSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  locale: z.enum(["en", "hi", "bn"]).default("en"),
  location: z.object({
    state: z.string(),
    district: z.string(),
    block: z.string(),
    village: z.string(),
    pinCode: z.string().optional()
  }),
  panchayatContact: z.object({
    name: z.string(),
    phone: z.string()
  }).optional(),
  lifelines: z.array(PocketCardLifelineSchema),
  places: z.array(PocketCardPlaceSchema),
  vCardPayload: z.string(),
  mode: z.enum(["live", "recorded"]).default("live"),
  evidenceReferences: z.array(z.object({
    title: z.string(),
    url: z.string(),
    publisher: z.string().optional(),
    snippet: z.string()
  })).default([])
});
export type VillagePocketCard = z.infer<typeof VillagePocketCardSchema>;
