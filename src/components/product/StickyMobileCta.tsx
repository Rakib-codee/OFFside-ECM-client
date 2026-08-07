"use client";

import { useEffect, useState, type RefObject } from "react";
import { formatPrice } from "@/lib/format";

interface StickyMobileCtaProps {
  /** The main add-to-cart area — the bar appears once it scrolls out of view. */
  watchRef: RefObject<HTMLDivElement | null>;
  price: number;
  disabled: boolean;
  onAdd: () => void;
}

/** Bottom-fixed add-to-cart bar for mobile, sitting above the tab bar. */
export default function StickyMobileCta({ watchRef, price, disabled, onAdd }: StickyMobileCtaProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const watched = watchRef.current;
    if (!watched) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    );
    observer.observe(watched);
    return () => observer.disconnect();
  }, [watchRef]);

  return (
    <div
      aria-hidden={!isVisible}
      className={`fixed inset-x-0 bottom-16 z-[95] flex h-16 items-center gap-3 border-t border-line bg-card/95 px-4 backdrop-blur-md transition-transform duration-300 md:hidden ${
        isVisible ? "translate-y-0" : "translate-y-[130%]"
      }`}
    >
      <span className="text-lg font-semibold tnum">{formatPrice(price)}</span>
      <button
        type="button"
        onClick={onAdd}
        disabled={disabled}
        className={`h-11 flex-1 rounded-lg text-sm font-medium transition-colors ${
          disabled ? "cursor-not-allowed bg-elevated text-muted" : "bg-white text-black"
        }`}
      >
        {disabled ? "Select a size" : "Add to cart"}
      </button>
    </div>
  );
}
