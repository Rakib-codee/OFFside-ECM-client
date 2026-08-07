"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { REVIEWS } from "@/lib/products";
import type { Product } from "@/lib/types";

const TABS = ["Description", "Sizing", "Shipping", "Reviews"] as const;
type Tab = (typeof TABS)[number];

const BODY_TYPES = ["Slim", "Regular", "Athletic"] as const;
type BodyType = (typeof BODY_TYPES)[number];

const RECOMMENDED_SIZES: Record<BodyType, string[]> = {
  Slim: ["S", "M"],
  Regular: ["M", "L"],
  Athletic: ["L", "XL"],
};

/** Star distribution shown in the Reviews tab breakdown chart. */
const RATING_BREAKDOWN = [
  { stars: 5, percent: 72 },
  { stars: 4, percent: 18 },
  { stars: 3, percent: 6 },
  { stars: 2, percent: 3 },
  { stars: 1, percent: 1 },
];

export default function ProductTabs({ product }: { product: Product }) {
  const [activeTab, setActiveTab] = useState<Tab>("Description");
  const [bodyType, setBodyType] = useState<BodyType>("Regular");
  const [helpfulVotes, setHelpfulVotes] = useState<Record<number, boolean>>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<Partial<Record<Tab, HTMLButtonElement | null>>>({});

  // Underline slides to the active tab; content crossfades in
  useEffect(() => {
    const tabButton = tabRefs.current[activeTab];
    const underline = underlineRef.current;
    if (tabButton && underline) {
      gsap.to(underline, {
        x: tabButton.offsetLeft,
        width: tabButton.offsetWidth,
        duration: 0.35,
        ease: "power2.out",
      });
    }
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" },
      );
    }
  }, [activeTab]);

  return (
    <section className="mt-16" aria-label="Product details">
      <div className="relative border-b border-line">
        <div role="tablist" aria-label="Product information" className="flex gap-6 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab}
              ref={(node) => {
                tabRefs.current[tab] = node;
              }}
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 text-sm font-medium transition-colors ${
                activeTab === tab ? "text-primary" : "text-muted hover:text-secondary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <span ref={underlineRef} className="absolute bottom-0 left-0 h-0.5 w-0 bg-accent" />
      </div>

      <div ref={contentRef} className="pt-6" role="tabpanel">
        {activeTab === "Description" ? (
          <div className="max-w-2xl text-secondary">
            <p>{product.description}</p>
            <ul className="mt-4 list-inside list-disc space-y-1 text-sm">
              <li>100% recycled performance polyester</li>
              <li>Sweat-wicking, quick-dry fabric</li>
              <li>Woven crest, heat-pressed sponsor print</li>
              <li>Machine wash cold, hang dry</li>
            </ul>
          </div>
        ) : null}

        {activeTab === "Sizing" ? (
          <div className="max-w-2xl">
            <p className="mb-4 text-sm text-secondary">
              Pick your build — we&apos;ll highlight the best fit.
            </p>
            <div className="mb-6 flex gap-2">
              {BODY_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBodyType(type)}
                  aria-pressed={bodyType === type}
                  className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                    bodyType === type
                      ? "border-transparent bg-white text-black"
                      : "border-line text-secondary hover:text-primary"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["XS", "S", "M", "L", "XL", "XXL"].map((size) => {
                const isRecommended = RECOMMENDED_SIZES[bodyType].includes(size);
                return (
                  <span
                    key={size}
                    className={`flex h-11 min-w-[52px] items-center justify-center rounded-full border px-4 text-sm transition-all ${
                      isRecommended
                        ? "border-accent bg-accent/10 font-semibold text-primary"
                        : "border-line text-muted"
                    }`}
                  >
                    {size}
                  </span>
                );
              })}
            </div>
            <p className="mt-4 text-sm text-muted">
              Recommended for a {bodyType.toLowerCase()} build:{" "}
              <span className="text-primary">{RECOMMENDED_SIZES[bodyType].join(" or ")}</span>
            </p>
          </div>
        ) : null}

        {activeTab === "Shipping" ? (
          <ul className="max-w-2xl space-y-3 text-sm text-secondary">
            <li>🚚 Free standard shipping on orders over $150</li>
            <li>⚡ Express delivery in 2–3 business days</li>
            <li>🔁 Free returns within 30 days — customized jerseys excluded</li>
            <li>🌍 Worldwide shipping to 60+ countries</li>
          </ul>
        ) : null}

        {activeTab === "Reviews" ? (
          <div className="grid max-w-4xl gap-10 md:grid-cols-[240px_1fr]">
            <div>
              <p className="mb-1 font-display text-5xl font-semibold tnum">{product.rating}</p>
              <p className="mb-5 text-sm text-muted">{product.reviewCount} reviews</p>
              <div className="flex flex-col gap-2">
                {RATING_BREAKDOWN.map((row) => (
                  <div key={row.stars} className="flex items-center gap-2 text-xs text-secondary">
                    <span className="w-6 tnum">{row.stars}★</span>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${row.percent}%` }}
                      />
                    </div>
                    <span className="w-8 text-right tnum">{row.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
            <ul className="space-y-6">
              {REVIEWS.slice(0, 3).map((review, index) => (
                <li key={review.name} className="border-b border-line pb-6 last:border-b-0">
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium">{review.name}</span>
                    <span className="text-xs text-accent">{"★".repeat(review.rating)}</span>
                  </div>
                  <p className="mb-3 text-sm text-secondary">“{review.quote}”</p>
                  <button
                    type="button"
                    onClick={() =>
                      setHelpfulVotes((votes) => ({ ...votes, [index]: !votes[index] }))
                    }
                    className={`text-xs transition-colors ${
                      helpfulVotes[index] ? "text-success" : "text-muted hover:text-primary"
                    }`}
                  >
                    {helpfulVotes[index] ? "✓ Marked helpful" : "Helpful?"}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  );
}
