"use client";

import { useState } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "bn", name: "Bengali (বাংলা)" }
] as const;

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();
  const currentLang = LANGUAGES.some((language) => language.code === params.locale)
    ? params.locale as (typeof LANGUAGES)[number]["code"]
    : "en";

  const changeLanguage = (langCode: (typeof LANGUAGES)[number]["code"]) => {
    const nextPath = pathname.replace(/^\/(en|hi|bn)(?=\/|$)/, `/${langCode}`);
    setIsOpen(false);
    router.push(nextPath);
  };

  const currentLangName = LANGUAGES.find((language) => language.code === currentLang)?.name || "English";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 bg-paper-2 border-[1.5px] border-ink px-4 py-2 rounded-xl text-ink shadow-print hover:bg-paper transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLangName}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-paper-2 border-[1.5px] border-ink rounded-xl shadow-print overflow-hidden z-50" role="listbox">
          {LANGUAGES.map((language) => (
            <button
              key={language.code}
              onClick={() => changeLanguage(language.code)}
              className={`w-full text-left px-4 py-2 text-sm hover:bg-moss/10 transition-colors ${currentLang === language.code ? "font-bold text-moss" : "text-ink"}`}
              role="option"
              aria-selected={currentLang === language.code}
            >
              {language.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
