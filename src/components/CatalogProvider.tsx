"use client";

import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_SETTINGS, type ShopSettings } from "@/lib/catalog";
import { PRODUCTS } from "@/lib/products";
import type { Product } from "@/lib/types";

interface CatalogContextValue {
  products: Product[];
  settings: ShopSettings;
}

/** Defaults keep any stray consumer working even outside the provider. */
const CatalogContext = createContext<CatalogContextValue>({
  products: PRODUCTS,
  settings: DEFAULT_SETTINGS,
});

/** Server layout fetches the live catalog once and shares it with every client component. */
export function CatalogProvider({
  products,
  settings,
  children,
}: CatalogContextValue & { children: ReactNode }) {
  return (
    <CatalogContext.Provider value={{ products, settings }}>{children}</CatalogContext.Provider>
  );
}

export function useProducts(): Product[] {
  return useContext(CatalogContext).products;
}

export function useSettings(): ShopSettings {
  return useContext(CatalogContext).settings;
}
