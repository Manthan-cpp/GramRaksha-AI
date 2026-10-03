"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CinematicIntro } from "./CinematicIntro";
import Link from "next/link";
import { useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform, useMotionValueEvent, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import { useIntroStore } from "@/lib/store/intro-store";

export function LandingHero() {
  const { phase } = useIntroStore();
  const locale = useLocale();
  const router = useRouter();
  
  const heroRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const layerSkyRef = useRef<HTMLDivElement | null>(null);
  const layerHillsRef = useRef<HTMLDivElement | null>(null);
  const layerHouseRef = useRef<HTMLDivElement | null>(null);
  const sunFlareRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });



  const uiOpacity = useTransform(scrollYProgress, [0, 0.1, 0.9, 1], [1, 0, 0, 0]);
  
  const isIntroHold = phase === "idle" || phase === "black" || phase === "reveal-logo";
  const isPoppedUp = phase === "expand-website" || phase === "done";

  const hasNavigatedRef = useRef(false);
  const animationControlsRef = useRef<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [isFaded, setIsFaded] = useState(false);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    if (!isPoppedUp) {
      const lockScroll = () => window.scrollTo(0, 0);
      window.addEventListener("scroll", lockScroll);
      return () => window.removeEventListener("scroll", lockScroll);
    }
  }, [isPoppedUp]);
  
  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > 0.05 !== isFaded) {
      setIsFaded(latest > 0.05);
    }
    
    if (latest > 0.98 && !hasNavigatedRef.current) {
      hasNavigatedRef.current = true;
      if (animationControlsRef.current) animationControlsRef.current.stop();
      setIsNavigating(true);
      document.body.style.overflow = "";
      window.scrollTo(0, 0);
      router.push(`/${locale}/home`);
    }
  });
  const ctaText = locale === "hi"
    ? "होम में प्रवेश करें"
    : locale === "bn"
    ? "হোমে প্রবেশ করুন"
    : "ENTER HOME";

  let ctaLetters: string[] = [];
  if (typeof Intl !== 'undefined' && Intl.Segmenter) {
    const segmenter = new Intl.Segmenter(locale, { granularity: 'grapheme' });
    ctaLetters = Array.from(segmenter.segment(ctaText)).map(s => s.segment);
  } else {
    ctaLetters = ctaText.split("");
  }

  useEffect(() => {
    const hero = heroRef.current;
    const sky = layerSkyRef.current;
    const hills = layerHillsRef.current;
    const flare = sunFlareRef.current;
    if (!hero) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let startTime = performance.now();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = hero.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      targetX = x;
      targetY = y;
    };

    const handleMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.gamma !== null && e.beta !== null) {
        targetX = Math.min(Math.max(e.gamma / 30, -1), 1);
        targetY = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
      }
    };

    const animate = (now: number) => {
      const elapsed = (now - startTime) * 0.001;
      
      const idleSwayX = Math.sin(elapsed * 0.8) * 0.03;
      const idleSwayY = Math.cos(elapsed * 0.6) * 0.02;

      currentX += (targetX + idleSwayX - currentX) * 0.07;
      currentY += (targetY + idleSwayY - currentY) * 0.07;

      const scrollProgress = scrollYProgress.get();
      const parallaxFade = Math.max(0, 1 - scrollProgress * 10); // reaches 0 at 10% scroll

      if (sky) {
        sky.style.transform = `scale(1.10) translate3d(${currentX * -28 * parallaxFade}px, ${Math.min(currentY * -6, 2) * parallaxFade}px, 0)`;
      }

      if (flare) {
        flare.style.transform = `translate3d(${currentX * -30 * parallaxFade}px, ${Math.min(currentY * -6, 2) * parallaxFade}px, 0)`;
      }

      if (hills) {
        hills.style.transform = `scale(1.08) translate3d(${currentX * -14 * parallaxFade}px, ${currentY * -6 * parallaxFade}px, 0)`;
      }


      rafId = requestAnimationFrame(animate);
    };

    hero.addEventListener("mousemove", handleMouseMove);
    hero.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("deviceorientation", handleOrientation);
    rafId = requestAnimationFrame(animate);

    return () => {
      hero.removeEventListener("mousemove", handleMouseMove);
      hero.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("deviceorientation", handleOrientation);
      cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const particles: { x: number; y: number; r: number; speedX: number; speedY: number; opacity: number; pulse: number }[] = [];
    const count = 30;

    const resize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 2 + 0.8,
        speedX: (Math.random() - 0.2) * 0.4,
        speedY: (Math.random() - 0.5) * 0.3 - 0.2,
        opacity: Math.random() * 0.6 + 0.2,
        pulse: Math.random() * Math.PI * 2,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        p.x += p.speedX;
        p.y += p.speedY;
        p.pulse += 0.02;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        const currentAlpha = p.opacity * (0.6 + 0.4 * Math.sin(p.pulse));
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 215, 120, ${currentAlpha})`;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  const handleEnterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isNavigating || !isPoppedUp) return;
    
    document.body.style.overflow = "hidden";
    
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    
    animationControlsRef.current = animate(window.scrollY, maxScroll, {
      duration: 3,
      ease: [0.45, 0.05, 0.55, 0.95],
      onUpdate: (latest) => {
        window.scrollTo(0, latest);
      },
    });
  };

  return (
    <div ref={containerRef} className="relative w-full h-[400vh] bg-[#0d0f14] select-none">
      <CinematicIntro />
      <motion.div
        className="fixed z-[60] pointer-events-none"
        style={{ opacity: isNavigating ? 0 : uiOpacity }}
        initial={false}
        animate={
          isIntroHold
            ? {
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%",
                width: 400,
              }
            : {
                top: 28,
                left: 48,
                x: "0%",
                y: "0%",
                width: 200,
              }
        }
        transition={
          isIntroHold
            ? { duration: 0 }
            : { duration: 1.0, ease: [0.76, 0, 0.24, 1] }
        }
      >
        <motion.div
          className="w-full overflow-hidden"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{
            clipPath:
              phase === "idle" || phase === "black"
                ? "inset(0 100% 0 0)"
                : "inset(0 0% 0 0)",
          }}
          transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
        >
          <Image
            src="/images/logo.png"
            alt="GramRaksha AI"
            width={800}
            height={280}
            unoptimized
            className="w-full h-auto object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.6)]"
            priority
          />
        </motion.div>
      </motion.div>

      <div ref={heroRef} className="sticky top-0 w-full h-screen overflow-hidden flex items-center bg-[#0d0f14]">
        <header className="absolute top-0 w-full z-50 pointer-events-none">
          <div className="w-full px-6 sm:px-12 lg:px-16 h-20 sm:h-24 flex items-center">
            <div className="relative flex items-center shrink-0">
              <div className="w-[200px] h-12" />
          </div>
        </div>
        </header>
      {/* ─────────────────────────────────────────────────────────────
          CINEMATIC BACKGROUND LAYERS WRAPPER:
          Calibrated brightness & contrast reduction for an ultra-premium, moody twilight aesthetic.
      ───────────────────────────────────────────────────────────── */}
      <motion.div 
        className="absolute inset-0 w-full h-full pointer-events-none filter brightness-[0.78] contrast-[1.08] saturate-[0.96]"
      >
        <div className="absolute inset-0 w-full h-full pointer-events-none">
          <div
            ref={layerSkyRef}
            className="absolute inset-x-0 -top-1.5 w-full h-[106%] pointer-events-none transform-gpu origin-top will-change-transform"
            style={{ transform: "scale(1.10)" }}
          >
            <Image
              src="/images/parallax-sky-v6.png"
              alt="Sunset Sky and Distant Mountains"
              fill
              priority
              quality={95}
              className="object-cover object-top"
              sizes="100vw"
            />
          </div>

          <div
            ref={sunFlareRef}
            className="absolute top-[14%] left-[7%] sm:left-[9%] w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none transform-gpu will-change-transform"
            style={{
              background:
                "radial-gradient(circle, rgba(255, 200, 90, 0.22) 0%, rgba(245, 158, 11, 0.08) 40%, transparent 70%)",
              filter: "blur(40px)",
            }}
          />
        </div>

        <motion.div
          initial={{ y: "120%" }}
          animate={{ y: isPoppedUp ? "0%" : "120%" }}
          transition={{ delay: isPoppedUp ? 0.55 : 0, duration: 1.0, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          <div
            ref={layerHillsRef}
            className="absolute inset-x-0 -top-12 sm:-top-20 lg:-top-24 w-full h-[114%] pointer-events-none transform-gpu origin-top will-change-transform"
            style={{ transform: "scale(1.08)" }}
          >
            <Image
              src="/images/parallax-hills-v6.png"
              alt="Terraced Hills and River Valley"
              fill
              priority
              quality={95}
              className="object-cover object-top"
              sizes="100vw"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isPoppedUp ? 1 : 0 }}
          transition={{ delay: isPoppedUp ? 0.9 : 0, duration: 1.2 }}
          className="absolute inset-0 w-full h-full pointer-events-none z-5"
        >
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
          />
        </motion.div>

        <motion.div
          initial={{ y: "120%" }}
          animate={{ y: isPoppedUp ? "0%" : "120%" }}
          transition={{ delay: isPoppedUp ? 0.65 : 0, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        >
          <div
            ref={layerHouseRef}
            className="absolute inset-0 w-full h-full pointer-events-none transform-gpu origin-center"
          >
            <Image
              src="/images/parallax-house-v6.png"
              alt="Rustic Village Cottage and Front Crops"
              fill
              priority
              quality={95}
              className="object-cover object-center"
              sizes="100vw"
            />
          </div>
        </motion.div>
      </motion.div>

      {/* ─────────────────────────────────────────────────────────────
          CINEMATIC AMBIENT SCRIM:
          Uniform dark atmosphere that cuts daylight glare and brings out quiet luxury
      ───────────────────────────────────────────────────────────── */}
      <motion.div style={{ opacity: isNavigating ? 0 : uiOpacity }} className="absolute inset-0 bg-black/35 pointer-events-none z-[15]" />
      <motion.div style={{ opacity: isNavigating ? 0 : uiOpacity }} className="relative z-20 w-full px-6 sm:px-12 lg:px-16 py-8 flex flex-col justify-center h-full pointer-events-none">
        <div className={`max-w-xl lg:max-w-2xl text-left space-y-7 sm:space-y-8 ${isFaded || isNavigating ? 'pointer-events-none' : 'pointer-events-auto'}`}>
          <motion.h1
            initial={{ clipPath: "inset(-20% 100% -20% -20%)" }}
            animate={{ clipPath: isPoppedUp ? "inset(-20% -20% -20% -20%)" : "inset(-20% 100% -20% -20%)" }}
            transition={{ delay: isPoppedUp ? 0.55 : 0, duration: 1.0, ease: "easeInOut" }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.12] drop-shadow-[0_4px_24px_rgba(0,0,0,0.95)]"
          >
            {locale === "hi" ? (
              <>
                ग्रामीण भारत के लिए, <br />
                <span className="text-yellow-400">
                  उन्नत तकनीक।
                </span>
              </>
            ) : locale === "bn" ? (
              <>
                গ্রামীণ ভারতের জন্য, <br />
                <span className="text-yellow-400">
                  উন্নত প্রযুক্তি।
                </span>
              </>
            ) : (
              <>
                Advanced AI, <br />
                <span className="text-yellow-400">
                  for India&apos;s heartland.
                </span>
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ clipPath: "inset(-20% 100% -20% -20%)" }}
            animate={{ clipPath: isPoppedUp ? "inset(-20% -20% -20% -20%)" : "inset(-20% 100% -20% -20%)" }}
            transition={{ delay: isPoppedUp ? 0.70 : 0, duration: 1.0, ease: "easeInOut" }}
            className="text-gray-300 text-base sm:text-lg lg:text-xl font-medium leading-relaxed max-w-lg lg:max-w-xl drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]"
          >
            {locale === "hi"
              ? "100% ऑन-डिवाइस AI के साथ ग्रामीण भारत का सशक्तिकरण। SerpApi की बेजोड़ गति और सटीकता द्वारा संचालित, हम आपके गाँव के लिए रीयल-टाइम सर्च इंटेलिजेंस और अकाट्य प्रमाण प्रदान करते हैं।"
              : locale === "bn"
              ? "100% অন-ডিভাইস এআই এর মাধ্যমে গ্রামীণ ভারতের ক্ষমতায়ন। SerpApi-এর অবিশ্বাস্য গতি এবং নির্ভুলতার দ্বারা চালিত, আমরা আপনার গ্রামের জন্য রিয়েল-টাইম সার্চ ইন্টেলিজেন্স এবং অকাট্য প্রমাণ সরবরাহ করি।"
              : "Empowering rural India with 100% on-device AI. Powered by the lightning-fast precision of SerpApi, we deliver real-time search intelligence and undeniable proof for your village."}
          </motion.p>

          <motion.div
            initial={{ clipPath: "inset(-20% 100% -20% -20%)" }}
            animate={{ clipPath: isPoppedUp ? "inset(-20% -20% -20% -20%)" : "inset(-20% 100% -20% -20%)" }}
            transition={{ delay: isPoppedUp ? 0.85 : 0, duration: 1.0, ease: "easeInOut" }}
            className="pt-2"
          >
            <Link
              href={`/${locale}/home`}
              onClick={handleEnterClick}
              className="relative inline-flex items-center gap-2.5 px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-lg bg-yellow-400 hover:bg-yellow-500 text-black font-bold text-sm sm:text-base border-2 border-black cursor-pointer group shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span className="flex">
                {ctaLetters.map((char, index) => (
                  <span key={index} className="relative overflow-hidden h-[1.5em] block">
                    <span
                      className="flex flex-col transition-transform duration-[350ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover:-translate-y-1/2 group-focus-visible:-translate-y-1/2 motion-reduce:transition-none"
                      style={{ transitionDelay: `${index * 15}ms` }}
                    >
                      <span className="h-[1.5em] flex items-center">
                        {char === " " ? "\u00A0" : char}
                      </span>
                      <span className="h-[1.5em] flex items-center" aria-hidden="true">
                        {char === " " ? "\u00A0" : char}
                      </span>
                    </span>
                  </span>
                ))}
              </span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </div>
  </div>
  );
}
