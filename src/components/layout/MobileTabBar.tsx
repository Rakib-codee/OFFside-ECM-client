"use client";

import { usePathname } from "next/navigation";
import TransitionLink from "@/components/fx/TransitionLink";
import { selectCount, useCartStore } from "@/lib/store/cart";
import { useUiStore } from "@/lib/store/ui";

/** Thumb-zone bottom navigation, only rendered on small screens. */
export default function MobileTabBar() {
  const pathname = usePathname();
  const count = useCartStore(selectCount);
  const openCart = useUiStore((state) => state.openCart);
  const toggleMenu = useUiStore((state) => state.toggleMenu);

  const tabClass = (isTabActive: boolean) =>
    `flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
      isTabActive ? "text-primary" : "text-muted"
    }`;

  return (
    <nav
      aria-label="Bottom navigation"
      className="fixed inset-x-0 bottom-0 z-[110] flex h-16 items-center justify-around border-t border-line bg-base/95 backdrop-blur-md md:hidden"
    >
      <TransitionLink href="/" className={tabClass(pathname === "/")}>
        <HomeIcon />
        Home
      </TransitionLink>
      <TransitionLink href="/shop" className={tabClass(pathname === "/shop")}>
        <ShirtIcon />
        Shop
      </TransitionLink>
      <TransitionLink href="/shop?focus=search" className={tabClass(false)}>
        <SearchIcon />
        Search
      </TransitionLink>
      <button type="button" onClick={openCart} className={tabClass(false)} aria-label={`Open cart, ${count} items`}>
        <span className="relative">
          <BagIcon />
          {count > 0 ? (
            <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[9px] font-semibold text-white tnum">
              {count}
            </span>
          ) : null}
        </span>
        Cart
      </button>
      <button type="button" onClick={toggleMenu} className={tabClass(false)} aria-label="Open menu">
        <MenuIcon />
        Menu
      </button>
    </nav>
  );
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 11 12 4l8 7v8a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1v-8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function ShirtIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="m9 4-5 3 2 4 2-1v10h8V10l2 1 2-4-5-3a3 3 0 0 1-6 0Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="m16 16 4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 8h12l-1 12a2 2 0 0 1-2 1.8H9A2 2 0 0 1 7 20L6 8Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
