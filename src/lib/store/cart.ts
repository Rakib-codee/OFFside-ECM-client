"use client";

import { create } from "zustand";
import type { JerseyColors, Size } from "../types";

export interface CartItem {
  /** Unique per product + size + customization combination. */
  key: string;
  productId: string;
  slug: string;
  team: string;
  name: string;
  size: Size;
  unitPrice: number;
  quantity: number;
  colors: JerseyColors;
  customName?: string;
  customNumber?: string;
}

import { DHAKA_SHIPPING_RATE, FREE_SHIPPING_THRESHOLD } from "../shipping";

export { FREE_SHIPPING_THRESHOLD };
/** The drawer estimates shipping with the Dhaka rate; checkout picks the real zone. */
export const SHIPPING_FLAT_RATE = DHAKA_SHIPPING_RATE;
const MAX_QUANTITY_PER_ITEM = 10;

interface CartState {
  items: CartItem[];
  /** Bumped on every add — drives the cart badge bounce animation. */
  addCounter: number;
  addItem: (item: Omit<CartItem, "key" | "quantity">, quantity?: number) => void;
  removeItem: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
}

function buildKey(item: Omit<CartItem, "key" | "quantity">): string {
  return [item.productId, item.size, item.customName ?? "", item.customNumber ?? ""].join("|");
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addCounter: 0,

  addItem: (item, quantity = 1) =>
    set((state) => {
      const key = buildKey(item);
      const existing = state.items.find((entry) => entry.key === key);
      const items = existing
        ? state.items.map((entry) =>
            entry.key === key
              ? { ...entry, quantity: Math.min(entry.quantity + quantity, MAX_QUANTITY_PER_ITEM) }
              : entry,
          )
        : [...state.items, { ...item, key, quantity }];
      return { items, addCounter: state.addCounter + 1 };
    }),

  removeItem: (key) =>
    set((state) => ({ items: state.items.filter((entry) => entry.key !== key) })),

  setQuantity: (key, quantity) =>
    set((state) => {
      if (quantity < 1) {
        return { items: state.items.filter((entry) => entry.key !== key) };
      }
      return {
        items: state.items.map((entry) =>
          entry.key === key
            ? { ...entry, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }
            : entry,
        ),
      };
    }),

  clear: () => set({ items: [], addCounter: 0 }),
}));

export function selectCount(state: CartState): number {
  return state.items.reduce((total, item) => total + item.quantity, 0);
}

export function selectSubtotal(state: CartState): number {
  return state.items.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
}

export function selectShipping(state: CartState): number {
  const subtotal = selectSubtotal(state);
  if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 0;
  }
  return SHIPPING_FLAT_RATE;
}
