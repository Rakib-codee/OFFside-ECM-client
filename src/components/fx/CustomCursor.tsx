"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import { isFinePointer, prefersReducedMotion } from "@/lib/motion";

const DOT_LERP = 0.45;
const RING_LERP = 0.14;
const CLICKABLE_SELECTOR =
  'a, button, input, textarea, select, label, [role="button"], [data-cursor]';

const ACCENT = "#ff3b30";
const RING_IDLE_BORDER = "rgba(255,59,48,0.55)";
/* Hover ring is white with a faint dark halo so it reads on ANY surface —
   including the accent-red buttons it will often sit on. */
const RING_HOVER_BORDER = "rgba(255,255,255,0.95)";
const RING_HOVER_FILL = "rgba(255,255,255,0.06)";
const RING_HOVER_HALO = "0 0 0 1px rgba(0,0,0,0.3)";

type CursorMode = "default" | "clickable" | "drag";

const POINTER_QUERIES = ["(pointer: fine)", "(prefers-reduced-motion: reduce)"];

function subscribeToPointerCapability(onChange: () => void): () => void {
  const mediaLists = POINTER_QUERIES.map((query) => window.matchMedia(query));
  mediaLists.forEach((list) => list.addEventListener("change", onChange));
  return () => mediaLists.forEach((list) => list.removeEventListener("change", onChange));
}

/**
 * Brand cursor: a solid accent dot that tracks the pointer tightly, with a
 * larger accent ring trailing behind. The ring swells and fills over
 * clickable elements and morphs into a drag pill over galleries.
 * Never rendered on touch devices; all transforms are inline/GSAP-driven
 * (Tailwind v4 transform utilities would conflict with GSAP).
 */
export default function CustomCursor() {
  const dotWrapRef = useRef<HTMLDivElement>(null);
  const ringWrapRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const isEnabled = useSyncExternalStore(
    subscribeToPointerCapability,
    () => isFinePointer() && !prefersReducedMotion(),
    () => false,
  );

  useEffect(() => {
    const dotWrap = dotWrapRef.current;
    const ringWrap = ringWrapRef.current;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const drag = dragRef.current;
    if (!isEnabled || !dotWrap || !ringWrap || !dot || !ring || !drag) {
      return;
    }

    document.documentElement.classList.add("has-custom-cursor");

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dotPos = { ...target };
    const ringPos = { ...target };
    let mode: CursorMode = "default";

    const applyMode = (nextMode: CursorMode) => {
      mode = nextMode;
      const config = { duration: 0.25, ease: "power2.out" };
      if (nextMode === "drag") {
        gsap.to(dot, { scale: 0, ...config });
        gsap.to(ring, { scale: 0, ...config });
        gsap.to(drag, { scale: 1, opacity: 1, ...config });
        return;
      }
      gsap.to(drag, { scale: 0, opacity: 0, ...config });
      if (nextMode === "clickable") {
        gsap.to(dot, { scale: 0.5, ...config });
        gsap.to(ring, {
          scale: 1.45,
          borderColor: RING_HOVER_BORDER,
          backgroundColor: RING_HOVER_FILL,
          boxShadow: RING_HOVER_HALO,
          ...config,
        });
      } else {
        gsap.to(dot, { scale: 1, ...config });
        gsap.to(ring, {
          scale: 1,
          borderColor: RING_IDLE_BORDER,
          backgroundColor: "rgba(255,59,48,0)",
          boxShadow: "0 0 0 0 rgba(0,0,0,0)",
          ...config,
        });
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      target.x = event.clientX;
      target.y = event.clientY;
    };

    const tick = () => {
      dotPos.x += (target.x - dotPos.x) * DOT_LERP;
      dotPos.y += (target.y - dotPos.y) * DOT_LERP;
      ringPos.x += (target.x - ringPos.x) * RING_LERP;
      ringPos.y += (target.y - ringPos.y) * RING_LERP;
      dotWrap.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0)`;
      ringWrap.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`;
    };

    const handleMouseOver = (event: MouseEvent) => {
      const element = event.target as Element;
      if (element.closest('[data-cursor="drag"]')) {
        applyMode("drag");
      } else if (element.closest(CLICKABLE_SELECTOR)) {
        applyMode("clickable");
      } else {
        applyMode("default");
      }
    };

    // Press feedback: everything tightens, then springs back to the mode state
    const handleMouseDown = () => {
      gsap.to([dot, ring], { scale: "-=0.25", duration: 0.15, ease: "power2.out" });
    };
    const handleMouseUp = () => applyMode(mode);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mousedown", handleMouseDown, { passive: true });
    document.addEventListener("mouseup", handleMouseUp, { passive: true });
    gsap.ticker.add(tick);

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("mouseup", handleMouseUp);
      gsap.ticker.remove(tick);
    };
  }, [isEnabled]);

  if (!isEnabled) {
    return null;
  }

  return (
    <>
      {/* Trailing ring */}
      <div
        ref={ringWrapRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[200]"
      >
        <div
          ref={ringRef}
          className="absolute rounded-full"
          style={{
            left: -18,
            top: -18,
            width: 36,
            height: 36,
            border: `1.5px solid ${RING_IDLE_BORDER}`,
            backgroundColor: "rgba(255,59,48,0)",
          }}
        />
        {/* Drag pill lives on the slow layer so it feels weighty */}
        <div
          ref={dragRef}
          className="absolute flex items-center justify-center rounded-full text-sm font-semibold text-white"
          style={{
            left: -22,
            top: -22,
            width: 44,
            height: 44,
            backgroundColor: ACCENT,
            transform: "scale(0)",
            opacity: 0,
          }}
        >
          ↔
        </div>
      </div>
      {/* Core dot */}
      <div
        ref={dotWrapRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[201]"
      >
        <div
          ref={dotRef}
          className="absolute rounded-full"
          style={{ left: -4, top: -4, width: 8, height: 8, backgroundColor: ACCENT }}
        />
      </div>
    </>
  );
}
