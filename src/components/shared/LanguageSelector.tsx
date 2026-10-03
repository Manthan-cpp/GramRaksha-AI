"use client";

import { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown } from "lucide-react";
import { usePathname, useRouter, useParams } from "next/navigation";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "bn", name: "Bengali (বাংলা)" }
] as const;

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();
  const currentLang = LANGUAGES.some((language) => language.code === params.locale)
    ? params.locale as (typeof LANGUAGES)[number]["code"]
    : "en";

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const changeLanguage = (langCode: (typeof LANGUAGES)[number]["code"]) => {
    const nextPath = pathname.replace(/^\/(en|hi|bn)(?=\/|$)/, `/${langCode}`);
    setIsOpen(false);
    router.push(nextPath);
  };

  const currentLangName = LANGUAGES.find((language) => language.code === currentLang)?.name || "English";

  return (
    <div ref={containerRef} className="relative">
      <button
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center gap-2 bg-white/40 backdrop-blur-md border-[1.5px] border-ink px-4 py-2 rounded-xl text-ink shadow-[2px_2px_0_rgba(62,39,35,1)] hover:bg-ink/10 hover:shadow-[1px_1px_0_rgba(62,39,35,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{currentLangName}</span>
        <ChevronDown className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white/60 backdrop-blur-xl border-[1.5px] border-ink rounded-xl shadow-[4px_4px_0_rgba(62,39,35,1)] overflow-hidden z-50" role="listbox">
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
