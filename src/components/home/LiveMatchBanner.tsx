"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import TransitionLink from "@/components/fx/TransitionLink";
import { MATCHDAY } from "@/lib/site";

/** Matchday strip that slides in below the navbar when a game is live. */
export default function LiveMatchBanner() {
  const [isDismissed, setIsDismissed] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const banner = bannerRef.current;
    if (!banner || !MATCHDAY.isLive) {
      return;
    }
    const tween = gsap.fromTo(
      banner,
      { yPercent: -110 },
      { yPercent: 0, duration: 0.5, ease: "power3.out", delay: 1.2 },
    );
    return () => {
      tween.kill();
    };
  }, []);

  if (!MATCHDAY.isLive || isDismissed) {
    return null;
  }

  const handleClose = () => {
    const banner = bannerRef.current;
    if (!banner) {
      setIsDismissed(true);
      return;
    }
    gsap.to(banner, {
      yPercent: -110,
      duration: 0.35,
      ease: "power3.in",
      onComplete: () => setIsDismissed(true),
    });
  };

  return (
    <div
      ref={bannerRef}
      className="fixed inset-x-0 top-16 z-[90] flex h-12 -translate-y-full items-center justify-center bg-accent px-10 text-sm font-medium text-white md:top-[72px]"
    >
      <p className="truncate">
        🔴 Matchday Live — {MATCHDAY.home} vs {MATCHDAY.away} —{" "}
        <TransitionLink href="/shop" className="underline underline-offset-2">
          Shop the kits
        </TransitionLink>
      </p>
      <button
        type="button"
        onClick={handleClose}
        aria-label="Dismiss matchday banner"
        className="absolute right-4 text-lg leading-none opacity-80 transition-opacity hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}
