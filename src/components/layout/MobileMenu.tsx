"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import TransitionLink from "@/components/fx/TransitionLink";
import { useT } from "@/lib/i18n/locale";
import { useUiStore } from "@/lib/store/ui";
import { NAV_LINKS } from "@/lib/site";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";

/** Full-screen overlay menu with staggered link reveals (mobile only). */
export default function MobileMenu() {
  const t = useT();
  const isMenuOpen = useUiStore((state) => state.isMenuOpen);
  const closeMenu = useUiStore((state) => state.closeMenu);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) {
      return;
    }

    if (isMenuOpen) {
      const reduced = prefersReducedMotion();
      gsap.set(overlay, { display: "flex" });
      gsap.fromTo(overlay, { opacity: 0 }, { opacity: 1, duration: 0.25 });
      gsap.fromTo(
        overlay.querySelectorAll("[data-menu-link]"),
        reduced ? { opacity: 0 } : { opacity: 0, y: 32 },
        { opacity: 1, y: 0, duration: 0.5, stagger: reduced ? 0 : 0.07, ease: EASE_OUT, delay: 0.1 },
      );
    } else {
      gsap.to(overlay, {
        opacity: 0,
        duration: 0.2,
        onComplete: () => gsap.set(overlay, { display: "none" }),
      });
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeMenu]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[120] hidden flex-col bg-base/95 px-8 pb-28 pt-24 opacity-0 backdrop-blur-xl"
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menu")}
    >
      <button
        type="button"
        onClick={closeMenu}
        aria-label={t("nav.closeMenu")}
        className="absolute right-5 top-5 rounded-lg p-2 text-2xl leading-none text-secondary hover:text-primary"
      >
        ×
      </button>
      <nav aria-label="Mobile">
        <ul className="flex flex-col gap-6">
          {[...NAV_LINKS, { labelKey: "nav.account" as const, href: "/account" }].map((link) => (
            <li key={link.labelKey} data-menu-link>
              <TransitionLink
                href={link.href}
                onNavigate={closeMenu}
                className="font-display text-4xl font-semibold text-primary"
              >
                {t(link.labelKey)}
              </TransitionLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
