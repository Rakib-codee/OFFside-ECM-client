"use client";

import Image from "next/image";
import TiltCard from "@/components/fx/TiltCard";
import TransitionLink from "@/components/fx/TransitionLink";
import JerseyGraphic from "./JerseyGraphic";
import { formatPrice } from "@/lib/format";
import { ALL_SIZES, getEffectivePrice } from "@/lib/products";
import { useCartStore } from "@/lib/store/cart";
import { useLocale, useT } from "@/lib/i18n/locale";
import { localizedName, localizedTeam } from "@/lib/i18n/localize";
import { useUiStore } from "@/lib/store/ui";
import type { Product } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  className?: string;
}

export default function ProductCard({ product, className }: ProductCardProps) {
  const t = useT();
  const locale = useLocale();
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useUiStore((state) => state.openCart);
  const price = getEffectivePrice(product);

  const handleQuickAdd = () => {
    const firstAvailable =
      ALL_SIZES.find((size) => size === "M" && !product.soldOutSizes.includes(size)) ??
      ALL_SIZES.find((size) => !product.soldOutSizes.includes(size));
    if (!firstAvailable) {
      return;
    }
    addItem({
      productId: product.id,
      slug: product.slug,
      team: product.team,
      name: product.name,
      size: firstAvailable,
      unitPrice: price,
      colors: product.colors,
    });
    openCart();
  };

  return (
    <TiltCard
      className={`group relative overflow-hidden rounded-xl border border-line bg-card ${className ?? ""}`}
    >
      <TransitionLink href={`/product/${product.slug}`} className="block" data-cursor>
        <div className="relative aspect-[3/4] overflow-hidden bg-elevated">
          {product.badge ? (
            <span
              className={`absolute left-3 top-3 z-10 rounded px-2 py-1 text-xs font-semibold uppercase tracking-wide ${
                product.badge === "sale" ? "bg-accent text-white" : "bg-black text-white"
              }`}
            >
              {product.badge === "sale" && product.salePrice
                ? `${t("product.sale")} −${Math.round((1 - product.salePrice / product.price) * 100)}%`
                : t("product.new")}
            </span>
          ) : null}

          {product.images?.[0] ? (
            <div className="relative h-full w-full transition-transform duration-[600ms] ease-out group-hover:scale-[1.08]">
              <Image
                src={product.images[0]}
                alt={`${product.team} ${product.name}`}
                fill
                unoptimized
                sizes="(min-width: 768px) 320px, 70vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 transition-transform duration-[600ms] ease-out group-hover:scale-[1.08]">
              <JerseyGraphic
                colors={product.colors}
                label={`${product.team} ${product.name}`}
                className="h-full w-full"
              />
            </div>
          )}

          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-2 right-4 font-jersey text-7xl font-semibold text-white opacity-15"
          >
            {product.number}
          </span>
        </div>

        <div className="flex flex-col gap-1 p-4">
          <p className="text-sm uppercase tracking-wide text-secondary">{localizedTeam(product, locale)}</p>
          <p className="font-medium text-primary">{localizedName(product, locale)}</p>
          <p className="text-primary tnum">
            {product.salePrice ? (
              <>
                <span className="text-accent">{formatPrice(product.salePrice)}</span>{" "}
                <s className="text-muted">{formatPrice(product.price)}</s>
              </>
            ) : (
              formatPrice(product.price)
            )}
          </p>
        </div>
      </TransitionLink>

      <button
        type="button"
        onClick={handleQuickAdd}
        className="absolute bottom-[104px] left-1/2 w-[85%] -translate-x-1/2 translate-y-3 rounded-md bg-black/90 py-2.5 text-sm font-medium text-white opacity-0 transition-all duration-300 ease-out hover:bg-accent focus-visible:translate-y-0 focus-visible:opacity-100 group-hover:translate-y-0 group-hover:opacity-100"
      >
        {t("product.quickAdd")} — {formatPrice(price)}
      </button>
    </TiltCard>
  );
}
