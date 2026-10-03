import type { Evidence } from "@/lib/schemas";
import type {
  VillagePocketCard,
  VillagePocketCardRequest,
  PocketCardPlace,
  PocketCardPlaceCategory
} from "./types";
import { NATIONAL_LIFELINES, getDistrictFallbackPlaces } from "./directory-fallback";
import { generatePocketCardVCard } from "./vcard";

export function buildVillagePocketCard(
  request: VillagePocketCardRequest,
  evidence: Evidence[] = [],
  mode: "live" | "recorded" = "live",
  locale: "en" | "hi" | "bn" = "en"
): VillagePocketCard {
  const fallbackPlaces = getDistrictFallbackPlaces(request.district, request.state, request.block);
  const detectedPlaces: PocketCardPlace[] = [];

  const mapsEvidence = evidence.filter((e) => e.engine === "google_maps" && e.maps);

  for (const ev of mapsEvidence) {
    if (!ev.maps) continue;
    const title = ev.maps.name || ev.title;
    const address = ev.maps.address || ev.snippet;
    const phone = ev.maps.phone || "";
    const lower = `${title} ${address}`.toLowerCase();

    let category: PocketCardPlaceCategory = "other";
    if (lower.includes("hospital") || lower.includes("phc") || lower.includes("chc") || lower.includes("health centre") || lower.includes("chikitsalaya")) {
      category = "phc";
    } else if (lower.includes("police") || lower.includes("thana") || lower.includes("kotwali") || lower.includes("chowki")) {
      category = "police";
    } else if (lower.includes("krishi vigyan") || lower.includes("kvk") || lower.includes("icar")) {
      category = "kvk";
    } else if (lower.includes("agriculture") || lower.includes("krishi") || lower.includes("dao")) {
      category = "dao";
    } else if (lower.includes("legal") || lower.includes("dlsa") || lower.includes("court") || lower.includes("nyay")) {
      category = "dlsa";
    }

    if (category !== "other" && !detectedPlaces.some((p) => p.category === category)) {
      detectedPlaces.push({
        id: `map-${category}-${detectedPlaces.length}`,
        category,
        name: title,
        address: address || `${request.block}, ${request.district}`,
        phone: phone || (category === "phc" ? "108" : category === "police" ? "112" : "1800-180-1551"),
        distance: ev.maps.hoursText || undefined,
        mapsUrl: ev.maps.mapsUrl,
        verified: true,
        badge: "Verified on Google Maps"
      });
    }
  }

  const mergedPlaces: PocketCardPlace[] = [];

  const categoriesToEnsure: PocketCardPlaceCategory[] = ["phc", "police", "kvk", "dao", "dlsa"];

  for (const cat of categoriesToEnsure) {
    const fromMap = detectedPlaces.find((p) => p.category === cat);
    if (fromMap && fromMap.phone && fromMap.phone.length > 2) {
      mergedPlaces.push(fromMap);
    } else {
      const fromFallback = fallbackPlaces.find((p) => p.category === cat);
      if (fromFallback) {
        mergedPlaces.push(fromFallback);
      }
    }
  }

  if (request.panchayatPradhanName && request.pradhanPhone) {
    mergedPlaces.unshift({
      id: "panchayat-pradhan",
      category: "panchayat",
      name: `${request.village} Gram Panchayat (Pradhan / Mukhiya)`,
      address: `Panchayat Bhawan, ${request.village}, ${request.block}, ${request.district}`,
      phone: request.pradhanPhone,
      verified: true,
      badge: "Local Elected Representative"
    });
  }

  const evidenceReferences = evidence.slice(0, 5).map((e) => ({
    title: e.title,
    url: e.url,
    publisher: e.publisher,
    snippet: e.snippet
  }));

  const cardPayload: VillagePocketCard = {
    id: `card-${request.district.toLowerCase()}-${request.village.toLowerCase()}-${Date.now()}`.replace(/[^a-z0-9-]/g, "-"),
    createdAt: new Date().toISOString(),
    locale,
    location: {
      state: request.state,
      district: request.district,
      block: request.block,
      village: request.village,
      pinCode: request.pinCode
    },
    panchayatContact: request.panchayatPradhanName && request.pradhanPhone
      ? { name: request.panchayatPradhanName, phone: request.pradhanPhone }
      : undefined,
    lifelines: NATIONAL_LIFELINES,
    places: mergedPlaces,
    vCardPayload: "",
    mode,
    evidenceReferences
  };

  cardPayload.vCardPayload = generatePocketCardVCard(cardPayload);

  return cardPayload;
}
