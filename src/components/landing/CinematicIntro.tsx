"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useIntroStore } from "@/lib/store/intro-store";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";

const generateStars = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
  }));
};

export function CinematicIntro() {
  const { phase, setPhase, hasPlayed, setHasPlayed } = useIntroStore();
  const pathname = usePathname();
  const locale = useLocale();
  const isLandingPage = pathname === `/${locale}` || pathname === `/${locale}/`;
  const [mounted, setMounted] = useState(false);
  const stars = useMemo(() => generateStars(150), []);

  useEffect(() => {
    if (phase !== "done" && phase !== "idle") {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [phase]);

  useEffect(() => {
    setMounted(true);
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    
    if (!isLandingPage || hasPlayed || prefersReducedMotion) {
      setPhase("done");
      setHasPlayed(true);
      return;
    }

    if (phase === "idle") {
      setPhase("black");
    }
  }, [isLandingPage, hasPlayed, setPhase, setHasPlayed, phase]);

  useEffect(() => {
    if (phase === "black") {
      const t1 = setTimeout(() => setPhase("reveal-logo"), 600);
      return () => clearTimeout(t1);
    }
    if (phase === "reveal-logo") {
      const t2 = setTimeout(() => setPhase("expand-website"), 2500);
      return () => clearTimeout(t2);
    }
    if (phase === "expand-website") {
      const t3 = setTimeout(() => {
        setPhase("done");
        setHasPlayed(true);
      }, 1050);
      return () => clearTimeout(t3);
    }
  }, [phase, setPhase, setHasPlayed]);

  if (!mounted || phase === "done" || phase === "idle") return null;

  const isExpanding = phase === "expand-website";

  return (
    <div className="fixed inset-0 z-40 pointer-events-auto flex items-center justify-center overflow-hidden bg-transparent">
      <motion.svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <mask id="intro-mask">
            <rect width="100%" height="100%" fill="white" />
            <motion.rect
              fill="black"
              x="-10%" y="-10%" width="120%" height="120%"
              style={{ transformOrigin: "center" }}
              initial={{ scale: 0, rx: 8 }}
              animate={{
                scale: isExpanding ? 1 : 0,
                rx: isExpanding ? 0 : 8,
              }}
              transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
            />
          </mask>
        </defs>
        
        <g mask="url(#intro-mask)">
          <rect width="100%" height="100%" fill="#05070a" />
          {stars.map((s) => (
            <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.opacity} />
          ))}
        </g>

        <motion.rect
          fill="none"
          stroke="white"
          x="-10%" y="-10%" width="120%" height="120%"
          style={{ transformOrigin: "center" }}
          initial={{ strokeWidth: 4, scale: 0, rx: 8 }}
          animate={{
            strokeWidth: isExpanding ? 0 : 4,
            scale: isExpanding ? 1 : 0,
            rx: isExpanding ? 0 : 8,
          }}
          transition={{ duration: 1.0, ease: [0.76, 0, 0.24, 1] }}
        />
      </motion.svg>
    </div>
  );
}
