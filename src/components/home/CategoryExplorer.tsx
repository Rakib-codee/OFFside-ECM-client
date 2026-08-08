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
 * "The Lineup" — sticky card stack. Every panel pins to the viewport via
 * position: sticky, the next one slides over it while the previous settles
 * back and dims. Native scroll only, so it stays buttery with Lenis.
 */
export default function CategoryExplorer() {
  const t = useT();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) {
      return;
    }

    const cards = Array.from(section.querySelectorAll<HTMLElement>("[data-stack-card]"));
    const tweens: gsap.core.Tween[] = [];

    cards.forEach((card, index) => {
      // Content rises into view once per card
      const content = card.querySelector("[data-stack-content]");
      if (content) {
        tweens.push(
          gsap.fromTo(
            content,
            { y: 48, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: EASE_OUT,
              scrollTrigger: { trigger: card, start: "top 65%", once: true },
            },
          ),
        );
      }

      // While the next card slides over, this one scales back and dims
      const inner = card.querySelector("[data-stack-inner]");
      const nextCard = cards[index + 1];
      if (inner && nextCard) {
        tweens.push(
          gsap.fromTo(
            inner,
            { scale: 1, opacity: 1 },
            {
              scale: 0.92,
              opacity: 0.4,
              ease: "none",
              scrollTrigger: {
                trigger: nextCard,
                start: "top bottom",
                end: "top top",
                scrub: true,
              },
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
    <section ref={sectionRef} className="relative" aria-label="Shop by category">
      {PANELS.map((panel, index) => (
        <div
          key={panel.titleKey}
          data-stack-card
          className="sticky top-0 h-svh"
          style={{ zIndex: index + 1 }}
        >
          <div
            data-stack-inner
            className="relative flex h-full w-full items-end overflow-hidden will-change-transform"
            style={{ background: panel.background }}
          >
            <div
              aria-hidden="true"
              className="absolute right-[6%] top-1/2 w-[52%] max-w-[440px] -translate-y-1/2 rotate-6 opacity-40 motion-safe:animate-[float-slow_8s_ease-in-out_infinite]"
            >
              <JerseyGraphic colors={panel.colors} />
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-black/50" />

            <div data-stack-content className="relative z-10 w-full p-6 md:p-12">
              <p className="mb-2 font-jersey text-sm font-semibold tracking-[0.3em] text-white/50 tnum">
                0{index + 1} / 0{PANELS.length}
              </p>
              <h3
                className="font-display font-semibold text-white mix-blend-difference"
                style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
              >
                {t(panel.titleKey)}
              </h3>
              <TransitionLink
                href={panel.href}
                className="group mt-3 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                {t("cat.explore")}
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </TransitionLink>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
