"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import AddToCartButton from "./AddToCartButton";
import CustomizationFields from "./CustomizationFields";
import Gallery from "./Gallery";
import ProductTabs from "./ProductTabs";
import SizeSelector from "./SizeSelector";
import StickyMobileCta from "./StickyMobileCta";
import { formatPrice } from "@/lib/format";
import { CUSTOMIZATION_PRICE, getEffectivePrice } from "@/lib/products";
import { useLocale, useT } from "@/lib/i18n/locale";
import { localizedDescription, localizedName, localizedTeam } from "@/lib/i18n/localize";
import { useCartStore } from "@/lib/store/cart";
import { useUiStore } from "@/lib/store/ui";
import type { Product, Size } from "@/lib/types";

const BACK_VIEW_INDEX = 1;

export default function ProductDetail({ product }: { product: Product }) {
  const t = useT();
  const locale = useLocale();
  const [size, setSize] = useState<Size | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customNumber, setCustomNumber] = useState("");
  const [colorway, setColorway] = useState<"primary" | "alt">("primary");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);

  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUiStore((state) => state.openCart);

  const colors = colorway === "alt" && product.altColors ? product.altColors : product.colors;
  const unitPrice = getEffectivePrice(product) + (isCustomizing ? CUSTOMIZATION_PRICE : 0);

  // Typing a name or number flips the gallery to the back view
  const handleNameChange = useCallback((name: string) => {
    setCustomName(name);
    if (name) {
      setGalleryIndex(BACK_VIEW_INDEX);
    }
  }, []);

  const handleNumberChange = useCallback((jerseyNumber: string) => {
    setCustomNumber(jerseyNumber);
    if (jerseyNumber) {
      setGalleryIndex(BACK_VIEW_INDEX);
    }
  }, []);

  // Scroll to top when landing on a product page mid-scroll
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [product.id]);

  const handleAdd = () => {
    if (!size) {
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      team: product.team,
      name: product.name,
      size,
      unitPrice,
      colors,
      customName: isCustomizing && customName ? customName : undefined,
      customNumber: isCustomizing && customNumber ? customNumber : undefined,
    });
    openCart();
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[55%_1fr] lg:gap-14">
        <Gallery
          product={product}
          colors={colors}
          customName={isCustomizing ? customName : undefined}
          customNumber={isCustomizing && customNumber ? customNumber : undefined}
          activeIndex={galleryIndex}
          onIndexChange={setGalleryIndex}
        />

        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-1 text-sm uppercase tracking-wider text-secondary">{localizedTeam(product, locale)}</p>
            <h1 className="font-display text-3xl font-medium md:text-4xl">{localizedName(product, locale)}</h1>
          </div>

          <p className="text-[28px] font-medium tnum">
            {product.salePrice ? (
              <>
                <span className="text-accent">{formatPrice(product.salePrice)}</span>{" "}
                <s className="text-lg text-muted">{formatPrice(product.price)}</s>
              </>
            ) : (
              formatPrice(product.price)
            )}
            {isCustomizing ? (
              <span className="ml-2 text-sm text-secondary">
                +{formatPrice(CUSTOMIZATION_PRICE)} {t("product.printing")}
              </span>
            ) : null}
          </p>

          <p className="text-sm">
            <span className="text-accent" aria-hidden="true">
              {"★".repeat(Math.round(product.rating))}
            </span>{" "}
            <span className="text-secondary">
              {product.rating} · {product.reviewCount} {t("product.reviews")}
            </span>
          </p>

          <div className="text-secondary">
            <p className={isDescriptionOpen ? "" : "line-clamp-3"}>{localizedDescription(product, locale)}</p>
            <button
              type="button"
              onClick={() => setIsDescriptionOpen((open) => !open)}
              className="mt-1 text-sm font-medium text-primary underline underline-offset-4"
            >
              {isDescriptionOpen ? t("product.readLess") : t("product.readMore")}
            </button>
          </div>

          {product.altColors ? (
            <div className="flex items-center gap-3" role="radiogroup" aria-label={t("product.colorway")}>
              {(["primary", "alt"] as const).map((key) => {
                const swatch = key === "alt" ? product.altColors! : product.colors;
                return (
                  <button
                    key={key}
                    type="button"
                    role="radio"
                    aria-checked={colorway === key}
                    aria-label={`${key} colorway`}
                    onClick={() => setColorway(key)}
                    className={`h-8 w-8 rounded-full border-2 border-white ${
                      colorway === key ? "ring-2 ring-accent ring-offset-2 ring-offset-base" : ""
                    }`}
                    style={{ background: swatch.body }}
                  />
                );
              })}
            </div>
          ) : null}

          <div>
            <p className="mb-2 text-sm font-medium">{t("product.size")}</p>
            <SizeSelector product={product} selected={size} onSelect={setSize} />
          </div>

          <CustomizationFields
            isEnabled={isCustomizing}
            onToggle={setIsCustomizing}
            onNameChange={handleNameChange}
            onNumberChange={handleNumberChange}
          />

          <div ref={ctaRef}>
            <AddToCartButton price={unitPrice} disabled={!size} onAdd={handleAdd} />
          </div>
          <p className="text-center text-xs text-muted">
            {t("product.shipReturns")}
          </p>
        </div>
      </div>

      <ProductTabs product={product} />

      <StickyMobileCta
        watchRef={ctaRef}
        price={unitPrice}
        disabled={!size}
        onAdd={handleAdd}
      />
    </>
  );
}
