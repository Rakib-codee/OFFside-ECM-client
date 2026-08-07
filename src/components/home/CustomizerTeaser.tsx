"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import AnimatedPrice from "@/components/fx/AnimatedPrice";
import MagneticButton from "@/components/fx/MagneticButton";
import TransitionLink from "@/components/fx/TransitionLink";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { CUSTOMIZATION_PRICE } from "@/lib/products";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";
import type { JerseyColors } from "@/lib/types";

gsap.registerPlugin(ScrollTrigger);

const BASE_PRICE = 89;
const MAX_NAME_LENGTH = 12;

const COLORWAYS: { key: string; colors: JerseyColors }[] = [
  { key: "crimson", colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" } },
  { key: "royal", colors: { body: "#f4f4f4", sleeve: "#e8e8e8", accent: "#1c3f94", text: "#1c3f94" } },
  { key: "midnight", colors: { body: "#0e1b2c", sleeve: "#132c4a", accent: "#00b7ff", text: "#00b7ff" } },
  { key: "forest", colors: { body: "#0c5132", sleeve: "#083d26", accent: "#ffd200", text: "#ffd200" } },
  { key: "canary", colors: { body: "#ffdc02", sleeve: "#f7c800", accent: "#009739", text: "#009739" } },
];

/** "Make It Yours" — live name/number/color preview with animated pricing. */
export default function CustomizerTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const [name, setName] = useState("");
  const [number, setNumber] = useState("10");
  const [activeColorway, setActiveColorway] = useState(0);
  const [isSwapping, setIsSwapping] = useState(false);

  const price = BASE_PRICE + (name || number ? CUSTOMIZATION_PRICE : 0);

  // Columns slide in from opposite sides and meet in the middle
  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion()) {
      return;
    }
    const tweens = [
      gsap.fromTo(
        section.querySelector("[data-col-left]"),
        { x: -60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: EASE_OUT,
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        },
      ),
      gsap.fromTo(
        section.querySelector("[data-col-right]"),
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.9,
          ease: EASE_OUT,
          scrollTrigger: { trigger: section, start: "top 75%", once: true },
        },
      ),
    ];
    return () => tweens.forEach((tween) => tween.scrollTrigger?.kill());
  }, []);

  const handleColorway = (index: number) => {
    if (index === activeColorway) {
      return;
    }
    // Crossfade the jersey while the colorway swaps underneath
    setIsSwapping(true);
    setTimeout(() => {
      setActiveColorway(index);
      setIsSwapping(false);
    }, 200);
  };

  const handleNumberChange = (raw: string) => {
    setNumber(raw.replace(/\D/g, "").slice(0, 2));
  };

  return (
    <section
      id="customize"
      ref={sectionRef}
      className="mx-auto grid max-w-[1400px] grid-cols-1 items-center gap-12 px-5 py-20 md:grid-cols-2 md:px-8 md:py-36"
      aria-label="Jersey customizer"
    >
      <div data-col-left className="flex flex-col items-center gap-8">
        <div
          className={`w-full max-w-sm transition-opacity duration-[400ms] ${isSwapping ? "opacity-0" : "opacity-100"}`}
        >
          <JerseyGraphic
            colors={COLORWAYS[activeColorway].colors}
            view="back"
            name={name || undefined}
            number={number || undefined}
            label={`Custom jersey preview${name ? ` for ${name}` : ""}`}
            className="mx-auto w-full drop-shadow-[0_24px_48px_rgba(0,0,0,0.5)]"
          />
        </div>

        <div className="flex w-full max-w-sm flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-secondary">
              Name
              <input
                type="text"
                value={name}
                maxLength={MAX_NAME_LENGTH}
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                className="h-12 rounded-lg border border-line bg-elevated px-4 text-base normal-case tracking-normal text-primary placeholder:text-muted focus:border-white focus:outline-none"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-xs uppercase tracking-wider text-secondary">
              Number
              <input
                type="text"
                inputMode="numeric"
                value={number}
                onChange={(event) => handleNumberChange(event.target.value)}
                placeholder="10"
                className="h-12 rounded-lg border border-line bg-elevated px-4 text-base tracking-normal text-primary placeholder:text-muted focus:border-white focus:outline-none tnum"
              />
            </label>
          </div>
          <div className="flex items-center gap-3" role="radiogroup" aria-label="Jersey color">
            {COLORWAYS.map((colorway, index) => (
              <button
                key={colorway.key}
                type="button"
                role="radio"
                aria-checked={index === activeColorway}
                aria-label={`${colorway.key} colorway`}
                onClick={() => handleColorway(index)}
                className={`h-8 w-8 rounded-full border-2 border-white transition-shadow ${
                  index === activeColorway ? "ring-2 ring-accent ring-offset-2 ring-offset-base" : ""
                }`}
                style={{ background: colorway.colors.body }}
              />
            ))}
          </div>
        </div>
      </div>

      <div data-col-right>
        <h2 className="font-display text-4xl font-semibold md:text-5xl">Make it personal</h2>
        <p className="mt-4 max-w-md text-lg text-secondary">
          Add your name and number. Choose your colors. Own the kit.
        </p>
        <p className="mt-8 text-3xl font-semibold">
          <AnimatedPrice value={price} />
        </p>
        <p className="mt-1 text-sm text-muted">
          Includes {name || number ? "custom printing" : "base jersey"} · Free shipping over $150
        </p>
        <div className="mt-8">
          <MagneticButton>
            <TransitionLink
              href="/product/crimson-fc-home-2026"
              className="inline-block rounded-lg bg-white px-10 py-4 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white hover:shadow-[0_8px_24px_rgba(255,59,48,0.3)] active:scale-95"
            >
              Start Customizing
            </TransitionLink>
          </MagneticButton>
        </div>
      </div>
    </section>
  );
}
