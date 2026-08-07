"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";

/** Remounts on every route change to play the page-enter animation. */
export default function Template({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || prefersReducedMotion()) {
      return;
    }
    gsap.fromTo(
      element,
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: EASE_OUT, clearProps: "all" },
    );
  }, []);

  return (
    <div id="page-content" ref={ref} className="flex min-h-screen flex-col">
      {children}
    </div>
  );
}
