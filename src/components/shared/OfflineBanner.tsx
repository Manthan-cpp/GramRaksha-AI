"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "next-intl";
import { WifiOff } from "lucide-react";

function subscribe(callback: () => void) {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return typeof navigator !== "undefined" ? !navigator.onLine : false;
}

function getServerSnapshot() {
  return false;
}

export function OfflineBanner() {
  const locale = useLocale();
  const isOffline = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (!isOffline) return null;

  const messages: Record<string, string> = {
    hi: "आप ऑफ़लाइन हैं। आपके सहेजे गए कृषि और अस्पताल बिल रिकॉर्ड स्थानीय मेमोरी से उपलब्ध हैं।",
    bn: "আপনি অফলাইনে আছেন। আপনার সংরক্ষিত কৃষি ও হাসপাতালের বিলের রেকর্ড ডিভাইস মেমোরি থেকে প্রদর্শিত হচ্ছে।",
    en: "You are currently offline. Your saved crop briefs and hospital bill cases are available from device memory."
  };

  return (
    <div
      role="status"
      className="bg-turmeric-deep text-paper text-xs sm:text-sm py-2 px-4 flex items-center justify-center gap-2 font-medium z-50 sticky top-0 shadow-md"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>{messages[locale] || messages.en}</span>
    </div>
  );
}
