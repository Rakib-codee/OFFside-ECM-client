"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Site-wide Lenis smooth scrolling, kept in sync with GSAP ScrollTrigger
 * by driving Lenis from the GSAP ticker. Skipped on /admin — the dashboard
 * is a utility page and native scrolling there must never be interfered with.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    if (isAdmin || prefersReducedMotion()) {
      return;
    }

    const lenis = new Lenis({ lerp: 0.1, duration: 1.2 });
    lenis.on("scroll", ScrollTrigger.update);

    const rafCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(rafCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(rafCallback);
      lenis.destroy();
    };
  }, [isAdmin]);

  return null;
}
