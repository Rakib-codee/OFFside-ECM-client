"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const FOLLOW_LERP = 0.15;
const CLICKABLE_SELECTOR =
  'a, button, input, textarea, select, label, [role="button"], [data-cursor]';

const POINTER_QUERIES = ["(pointer: fine)", "(prefers-reduced-motion: reduce)"];

function subscribeToPointerCapability(onChange: () => void): () => void {
  const mediaLists = POINTER_QUERIES.map((query) => window.matchMedia(query));
  mediaLists.forEach((list) => list.addEventListener("change", onChange));
  return () => mediaLists.forEach((list) => list.removeEventListener("change", onChange));
}

/**
 * White dot cursor that lerps after the mouse, grows with blend-difference
 * over clickable elements, and becomes a drag hint over galleries.
 * Never rendered on touch devices.
 */
export default function CustomCursor() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const isEnabled = useSyncExternalStore(
    subscribeToPointerCapability,
    () => isFinePointer() && !prefersReducedMotion(),
    () => false,
  );

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const dot = dotRef.current;
    const drag = dragRef.current;
    if (!isEnabled || !wrapper || !dot || !drag) {
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");

    const position = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const target = { ...position };

    const handleMouseMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };

    const tick = () => {
      position.x += (target.x - position.x) * FOLLOW_LERP;
      position.y += (target.y - position.y) * FOLLOW_LERP;
      wrapper.style.transform = `translate3d(${position.x}px, ${position.y}px, 0)`;
    };

    const handleMouseOver = (event: MouseEvent) => {
      const element = event.target as Element;
      const dragZone = element.closest('[data-cursor="drag"]');
      const clickable = element.closest(CLICKABLE_SELECTOR);
      if (dragZone) {
        gsap.to(dot, { scale: 0, duration: 0.2, ease: "power2.out" });
        gsap.to(drag, { scale: 1, opacity: 1, duration: 0.2, ease: "power2.out" });
      } else if (clickable) {
        gsap.to(dot, { scale: 5, duration: 0.25, ease: "power2.out" });
        gsap.to(drag, { scale: 0, opacity: 0, duration: 0.2, ease: "power2.out" });
      } else {
        gsap.to(dot, { scale: 1, duration: 0.25, ease: "power2.out" });
        gsap.to(drag, { scale: 0, opacity: 0, duration: 0.2, ease: "power2.out" });
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      gsap.ticker.remove(tick);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <div
      ref={wrapperRef}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[200]"
    >
      <div
        ref={dotRef}
        className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-white mix-blend-difference"
      />
      <div
        ref={dragRef}
        className="absolute -left-5 -top-5 flex h-10 w-10 scale-0 items-center justify-center rounded-full bg-white text-xs font-medium text-black opacity-0"
      >
        ↔
      </div>
    </div>
  );
}
