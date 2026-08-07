/** Shared motion helpers — every animated component checks these before moving pixels. */

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isFinePointer(): boolean {
  if (typeof window === "undefined") {
    return false;
  }
  return window.matchMedia("(pointer: fine)").matches;
}

export const EASE_OUT = "power3.out";
export const EASE_IN_OUT = "power3.inOut";
export const EASE_HERO = "power4.out";

export const REVEAL_DISTANCE = 40;
export const REVEAL_DURATION = 0.8;
export const REVEAL_STAGGER = 0.08;
