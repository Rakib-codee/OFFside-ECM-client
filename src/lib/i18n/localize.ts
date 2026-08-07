import { PRODUCTS } from "../products";
import type { Product, Review } from "../types";
import type { Locale } from "./locale";

/** Pick the Bangla variant of catalog content when available. */

export function localizedTeam(product: Product, locale: Locale): string {
  return locale === "bn" && product.teamBn ? product.teamBn : product.team;
}

export function localizedName(product: Product, locale: Locale): string {
  return locale === "bn" && product.nameBn ? product.nameBn : product.name;
}

export function localizedDescription(product: Product, locale: Locale): string {
  return locale === "bn" && product.descriptionBn ? product.descriptionBn : product.description;
}

export function localizedQuote(review: Review, locale: Locale): string {
  return locale === "bn" && review.quoteBn ? review.quoteBn : review.quote;
}

export function localizedTeamById(productId: string, fallback: string, locale: Locale): string {
  const product = PRODUCTS.find((entry) => entry.id === productId);
  return product ? localizedTeam(product, locale) : fallback;
}

export function localizedNameById(productId: string, fallback: string, locale: Locale): string {
  const product = PRODUCTS.find((entry) => entry.id === productId);
  return product ? localizedName(product, locale) : fallback;
}

/** Bangla label for a team name string (used by shop filters). */
export function localizedTeamLabel(team: string, locale: Locale): string {
  if (locale !== "bn") {
    return team;
  }
  const product = PRODUCTS.find((entry) => entry.team === team);
  return product?.teamBn ?? team;
}
