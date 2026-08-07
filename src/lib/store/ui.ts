"use client";

import { create } from "zustand";

interface UiState {
  isCartOpen: boolean;
  isMenuOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleMenu: () => void;
  closeMenu: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  isCartOpen: false,
  isMenuOpen: false,
  openCart: () => set({ isCartOpen: true, isMenuOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen, isCartOpen: false })),
  closeMenu: () => set({ isMenuOpen: false }),
}));
