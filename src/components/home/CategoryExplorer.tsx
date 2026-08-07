"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import TransitionLink from "@/components/fx/TransitionLink";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import type { JerseyColors } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

interface Panel {
  title: string;
  href: string;
  background: string;
  colors: JerseyColors;
}

const PANELS: Panel[] = [
  {
    title: "Club Kits",
    href: "/shop?cat=club",
    background: "radial-gradient(ellipse 80% 70% at 30% 20%, rgba(255,59,48,0.22), transparent 65%), #101010",
    colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" },
  },
  {
    title: "National Teams",
    href: "/shop?cat=national",
    background: "radial-gradient(ellipse 80% 70% at 70% 20%, rgba(0,122,255,0.22), transparent 65%), #0e1116",
    colors: { body: "#9fd7f5", sleeve: "#ffffff", accent: "#1a2a6c", text: "#1a2a6c" },
  },
  {
    title: "Retro",
    href: "/shop?cat=retro",
    background: "radial-gradient(ellipse 80% 70% at 30% 80%, rgba(255,210,0,0.14), transparent 65%), #131009",
    colors: { body: "#8f0f26", sleeve: "#ffffff", accent: "#ffffff", text: "#ffffff" },
  },
  {
    title: "Training",
    href: "/shop?cat=training",
    background: "radial-gradient(ellipse 80% 70% at 70% 80%, rgba(52,199,89,0.12), transparent 65%), #0d120e",
    colors: { body: "#1c1c1e", sleeve: "#2c2c2e", accent: "#ff3b30", text: "#ffffff" },
  },
  {
    title: "Kids",
    href: "/shop?cat=kids",
    background: "radial-gradient(ellipse 80% 70% at 50% 30%, rgba(0,183,255,0.16), transparent 65%), #0c1014",
    colors: { body: "#00b7ff", sleeve: "#0e1b2c", accent: "#ffffff", text: "#ffffff" },
  },
];

/**
 * "The Lineup" — five full-height panels that scroll horizontally while the
 * section stays pinned. Collapses to a snap carousel on mobile.
 */
export default function CategoryExplorer() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) {
      return;
    }

    const mm = gsap.matchMedia();
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      const panelCount = PANELS.length;
      const scrollTween = gsap.to(track, {
        xPercent: -100 * ((panelCount - 1) / panelCount),
        ease: "none",
        scrollTrigger: {
          trigger: section,
          pin: true,
          scrub: 1,
          end: () => `+=${track.scrollWidth}`,
          invalidateOnRefresh: true,
        },
      });

      // Parallax: jerseys drift slower than the panels themselves
      const jerseyTweens = Array.from(track.querySelectorAll("[data-panel-jersey]")).map(
        (jersey) =>
          gsap.fromTo(
            jersey,
            { xPercent: -18 },
            {
              xPercent: 18,
              ease: "none",
              scrollTrigger: {
                trigger: section,
                scrub: 1,
                start: "top top",
                end: () => `+=${track.scrollWidth}`,
              },
            },
          ),
      );

      return () => {
        scrollTween.kill();
        jerseyTweens.forEach((tween) => tween.kill());
      };
    });

    return () => mm.revert();
  }, []);

  return (
    <section ref={sectionRef} className="relative overflow-hidden" aria-label="Shop by category">
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto md:snap-none md:overflow-visible"
      >
        {PANELS.map((panel) => (
          <article
            key={panel.title}
            className="relative flex h-[72vh] w-[85vw] shrink-0 snap-start items-end overflow-hidden md:h-screen md:w-screen"
            style={{ background: panel.background }}
          >
            <div
              data-panel-jersey
              aria-hidden="true"
              className="absolute right-[8%] top-1/2 w-[46%] max-w-[420px] -translate-y-1/2 rotate-6 opacity-40"
            >
              <JerseyGraphic colors={panel.colors} />
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-black/50" />
            <div className="relative z-10 p-6 md:p-12">
              <h3
                className="font-display font-semibold text-white mix-blend-difference"
                style={{ fontSize: "clamp(36px, 5vw, 64px)" }}
              >
                {panel.title}
              </h3>
              <TransitionLink
                href={panel.href}
                className="group mt-3 inline-flex items-center gap-2 text-sm font-medium text-white/90 transition-colors hover:text-white"
              >
                Explore
                <span className="transition-transform duration-300 group-hover:translate-x-1.5">→</span>
              </TransitionLink>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
