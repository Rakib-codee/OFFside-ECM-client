"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import JerseyGraphic from "./JerseyGraphic";
import type { JerseyColors, Product } from "@/lib/types";

const SWIPE_THRESHOLD_PX = 50;

interface GalleryView {
  key: string;
  view: "front" | "back";
  colors: JerseyColors;
}

interface GalleryProps {
  product: Product;
  colors: JerseyColors;
  customName?: string;
  customNumber?: string;
  /** Index controlled from outside so typing a name can flip to the back view. */
  activeIndex: number;
  onIndexChange: (index: number) => void;
}

export default function Gallery({
  product,
  colors,
  customName,
  customNumber,
  activeIndex,
  onIndexChange,
}: GalleryProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  const views: GalleryView[] = [
    { key: "front", view: "front", colors },
    { key: "back", view: "back", colors },
  ];
  const active = views[Math.min(activeIndex, views.length - 1)];

  // Crossfade whenever the visible view changes
  useEffect(() => {
    if (mainRef.current) {
      gsap.fromTo(mainRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    }
  }, [active.key, colors]);

  // Lightbox entrance + Escape to close
  useEffect(() => {
    if (isZoomed && lightboxRef.current) {
      gsap.fromTo(
        lightboxRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" },
      );
    }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsZoomed(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isZoomed]);

  const handlePointerDown = (event: React.PointerEvent) => {
    dragStartX.current = event.clientX;
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    if (dragStartX.current === null) {
      return;
    }
    const delta = event.clientX - dragStartX.current;
    dragStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) {
      setIsZoomed(true);
      return;
    }
    const direction = delta < 0 ? 1 : -1;
    onIndexChange((activeIndex + direction + views.length) % views.length);
  };

  const jersey = (className: string) => (
    <JerseyGraphic
      colors={active.colors}
      view={active.view}
      name={active.view === "back" ? customName : undefined}
      number={active.view === "back" ? customNumber ?? product.number : undefined}
      label={`${product.team} ${product.name}, ${active.view} view`}
      className={className}
    />
  );

  return (
    <div className="flex gap-4">
      {/* Thumbnail strip */}
      <div className="flex w-20 flex-col gap-3">
        {views.map((view, index) => (
          <button
            key={view.key}
            type="button"
            onClick={() => onIndexChange(index)}
            aria-label={`Show ${view.view} view`}
            aria-pressed={index === activeIndex}
            className={`aspect-[3/4] rounded-lg border bg-elevated p-2 transition-colors ${
              index === activeIndex ? "border-white" : "border-line hover:border-muted"
            }`}
          >
            <JerseyGraphic
              colors={view.colors}
              view={view.view}
              number={view.view === "back" ? product.number : undefined}
            />
          </button>
        ))}
      </div>

      {/* Main image: drag to flip views, click to zoom */}
      <div
        ref={mainRef}
        data-cursor="drag"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="flex-1 touch-pan-y select-none rounded-2xl bg-elevated p-8"
        role="button"
        tabIndex={0}
        aria-label="Product image. Drag to rotate, click to zoom"
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            setIsZoomed(true);
          }
        }}
      >
        <div className="aspect-[3/4] w-full">{jersey("h-full w-full")}</div>
      </div>

      {isZoomed ? (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed product image"
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-8"
        >
          <button
            type="button"
            aria-label="Close zoom"
            className="absolute right-6 top-6 text-3xl leading-none text-white/80 hover:text-white"
          >
            ×
          </button>
          {jersey("h-full max-h-[85vh] w-auto")}
        </div>
      ) : null}
    </div>
  );
}
