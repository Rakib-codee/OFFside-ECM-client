"use client";

import { useT } from "@/lib/i18n/locale";

const THEME_STORAGE_KEY = "offside-theme";

/**
 * Dark/light switch. The current theme lives on <html class="light"> — set
 * before paint by the inline script in the root layout — so this component
 * needs no React state: icons swap via the `light:` CSS variant.
 */
export default function ThemeToggle() {
  const t = useT();
  const handleToggle = () => {
    const isLight = document.documentElement.classList.toggle("light");
    try {
      localStorage.setItem(THEME_STORAGE_KEY, isLight ? "light" : "dark");
    } catch {
      // Private browsing — theme just won't persist
    }
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t("nav.themeToggle")}
      className="rounded-lg p-2 text-secondary transition-colors hover:bg-elevated hover:text-primary"
    >
      <span className="light:hidden">
        <SunIcon />
      </span>
      <span className="hidden light:inline">
        <MoonIcon />
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="4.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6l1.5 1.5m9.8 9.8 1.5 1.5m0-12.8-1.5 1.5M7.1 16.9l-1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}
