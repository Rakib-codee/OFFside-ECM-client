import { getEffectivePrice, PRODUCTS } from "./products";
import { localizedTeamLabel } from "./i18n/localize";
import type { MessageKey } from "./i18n/dictionary";
import type { Locale } from "./i18n/locale";
import type { Category, Product, Size } from "./types";

export const PRICE_CEILING = 120;

export type SortOrder = "featured" | "price-asc" | "price-desc" | "rating";

export interface ShopFilters {
  query: string;
  category: Category | null;
  teams: string[];
  sizes: Size[];
  maxPrice: number;
  tag: "new" | "sale" | null;
}

export const DEFAULT_FILTERS: ShopFilters = {
  query: "",
  category: null,
  teams: [],
  sizes: [],
  maxPrice: PRICE_CEILING,
  tag: null,
};

export const ALL_TEAMS = [...new Set(PRODUCTS.map((product) => product.team))].sort();

export const CATEGORY_LABEL_KEYS: Record<Category, MessageKey> = {
  club: "cat.club",
  national: "cat.national",
  retro: "cat.retro",
  training: "cat.training",
  kids: "cat.kids",
};

export function applyFilters(filters: ShopFilters): Product[] {
  const query = filters.query.trim().toLowerCase();
  return PRODUCTS.filter((product) => {
    if (filters.category && product.category !== filters.category) {
      return false;
    }
    if (filters.tag === "new" && product.badge !== "new") {
      return false;
    }
    if (filters.tag === "sale" && !product.salePrice) {
      return false;
    }
    if (filters.teams.length > 0 && !filters.teams.includes(product.team)) {
      return false;
    }
    if (
      filters.sizes.length > 0 &&
      filters.sizes.every((size) => product.soldOutSizes.includes(size))
    ) {
      return false;
    }
    if (getEffectivePrice(product) > filters.maxPrice) {
      return false;
    }
    if (query && !`${product.team} ${product.name}`.toLowerCase().includes(query)) {
      return false;
    }
    return true;
  });
}

export function sortProducts(products: Product[], order: SortOrder): Product[] {
  const sorted = [...products];
  switch (order) {
    case "price-asc":
      return sorted.sort((a, b) => getEffectivePrice(a) - getEffectivePrice(b));
    case "price-desc":
      return sorted.sort((a, b) => getEffectivePrice(b) - getEffectivePrice(a));
    case "rating":
      return sorted.sort((a, b) => b.rating - a.rating);
    default:
      return sorted.sort((a, b) => Number(Boolean(b.badge)) - Number(Boolean(a.badge)));
  }
}

/** Human-readable chips for every active (non-default) filter. */
export function describeActiveFilters(
  filters: ShopFilters,
  t: (key: MessageKey) => string,
  locale: Locale,
): { key: string; label: string }[] {
  const chips: { key: string; label: string }[] = [];
  if (filters.category) {
    chips.push({ key: "category", label: t(CATEGORY_LABEL_KEYS[filters.category]) });
  }
  if (filters.tag) {
    chips.push({ key: "tag", label: filters.tag === "new" ? t("shop.chipNew") : t("shop.chipSale") });
  }
  filters.teams.forEach((team) =>
    chips.push({ key: `team:${team}`, label: localizedTeamLabel(team, locale) }),
  );
  filters.sizes.forEach((size) =>
    chips.push({ key: `size:${size}`, label: `${t("cart.size")} ${size}` }),
  );
  if (filters.maxPrice < PRICE_CEILING) {
    chips.push({ key: "price", label: `${t("shop.under")} $${filters.maxPrice}` });
  }
  if (filters.query.trim()) {
    chips.push({ key: "query", label: `“${filters.query.trim()}”` });
  }
  return chips;
}
