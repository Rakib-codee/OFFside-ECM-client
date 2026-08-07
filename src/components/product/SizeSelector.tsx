"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ALL_SIZES } from "@/lib/products";
import { useT } from "@/lib/i18n/locale";
import type { Product, Size } from "@/lib/types";

interface SizeSelectorProps {
  product: Product;
  selected: Size | null;
  onSelect: (size: Size) => void;
}

export default function SizeSelector({ product, selected, onSelect }: SizeSelectorProps) {
  const t = useT();
  const groupRef = useRef<HTMLDivElement>(null);

  const handleClick = (size: Size, target: HTMLButtonElement) => {
    onSelect(size);
    gsap.fromTo(target, { scale: 0.95 }, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <div ref={groupRef} role="radiogroup" aria-label={t("product.size")} className="flex flex-wrap gap-2">
      {ALL_SIZES.map((size) => {
        const isSoldOut = product.soldOutSizes.includes(size);
        const isSelected = selected === size;
        return (
          <button
            key={size}
            type="button"
            role="radio"
            aria-checked={isSelected}
            disabled={isSoldOut}
            aria-label={isSoldOut ? `${size} — ${t("product.soldOut")}` : size}
            onClick={(event) => handleClick(size, event.currentTarget)}
            className={`h-11 min-w-[52px] rounded-full border px-4 text-sm font-medium transition-colors ${
              isSelected
                ? "border-transparent bg-black text-white ring-2 ring-accent"
                : "border-line text-secondary hover:bg-line hover:text-primary"
            } ${isSoldOut ? "cursor-not-allowed opacity-40 line-through" : ""}`}
          >
            {size}
          </button>
        );
      })}
    </div>
  );
}
