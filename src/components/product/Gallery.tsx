"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import JerseyGraphic from "./JerseyGraphic";
import { useT } from "@/lib/i18n/locale";
import type { JerseyColors, Product } from "@/lib/types";

const SWIPE_THRESHOLD_PX = 50;

type GalleryView =
  | { key: string; src: string }
  | { key: string; view: "front" | "back"; colors: JerseyColors };

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
  const t = useT();
  const [isZoomed, setIsZoomed] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const dragStartX = useRef<number | null>(null);

  // Real photos take over unless a live customization preview is being typed
  const hasCustomPreview = Boolean(customName || customNumber);
  const views: GalleryView[] =
    product.images && product.images.length > 0 && !hasCustomPreview
      ? product.images.map((src, index) => ({ key: `photo-${index}`, src }))
      : [
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

  const jersey = (className: string) =>
    "src" in active ? (
      <div className={`relative ${className}`}>
        <Image
          src={active.src}
          alt={`${product.team} ${product.name}`}
          fill
          sizes="(min-width: 1024px) 45vw, 90vw"
          className="object-contain"
        />
      </div>
    ) : (
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
            aria-label={`View ${index + 1}`}
            aria-pressed={index === activeIndex}
            className={`relative aspect-[3/4] overflow-hidden rounded-lg border bg-elevated p-2 transition-colors ${
              index === activeIndex ? "border-primary" : "border-line hover:border-muted"
            }`}
          >
            {"src" in view ? (
              <Image src={view.src} alt="" fill sizes="80px" className="object-cover" />
            ) : (
              <JerseyGraphic
                colors={view.colors}
                view={view.view}
                number={view.view === "back" ? product.number : undefined}
              />
            )}
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
        aria-label={t("product.dragHint")}
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
          aria-label={t("product.dragHint")}
          onClick={() => setIsZoomed(false)}
          className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-8"
        >
          <button
            type="button"
            aria-label={t("product.zoomClose")}
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
