"use client";

import { useCallback } from "react";
import { create } from "zustand";
import { MESSAGES, type MessageKey } from "./dictionary";

export type Locale = "en" | "bn";

const LOCALE_STORAGE_KEY = "offside-locale";

interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>((set) => ({
  locale: "en",
  setLocale: (locale) => {
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    } catch {
      // Private browsing — the choice just won't persist
    }
    document.documentElement.lang = locale;
    set({ locale });
  },
}));

/** Restores the saved language after hydration (server always renders English). */
export function initLocaleFromStorage(): void {
  try {
    if (localStorage.getItem(LOCALE_STORAGE_KEY) === "bn") {
      document.documentElement.lang = "bn";
      useLocaleStore.setState({ locale: "bn" });
    }
  } catch {
    // Ignore storage errors — default locale stays English
  }
}

/** Translation hook: `const t = useT(); t("cart.title")`. */
export function useT() {
  const locale = useLocaleStore((state) => state.locale);
  return useCallback(
    (key: MessageKey): string => MESSAGES[locale][key] ?? MESSAGES.en[key],
    [locale],
  );
}

export function useLocale(): Locale {
  return useLocaleStore((state) => state.locale);
}
