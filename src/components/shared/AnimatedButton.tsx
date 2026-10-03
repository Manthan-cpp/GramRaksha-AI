import Link from "next/link";
import React from "react";
import { ArrowRight } from "lucide-react";

export function AnimatedButton({ 
  href, 
  text, 
  locale = "en", 
  onClick, 
  className = "",
  icon: Icon = ArrowRight,
  type = "button"
}: { 
  href?: string, 
  text: string, 
  locale?: string,
  onClick?: (e: React.MouseEvent<any>) => void,
  className?: string,
  icon?: any,
  type?: "button" | "submit" | "reset"
}) {
  let letters: string[] = [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
    letters = Array.from(segmenter.segment(text)).map(s => s.segment);
  } else {
    letters = text.split("");
  }

  const content = (
    <>
      <span className="flex">
        {letters.map((char, index) => (
          <span key={index} className="relative overflow-hidden h-[1.5em] block">
            <span
              className="flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2 motion-reduce:transition-none"
              style={{ transitionDelay: `${index * 15}ms` }}
            >
              <span className="h-[1.5em] flex items-center">{char === " " ? "\u00A0" : char}</span>
              <span className="h-[1.5em] flex items-center" aria-hidden="true">{char === " " ? "\u00A0" : char}</span>
            </span>
          </span>
        ))}
      </span>
      {Icon && <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
    </>
  );

  const baseClass = `relative inline-flex items-center justify-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm sm:text-base border-2 border-black cursor-pointer group shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${className}`;

  if (href) {
    return (
      <Link href={href} onClick={onClick} className={baseClass}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={baseClass}>
      {content}
    </button>
  );
}
