"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TransitionLink from "@/components/fx/TransitionLink";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { useT } from "@/lib/i18n/locale";
import type { MessageKey } from "@/lib/i18n/dictionary";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";
import type { JerseyColors } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

interface Panel {
  titleKey: MessageKey;
  href: string;
  background: string;
  colors: JerseyColors;
}

const PANELS: Panel[] = [
  {
    titleKey: "cat.club",
    href: "/shop?cat=club",
    background: "radial-gradient(ellipse 80% 70% at 30% 20%, rgba(255,59,48,0.22), transparent 65%), #101010",
    colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" },
  },
  {
    titleKey: "cat.national",
    href: "/shop?cat=national",
    background: "radial-gradient(ellipse 80% 70% at 70% 20%, rgba(0,122,255,0.22), transparent 65%), #0e1116",
    colors: { body: "#9fd7f5", sleeve: "#ffffff", accent: "#1a2a6c", text: "#1a2a6c" },
  },
  {
    titleKey: "cat.retro",
    href: "/shop?cat=retro",
    background: "radial-gradient(ellipse 80% 70% at 30% 80%, rgba(255,210,0,0.14), transparent 65%), #131009",
    colors: { body: "#8f0f26", sleeve: "#ffffff", accent: "#ffffff", text: "#ffffff" },
  },
  {
    titleKey: "cat.training",
    href: "/shop?cat=training",
    background: "radial-gradient(ellipse 80% 70% at 70% 80%, rgba(52,199,89,0.12), transparent 65%), #0d120e",
    colors: { body: "#1c1c1e", sleeve: "#2c2c2e", accent: "#ff3b30", text: "#ffffff" },
  },
  {
    titleKey: "cat.kids",
    href: "/shop?cat=kids",
    background: "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(0,183,255,0.16), transparent 65%), #0c1014",
    colors: { body: "#00b7ff", sleeve: "#0e1b2c", accent: "#ffffff", text: "#ffffff" },
  },
];

/**
 * "The Lineup" — five rounded full-bleed panels on plain vertical scroll.
 * Each card scales/fades in as it enters, its jersey drifts in parallax,
 * and the content sits vertically centered, alternating sides per panel.
 * No pinning, no sticky, no CSS transform classes — every transform is
 * GSAP-owned, so nothing can fight the smooth scroller.
 */
export default function CategoryExplorer() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) {
      return;
    }

    const tweens: gsap.core.Tween[] = [];
    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-panel-card]"));

    cards.forEach((card, index) => {
      // Card settles from slightly small/dim to full presence while entering
      tweens.push(
        gsap.fromTo(
          card,
          { scale: 0.94, opacity: 0.55 },
          {
            scale: 1,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: card, start: "top 92%", end: "top 45%", scrub: 1 },
          },
        ),
      );

      // Jersey drifts slower than the scroll and keeps a slight tilt
      const jersey = card.querySelector("[data-panel-jersey]");
      if (jersey) {
        const tilt = index % 2 === 0 ? 7 : -7;
        tweens.push(
          gsap.fromTo(
            jersey,
            { y: 70, rotation: tilt },
            {
              y: -70,
              rotation: tilt,
              ease: "none",
              scrollTrigger: { trigger: card, start: "top bottom", end: "bottom top", scrub: 1 },
            },
          ),
        );
      }

      // Copy rises once when the card is properly on screen
      const contentItems = card.querySelectorAll("[data-panel-copy] > *");
      if (contentItems.length > 0) {
        tweens.push(
          gsap.fromTo(
            contentItems,
            { y: 36, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.7,
              stagger: 0.09,
              ease: EASE_OUT,
              scrollTrigger: { trigger: card, start: "top 70%", once: true },
            },
          ),
        );
      }
    });

    return () => {
      tweens.forEach((tween) => {
        tween.scrollTrigger?.kill();
        tween.kill();
      });
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-16"
      aria-label="Shop by category"
    >
      <div className="flex flex-col gap-4 md:gap-6">
        {PANELS.map((panel, index) => {
          const isJerseyRight = index % 2 === 0;
          return (
            <article
              key={panel.titleKey}
              data-panel-card
              className="relative flex min-h-[70vh] items-center overflow-hidden rounded-3xl md:min-h-[82vh]"
              style={{ background: panel.background, willChange: "transform" }}
            >
              {/* Oversized watermark number */}
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute top-4 font-jersey text-[26vw] font-semibold leading-none text-white/[0.05] md:text-[14rem] ${
                  isJerseyRight ? "left-6" : "right-6"
                }`}
              >
                0{index + 1}
              </span>

              {/* Jersey, vertically centered by flex, parallax-driven by GSAP */}
              <div
                aria-hidden="true"
                className={`absolute inset-y-0 flex w-[55%] max-w-[430px] items-center opacity-50 md:opacity-70 ${
                  isJerseyRight ? "right-[4%] md:right-[7%]" : "left-[4%] md:left-[7%]"
                }`}
              >
                <div data-panel-jersey className="w-full">
                  <JerseyGraphic colors={panel.colors} />
                </div>
              </div>

              <div aria-hidden="true" className="absolute inset-0 bg-black/40" />

              {/* Copy: vertically centered, opposite the jersey */}
              <div
                data-panel-copy
                className={`relative z-10 flex w-full flex-col gap-4 p-8 md:p-16 ${
                  isJerseyRight ? "items-start text-left" : "items-start text-left md:items-end md:text-right"
                }`}
              >
                <p className="font-jersey text-sm font-semibold tracking-[0.35em] text-white/60 tnum">
                  0{index + 1} / 0{PANELS.length}
                </p>
                <h3
                  className="font-display font-semibold text-white"
                  style={{ fontSize: "clamp(40px, 6vw, 76px)", lineHeight: 1.05 }}
                >
                  {t(panel.titleKey)}
                </h3>
                <TransitionLink
                  href={panel.href}
                  className="group inline-flex items-center gap-2 rounded-full border border-white/30 px-6 py-3 text-sm font-medium text-white transition-colors hover:border-white hover:bg-white hover:text-black"
                >
                  {t("cat.explore")}
                  <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
                </TransitionLink>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
