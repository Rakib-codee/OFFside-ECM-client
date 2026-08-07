"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import LanguageToggle from "./LanguageToggle";
import ScrambleText from "@/components/fx/ScrambleText";
import TransitionLink from "@/components/fx/TransitionLink";
import { useT } from "@/lib/i18n/locale";
import { selectCount, useCartStore } from "@/lib/store/cart";
import { useUiStore } from "@/lib/store/ui";
import { NAV_LINKS, NAV_SOLID_SCROLL_Y } from "@/lib/site";

export default function Navbar() {
  const pathname = usePathname();
  const t = useT();
  const [isSolid, setIsSolid] = useState(false);
  const count = useCartStore(selectCount);
  const addCounter = useCartStore((state) => state.addCounter);
  const openCart = useUiStore((state) => state.openCart);
  const badgeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsSolid(window.scrollY > NAV_SOLID_SCROLL_Y);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Bounce the badge every time something is added to the cart
  useEffect(() => {
    if (addCounter === 0 || !badgeRef.current) {
      return;
    }
    gsap.fromTo(
      badgeRef.current,
      { scale: 1, rotation: 0 },
      {
        keyframes: [
          { scale: 1.3, rotation: -10, duration: 0.12 },
          { scale: 1.15, rotation: 10, duration: 0.12 },
          { scale: 1, rotation: 0, duration: 0.16 },
        ],
        ease: "power2.out",
      },
    );
  }, [addCounter]);

  const isActive = (href: string) => {
    const [basePath] = href.split(/[?#]/);
    return href === basePath && pathname === basePath;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-[100] transition-colors duration-300 ${
        isSolid ? "bg-base/90 backdrop-blur-md border-b border-line" : "bg-transparent"
      }`}
    >
      <nav
        aria-label="Main"
        className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-5 md:h-[72px] md:px-8"
      >
        <TransitionLink href="/" aria-label="OFFside home">
          <Logo />
        </TransitionLink>

        <ul className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.labelKey}>
              <TransitionLink
                href={link.href}
                className="group relative text-sm font-medium text-secondary transition-colors hover:text-primary"
              >
                <ScrambleText text={t(link.labelKey)} />
                <span
                  className={`absolute -bottom-1 left-0 h-px w-full origin-left bg-accent transition-transform duration-300 ${
                    isActive(link.href) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </TransitionLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1">
          <LanguageToggle />
          <ThemeToggle />
          <button
            type="button"
            onClick={openCart}
            aria-label={`${t("nav.openCart")} (${count})`}
            className="relative rounded-lg p-2 transition-colors hover:bg-elevated"
          >
            <BagIcon />
            {count > 0 ? (
              <span
                ref={badgeRef}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-white tnum"
              >
                {count}
              </span>
            ) : null}
          </button>
        </div>
      </nav>
    </header>
  );
}

function BagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 8h12l-1 12a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 20L6 8Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9 10V6a3 3 0 0 1 6 0v4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
