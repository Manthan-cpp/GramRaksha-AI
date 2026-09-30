import { FasalCountdownStatus } from "@/lib/schemas";

const WINDOW_HOURS = 72;
const WINDOW_MS = WINDOW_HOURS * 60 * 60 * 1000;

export function calculateFasalCountdown(
  incidentTimeIso: string,
  nowMs: number = Date.now(),
  locale: "en" | "hi" | "bn" = "en"
): FasalCountdownStatus {
  const incidentDate = new Date(incidentTimeIso);
  const incidentMs = isNaN(incidentDate.getTime()) ? nowMs : incidentDate.getTime();
  const deadlineMs = incidentMs + WINDOW_MS;
  const deadlineIso = new Date(deadlineMs).toISOString();

  const totalMsRemaining = deadlineMs - nowMs;
  const isExpired = totalMsRemaining <= 0;

  if (isExpired) {
    let formattedTimeLeft = "72-Hour intimation deadline expired";
    if (locale === "hi") {
      formattedTimeLeft = "72-घंटे की सूचना समय सीमा समाप्त हो चुकी है";
    } else if (locale === "bn") {
      formattedTimeLeft = "৭২ ঘণ্টার দাবির সময়সীমা সমাপ্ত হয়েছে";
    }

    return {
      hoursLeft: 0,
      minutesLeft: 0,
      secondsLeft: 0,
      totalMsRemaining: 0,
      percentElapsed: 100,
      urgency: "expired",
      formattedTimeLeft,
      deadlineIso,
      isExpired: true
    };
  }

  const hoursLeft = Math.floor(totalMsRemaining / (1000 * 60 * 60));
  const minutesLeft = Math.floor((totalMsRemaining % (1000 * 60 * 60)) / (1000 * 60));
  const secondsLeft = Math.floor((totalMsRemaining % (1000 * 60)) / 1000);

  const percentElapsed = Math.min(
    100,
    Math.max(0, Math.round(((WINDOW_MS - totalMsRemaining) / WINDOW_MS) * 100))
  );

  let urgency: "safe" | "warning" | "critical" = "safe";
  if (hoursLeft < 24) {
    urgency = "critical";
  } else if (hoursLeft < 48) {
    urgency = "warning";
  }

  let formattedTimeLeft = `${hoursLeft}h ${minutesLeft}m remaining`;
  if (locale === "hi") {
    formattedTimeLeft = `${hoursLeft} घंटे ${minutesLeft} मिनट शेष`;
  } else if (locale === "bn") {
    formattedTimeLeft = `${hoursLeft} ঘণ্টা ${minutesLeft} মিনিট বাকি`;
  }

  return {
    hoursLeft,
    minutesLeft,
    secondsLeft,
    totalMsRemaining,
    percentElapsed,
    urgency,
    formattedTimeLeft,
    deadlineIso,
    isExpired: false
  };
}

export function formatCalamityName(
  type: string,
  locale: "en" | "hi" | "bn" = "en"
): string {
  const dictionary: Record<string, { en: string; hi: string; bn: string }> = {
    hailstorm: {
      en: "Hailstorm Damage",
      hi: "ओलावृष्टि से क्षति",
      bn: "শিলাবৃষ্টির ক্ষয়ক্ষতি"
    },
    flood_inundation: {
      en: "Inundation / Waterlogging",
      hi: "जलभराव / बाढ़",
      bn: "জলমগ্নতা বা প্লাবন"
    },
    lightning_cloudburst: {
      en: "Lightning / Cloudburst",
      hi: "आकाशीय बिजली / बादल फटना",
      bn: "বজ্রপাত বা মেঘভাঙা বৃষ্টি"
    },
    unseasonal_rain: {
      en: "Unseasonal Rain / Post-Harvest Cyclone",
      hi: "बेमौसम बारिश / चक्रवात",
      bn: "অসময়ের বৃষ্টি বা ঘূর্ণিঝড়"
    },
    landslide: {
      en: "Landslide",
      hi: "भूस्खलन",
      bn: "ভূমিধস"
    },
    other: {
      en: "Localized Calamity",
      hi: "स्थानीयकृत प्राकृतिक आपदा",
      bn: "স্থানীয় প্রাকৃতিক বিপর্যয়"
    }
  };

  const entry = dictionary[type] || dictionary.other;
  return entry[locale] || entry.en;
}
