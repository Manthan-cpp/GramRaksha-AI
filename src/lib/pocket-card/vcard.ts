import type { VillagePocketCard } from "./types";

/**
 * Generates an official vCard 3.0 file content representing the Village Emergency Lifelines.
 * When opened on iOS or Android, it instantly offers to save the contact into the phone's address book.
 */
export function generatePocketCardVCard(card: VillagePocketCard): string {
  const villageName = card.location.village || "Village";
  const districtName = card.location.district || "District";
  const orgName = `GramRaksha AI - ${villageName} Emergency Card`;

  // Find local places
  const phc = card.places.find((p) => p.category === "phc");
  const police = card.places.find((p) => p.category === "police");
  const dao = card.places.find((p) => p.category === "dao");
  const dlsa = card.places.find((p) => p.category === "dlsa");

  const vcardLines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:🚨 ${villageName} Emergency (${districtName})`,
    `N:Emergency;${villageName};;;`,
    `ORG:${orgName}`,
    "TEL;TYPE=WORK,VOICE:112",
    "TEL;TYPE=CELL,VOICE:108",
    "TEL;TYPE=HOME,VOICE:14447",
    "TEL;TYPE=MAIN,VOICE:14555",
    "TEL;TYPE=OTHER,VOICE:1930"
  ];

  if (card.panchayatContact?.phone) {
    vcardLines.push(`TEL;TYPE=PREF,VOICE:${card.panchayatContact.phone.replace(/[^0-9+]/g, "")}`);
  }

  if (phc?.phone) {
    vcardLines.push(`TEL;TYPE=WORK,VOICE:${phc.phone.replace(/[^0-9+]/g, "")}`);
  }

  if (police?.phone) {
    vcardLines.push(`TEL;TYPE=WORK,VOICE:${police.phone.replace(/[^0-9+]/g, "")}`);
  }

  if (dao?.phone) {
    vcardLines.push(`TEL;TYPE=WORK,VOICE:${dao.phone.replace(/[^0-9+]/g, "")}`);
  }

  const noteLines = [
    `GramRaksha AI Verified Pocket Card for ${villageName}, ${districtName}, ${card.location.state}.`,
    "Lifelines: 112 (Emergency) | 108 (Ambulance) | 14447 (Crop Loss 72h) | 14555 (Ayushman Cashless) | 1930 (Cyber Fraud) | 1800-180-1551 (Kisan KCC).",
    phc ? `PHC/CHC: ${phc.name} (${phc.phone})` : "",
    police ? `Police: ${police.name} (${police.phone})` : "",
    dlsa ? `Legal Aid: ${dlsa.name} (${dlsa.phone})` : ""
  ].filter(Boolean).join(" \\n ");

  vcardLines.push(`NOTE:${noteLines}`);
  vcardLines.push("URL:https://gramraksha.gov.in");
  vcardLines.push("END:VCARD");

  return vcardLines.join("\r\n");
}

/**
 * Triggers a browser download of the .vcf file.
 */
export function downloadVCard(card: VillagePocketCard): void {
  if (typeof window === "undefined") return;

  const content = generatePocketCardVCard(card);
  const blob = new Blob([content], { type: "text/vcard;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const filename = `Emergency-Card-${card.location.village}-${card.location.district}.vcf`
    .replace(/\s+/g, "-")
    .toLowerCase();

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * Pre-formats an emergency WhatsApp summary message for sharing across village groups.
 */
export function generateWhatsAppEmergencyText(card: VillagePocketCard): string {
  const loc = `${card.location.village}, Block ${card.location.block}, ${card.location.district} (${card.location.state})`;
  const phc = card.places.find((p) => p.category === "phc");
  const police = card.places.find((p) => p.category === "police");
  const kvk = card.places.find((p) => p.category === "kvk");
  const dao = card.places.find((p) => p.category === "dao");

  return `*🚨 GRAM RAKSHA EMERGENCY POCKET CARD*\n` +
    `📍 *Village:* ${loc}\n\n` +
    `*⚡ 24x7 NATIONAL LIFELINES (Toll-Free):*\n` +
    `• Police / Emergency: *112*\n` +
    `• Ambulance Service: *108*\n` +
    `• Crop Insurance (PMFBY 72h): *14447*\n` +
    `• Ayushman Cashless Desk: *14555*\n` +
    `• Cyber Fraud Helpline: *1930*\n` +
    `• Kisan Call Centre: *1800-180-1551*\n` +
    `• Free Legal Aid (NALSA): *15100*\n\n` +
    `*🏥 LOCAL VERIFIED SUPPORT:*\n` +
    (phc ? `• PHC/Hospital: ${phc.name} (📞 ${phc.phone})\n` : "") +
    (police ? `• Police Thana: ${police.name} (📞 ${police.phone})\n` : "") +
    (dao ? `• Agriculture Office: ${dao.name} (📞 ${dao.phone})\n` : "") +
    (kvk ? `• KVK Center: ${kvk.name} (📞 ${kvk.phone})\n` : "") +
    (card.panchayatContact?.phone ? `• Pradhan / Mukhiya: ${card.panchayatContact.name} (📞 ${card.panchayatContact.phone})\n` : "") +
    `\n_Issued via GramRaksha AI — Save this in your phone contacts or print as a wallet card._`;
}

export const generateWhatsAppPocketSummary = generateWhatsAppEmergencyText;

