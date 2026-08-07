"use client";

import { useEffect } from "react";
import { initLocaleFromStorage, useLocaleStore, useT } from "@/lib/i18n/locale";

/**
 * EN ⇄ বাংলা switch. Also restores the saved language on first mount,
 * so it doubles as the app-wide locale initializer (it lives in the navbar,
 * which renders on every page).
 */
export default function LanguageToggle() {
  const locale = useLocaleStore((state) => state.locale);
  const setLocale = useLocaleStore((state) => state.setLocale);
  const t = useT();

  useEffect(() => {
    initLocaleFromStorage();
  }, []);

  return (
    <button
      type="button"
      onClick={() => setLocale(locale === "en" ? "bn" : "en")}
      aria-label={t("nav.langToggle")}
      className="rounded-lg px-2 py-1.5 text-sm font-semibold text-secondary transition-colors hover:bg-elevated hover:text-primary"
    >
      {locale === "en" ? "বাং" : "EN"}
    </button>
  );
}
