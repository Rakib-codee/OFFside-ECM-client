"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import FilterControls from "./FilterControls";
import Reveal from "@/components/fx/Reveal";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import ProductCard from "@/components/product/ProductCard";
import {
  applyFilters,
  DEFAULT_FILTERS,
  describeActiveFilters,
  PRICE_CEILING,
  sortProducts,
  type ShopFilters,
  type SortOrder,
} from "@/lib/shop-filters";
import { useLocale, useT } from "@/lib/i18n/locale";
import type { Category } from "@/lib/types";

const PAGE_SIZE = 8;
const VALID_CATEGORIES: Category[] = ["club", "national", "retro", "training", "kids"];

export default function ShopClient() {
  const t = useT();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<ShopFilters>(DEFAULT_FILTERS);
  const [sortOrder, setSortOrder] = useState<SortOrder>("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Seed filters from the URL (?cat=, ?tag=) — render-time state adjustment
  const paramsKey = searchParams.toString();
  const [seenParamsKey, setSeenParamsKey] = useState<string | null>(null);
  if (paramsKey !== seenParamsKey) {
    setSeenParamsKey(paramsKey);
    const cat = searchParams.get("cat") as Category | null;
    const tag = searchParams.get("tag");
    setFilters((current) => ({
      ...current,
      category: cat && VALID_CATEGORIES.includes(cat) ? cat : null,
      tag: tag === "new" || tag === "sale" ? tag : null,
    }));
  }

  // ?focus=search (bottom tab bar) drops the user into the search box
  useEffect(() => {
    if (searchParams.get("focus") === "search") {
      searchRef.current?.focus();
    }
  }, [searchParams]);

  const results = useMemo(
    () => sortProducts(applyFilters(filters), sortOrder),
    [filters, sortOrder],
  );
  const visible = results.slice(0, visibleCount);
  const chips = describeActiveFilters(filters, t, locale);

  const removeChip = (key: string) => {
    if (key === "category") {
      setFilters({ ...filters, category: null });
    } else if (key === "tag") {
      setFilters({ ...filters, tag: null });
    } else if (key === "price") {
      setFilters({ ...filters, maxPrice: PRICE_CEILING });
    } else if (key === "query") {
      setFilters({ ...filters, query: "" });
    } else if (key.startsWith("team:")) {
      setFilters({ ...filters, teams: filters.teams.filter((team) => `team:${team}` !== key) });
    } else if (key.startsWith("size:")) {
      setFilters({ ...filters, sizes: filters.sizes.filter((size) => `size:${size}` !== key) });
    }
  };

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-4xl font-semibold md:text-5xl">{t("shop.title")}</h1>
          <p className="mt-2 text-secondary">
            <span className="tnum">{results.length}</span>{" "}
            {results.length === 1 ? t("shop.item") : t("shop.items")}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label htmlFor="shop-search" className="sr-only">
            {t("shop.searchLabel")}
          </label>
          <input
            id="shop-search"
            ref={searchRef}
            type="search"
            value={filters.query}
            onChange={(event) => {
              setFilters({ ...filters, query: event.target.value });
              setVisibleCount(PAGE_SIZE);
            }}
            placeholder={t("shop.searchPlaceholder")}
            className="h-11 w-full rounded-lg border border-line bg-elevated px-4 text-base text-primary placeholder:text-muted focus:border-white focus:outline-none md:w-56"
          />
          <label htmlFor="shop-sort" className="sr-only">
            {t("shop.sortLabel")}
          </label>
          <select
            id="shop-sort"
            value={sortOrder}
            onChange={(event) => setSortOrder(event.target.value as SortOrder)}
            className="h-11 rounded-lg border border-line bg-elevated px-3 text-sm text-primary focus:border-white focus:outline-none"
          >
            <option value="featured">{t("shop.sortFeatured")}</option>
            <option value="price-asc">{t("shop.sortPriceAsc")}</option>
            <option value="price-desc">{t("shop.sortPriceDesc")}</option>
            <option value="rating">{t("shop.sortRating")}</option>
          </select>
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="h-11 rounded-lg border border-line px-4 text-sm font-medium lg:hidden"
          >
            {t("shop.filters")}{chips.length > 0 ? ` (${chips.length})` : ""}
          </button>
        </div>
      </header>

      {chips.length > 0 ? (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => removeChip(chip.key)}
              className="flex animate-[chip-pop_0.2s_ease-out] items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-sm text-secondary transition-colors hover:border-accent hover:text-primary"
            >
              {chip.label}
              <span aria-hidden="true">×</span>
            </button>
          ))}
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-sm text-muted underline underline-offset-4 hover:text-primary"
          >
            {t("shop.clearAll")}
          </button>
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[240px_1fr]">
        <aside className="hidden lg:block" aria-label="Filters">
          <FilterControls
            filters={filters}
            onChange={(next) => {
              setFilters(next);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </aside>

        <div>
          {visible.length === 0 ? (
            <div className="flex flex-col items-center gap-4 py-20 text-center">
              <div className="w-32 opacity-25 motion-safe:animate-[float-slow_5s_ease-in-out_infinite]">
                <JerseyGraphic
                  colors={{ body: "#2a2a2a", sleeve: "#1a1a1a", accent: "#666666", text: "#666666" }}
                />
              </div>
              <p className="text-lg font-medium">{t("shop.noResults")}</p>
              <p className="text-sm text-secondary">{t("shop.tryAdjust")}</p>
              <button
                type="button"
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="mt-2 rounded-lg bg-cta px-6 py-2.5 text-sm font-medium text-cta-text transition-colors hover:bg-accent hover:text-white"
              >
                {t("shop.clearFilters")}
              </button>
            </div>
          ) : (
            <>
              <Reveal
                key={`${visible.length}-${chips.map((chip) => chip.key).join()}`}
                staggerChildren
                className="grid grid-cols-2 gap-4 md:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] md:gap-6"
              >
                {visible.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </Reveal>
              {results.length > visibleCount ? (
                <div className="mt-12 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-lg border border-line px-8 py-3 text-sm font-medium transition-colors hover:border-white"
                  >
                    {t("shop.showMore")}
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Mobile filter bottom sheet */}
      {isSheetOpen ? (
        <div className="fixed inset-0 z-[130] lg:hidden" role="dialog" aria-modal="true" aria-label={t("shop.filters")}>
          <button
            type="button"
            aria-label={t("shop.closeFilters")}
            onClick={() => setIsSheetOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[80dvh] overflow-y-auto rounded-t-2xl border-t border-line bg-card p-6 pb-24">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">{t("shop.filters")}</h2>
              <button
                type="button"
                onClick={() => setIsSheetOpen(false)}
                aria-label={t("shop.closeFilters")}
                className="p-1.5 text-2xl leading-none text-secondary"
              >
                ×
              </button>
            </div>
            <FilterControls
              filters={filters}
              onChange={(next) => {
                setFilters(next);
                setVisibleCount(PAGE_SIZE);
              }}
            />
            <button
              type="button"
              onClick={() => setIsSheetOpen(false)}
              className="mt-6 h-12 w-full rounded-lg bg-cta font-medium text-cta-text"
            >
              {t("shop.showResults")} ({results.length})
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
