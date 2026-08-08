import { PRODUCTS } from "./products";
import {
  DHAKA_SHIPPING_RATE,
  FREE_SHIPPING_THRESHOLD,
  OUTSIDE_DHAKA_SHIPPING_RATE,
} from "./shipping";
import { isDbConfigured, supabaseRest } from "./supabase";
import type { Product } from "./types";

/**
 * Runtime catalog: products and shop settings live in Supabase so the admin
 * can manage them from the dashboard. Every reader falls back to the built-in
 * static catalog/defaults when the database is missing, empty or erroring —
 * the site can never break because of catalog data.
 */

export const CATALOG_TAG = "catalog";
const CATALOG_REVALIDATE_SECONDS = 300;

export interface ShopSettings {
  dhakaRate: number;
  outsideRate: number;
  freeShippingThreshold: number;
}

export const DEFAULT_SETTINGS: ShopSettings = {
  dhakaRate: DHAKA_SHIPPING_RATE,
  outsideRate: OUTSIDE_DHAKA_SHIPPING_RATE,
  freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
};

export interface ProductRow {
  id: string;
  sort_order: number;
  is_active: boolean;
  data: Product;
}

export async function getCatalog(): Promise<Product[]> {
  if (!isDbConfigured()) {
    return PRODUCTS;
  }
  try {
    const response = await supabaseRest(
      "products?select=data,is_active&order=sort_order.asc,id.asc",
      { method: "GET", revalidate: CATALOG_REVALIDATE_SECONDS, tags: [CATALOG_TAG] },
    );
    if (!response.ok) {
      return PRODUCTS;
    }
    const rows = (await response.json()) as { data: Product; is_active: boolean }[];
    const products = rows.filter((row) => row.is_active).map((row) => row.data);
    return products.length > 0 ? products : PRODUCTS;
  } catch {
    return PRODUCTS;
  }
}

/** Admin view: every row including inactive ones. Null when the table is missing. */
export async function getCatalogRows(): Promise<ProductRow[] | null> {
  if (!isDbConfigured()) {
    return null;
  }
  try {
    const response = await supabaseRest(
      "products?select=*&order=sort_order.asc,id.asc",
      { method: "GET" },
    );
    if (!response.ok) {
      return null;
    }
    return (await response.json()) as ProductRow[];
  } catch {
    return null;
  }
}

export async function getSettings(): Promise<ShopSettings> {
  if (!isDbConfigured()) {
    return DEFAULT_SETTINGS;
  }
  try {
    const response = await supabaseRest("settings?id=eq.1&select=data", {
      method: "GET",
      revalidate: CATALOG_REVALIDATE_SECONDS,
      tags: [CATALOG_TAG],
    });
    if (!response.ok) {
      return DEFAULT_SETTINGS;
    }
    const rows = (await response.json()) as { data: Partial<ShopSettings> }[];
    const stored = rows[0]?.data ?? {};
    return {
      dhakaRate: positiveOr(stored.dhakaRate, DEFAULT_SETTINGS.dhakaRate),
      outsideRate: positiveOr(stored.outsideRate, DEFAULT_SETTINGS.outsideRate),
      freeShippingThreshold: positiveOr(
        stored.freeShippingThreshold,
        DEFAULT_SETTINGS.freeShippingThreshold,
      ),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function positiveOr(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}
