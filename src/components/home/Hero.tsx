"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import MagneticButton from "@/components/fx/MagneticButton";
import TransitionLink from "@/components/fx/TransitionLink";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { EASE_HERO, prefersReducedMotion } from "@/lib/motion";
import { useT } from "@/lib/i18n/locale";

const SCROLL_CUE_HIDE_Y = 200;

export default function Hero() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);
  const [isCueVisible, setIsCueVisible] = useState(true);

  // Headline words rise out of overflow containers, then sub + CTA fade in
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) {
      return;
    }
    const reduced = prefersReducedMotion();
    const timeline = gsap.timeline();
    timeline.fromTo(
      section.querySelectorAll("[data-hero-word]"),
      reduced ? { opacity: 0 } : { yPercent: 100 },
      {
        yPercent: 0,
        opacity: 1,
        duration: reduced ? 0.3 : 1.2,
        ease: EASE_HERO,
        stagger: reduced ? 0 : 0.1,
      },
    );
    timeline.fromTo(
      section.querySelectorAll("[data-hero-fade]"),
      { opacity: 0, y: reduced ? 0 : 16 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 },
      reduced ? ">" : "-=0.5",
    );
    return () => {
      timeline.kill();
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsCueVisible(window.scrollY < SCROLL_CUE_HIDE_Y);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center overflow-hidden"
      aria-label="Hero"
    >
      {/* Stadium backdrop: floodlights, pitch stripes and a slow Ken Burns drift */}
      <div
        aria-hidden="true"
        className="absolute inset-0 motion-safe:animate-[kenburns_24s_ease-in-out_infinite_alternate]"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 20% 0%, rgba(0,122,255,0.16), transparent 60%)," +
            "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(255,59,48,0.14), transparent 60%)," +
            "repeating-linear-gradient(90deg, color-mix(in srgb, var(--t-primary) 2%, transparent) 0 120px, transparent 120px 240px)," +
            "var(--t-base)",
        }}
      />
      {/* Oversized drifting jerseys */}
      <div aria-hidden="true" className="absolute -right-24 top-1/2 hidden w-[480px] -translate-y-1/2 rotate-12 opacity-[0.13] motion-safe:animate-[float-slow_9s_ease-in-out_infinite] lg:block">
        <JerseyGraphic colors={{ body: "#ff3b30", sleeve: "#b3122f", accent: "#ffffff", text: "#ffffff" }} view="back" number={10} />
      </div>
      <div aria-hidden="true" className="absolute -left-32 bottom-0 hidden w-[380px] -rotate-6 opacity-[0.09] motion-safe:animate-[float-slow_11s_ease-in-out_infinite] lg:block">
        <JerseyGraphic colors={{ body: "#007aff", sleeve: "#1c3f94", accent: "#ffffff", text: "#ffffff" }} view="back" number={7} />
      </div>
      {/* Bottom fade overlay */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-base/30 via-transparent to-base/80"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1400px] px-5 md:px-8">
        <h1 className="font-display font-bold leading-[1.02] text-primary" style={{ fontSize: "clamp(48px, 8vw, 96px)" }}>
          {t("hero.headline").split(" ").map((word) => (
            <span
              key={word}
              className="mr-[0.28em] inline-block overflow-hidden pb-1 align-bottom last:mr-0"
            >
              <span data-hero-word className="inline-block will-change-transform">
                {word}
              </span>
            </span>
          ))}
        </h1>
        <p data-hero-fade className="mt-5 max-w-md text-lg text-secondary opacity-0">
          {t("hero.sub")}
        </p>
        <div data-hero-fade className="mt-9 opacity-0">
          <MagneticButton>
            <TransitionLink
              href="/shop"
              className="inline-block rounded-lg bg-cta px-10 py-4 font-medium text-cta-text transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-[0_8px_24px_rgba(255,59,48,0.3)] active:scale-95"
            >
              {t("hero.cta")}
            </TransitionLink>
          </MagneticButton>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={`absolute bottom-8 left-1/2 h-14 w-px -translate-x-1/2 bg-cta/60 transition-opacity duration-500 motion-safe:animate-[scroll-cue_2s_ease-in-out_infinite] ${
          isCueVisible ? "opacity-100" : "opacity-0"
        }`}
      />
    </section>
  );
}
