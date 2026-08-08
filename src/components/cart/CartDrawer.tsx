"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import TransitionLink from "@/components/fx/TransitionLink";
import QtyStepper from "./QtyStepper";
import { formatPrice } from "@/lib/format";
import { useLocale, useT } from "@/lib/i18n/locale";
import { localizedNameById, localizedTeamById } from "@/lib/i18n/localize";
import { useProducts, useSettings } from "@/components/CatalogProvider";
import { shippingFor } from "@/lib/shipping";
import { EASE_OUT, prefersReducedMotion } from "@/lib/motion";
import { selectSubtotal, useCartStore } from "@/lib/store/cart";
import { useUiStore } from "@/lib/store/ui";

const MOBILE_QUERY = "(max-width: 767px)";

export default function CartDrawer() {
  const t = useT();
  const locale = useLocale();
  const products = useProducts();
  const settings = useSettings();
  const isCartOpen = useUiStore((state) => state.isCartOpen);
  const closeCart = useUiStore((state) => state.closeCart);
  const items = useCartStore((state) => state.items);
  const setQuantity = useCartStore((state) => state.setQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const subtotal = useCartStore(selectSubtotal);
  const shipping = shippingFor("dhaka", subtotal, settings);

  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Park the panel off-screen with GSAP itself (CSS transform/translate
  // classes would fight GSAP's transform model), then reveal it. Must run
  // before the open/close effect below.
  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) {
      return;
    }
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    gsap.set(panel, {
      xPercent: isMobile ? 0 : 100,
      yPercent: isMobile ? 100 : 0,
      visibility: "visible",
    });
  }, []);

  // Slide the panel in from the right (bottom sheet on mobile)
  useEffect(() => {
    const backdrop = backdropRef.current;
    const panel = panelRef.current;
    if (!backdrop || !panel) {
      return;
    }
    const isMobile = window.matchMedia(MOBILE_QUERY).matches;
    const closedTransform = isMobile ? { xPercent: 0, yPercent: 100 } : { xPercent: 100, yPercent: 0 };
    const duration = prefersReducedMotion() ? 0 : 0.4;

    if (isCartOpen) {
      document.body.style.overflow = "hidden";
      gsap.set(backdrop, { display: "block" });
      gsap.to(backdrop, { opacity: 1, duration: duration * 0.75 });
      gsap.fromTo(panel, closedTransform, { xPercent: 0, yPercent: 0, duration, ease: EASE_OUT });
      const rows = panel.querySelectorAll("[data-cart-item]");
      if (rows.length > 0 && duration > 0) {
        gsap.fromTo(
          rows,
          { x: 40, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.35, stagger: 0.05, delay: 0.15, ease: EASE_OUT },
        );
      }
      closeButtonRef.current?.focus();
    } else {
      document.body.style.overflow = "";
      gsap.to(panel, { ...closedTransform, duration: duration * 0.9, ease: "power3.in" });
      gsap.to(backdrop, {
        opacity: 0,
        duration: duration * 0.75,
        onComplete: () => gsap.set(backdrop, { display: "none" }),
      });
    }
  }, [isCartOpen]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeCart();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeCart]);

  const total = subtotal + shipping;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      <div
        ref={backdropRef}
        onClick={closeCart}
        aria-hidden="true"
        className="fixed inset-0 z-[130] hidden bg-black/60 opacity-0"
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("cart.title")}
        className="invisible fixed bottom-0 right-0 z-[140] flex h-[92dvh] w-full flex-col rounded-t-2xl border-t border-line bg-card md:top-0 md:h-full md:max-w-md md:rounded-none md:border-l md:border-t-0"
      >
        <header className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-display text-lg font-semibold">
            {t("cart.title")} {itemCount > 0 ? `(${itemCount})` : ""}
          </h2>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeCart}
            aria-label={t("cart.close")}
            className="rounded-lg p-1.5 text-2xl leading-none text-secondary transition-colors hover:text-primary"
          >
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
            <div className="h-32 w-28 opacity-30">
              <JerseyGraphic
                colors={{ body: "#2a2a2a", sleeve: "#1a1a1a", accent: "#666666", text: "#666666" }}
              />
            </div>
            <p className="text-secondary">{t("cart.empty")}</p>
            <button
              type="button"
              onClick={closeCart}
              className="text-sm font-medium text-primary underline underline-offset-4 hover:text-accent"
            >
              {t("cart.continue")}
            </button>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6 py-4">
              {items.map((item) => (
                <li
                  key={item.key}
                  data-cart-item
                  className="group flex gap-4 border-b border-line py-4 last:border-b-0"
                >
                  <div className="h-20 w-16 shrink-0 rounded-lg bg-elevated p-1.5">
                    <JerseyGraphic
                      colors={item.colors}
                      view={item.customName || item.customNumber ? "back" : "front"}
                      name={item.customName}
                      number={item.customNumber}
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <p className="truncate text-xs uppercase tracking-wider text-secondary">{localizedTeamById(products, item.productId, item.team, locale)}</p>
                    <p className="truncate text-sm font-medium">{localizedNameById(products, item.productId, item.name, locale)}</p>
                    <p className="text-xs text-muted">
                      {t("cart.size")} {item.size}
                      {item.customName ? ` · ${item.customName}` : ""}
                      {item.customNumber ? ` #${item.customNumber}` : ""}
                    </p>
                    <div className="mt-1 flex items-center justify-between">
                      <QtyStepper
                        value={item.quantity}
                        onChange={(next) => setQuantity(item.key, next)}
                        label={`Quantity for ${item.team} ${item.name}`}
                      />
                      <span className="text-sm font-medium tnum">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(item.key)}
                    aria-label={`${t("cart.remove")}: ${item.team} ${item.name}`}
                    className="self-start p-1 text-muted opacity-100 transition-opacity hover:text-accent md:opacity-0 md:group-hover:opacity-100"
                  >
                    <TrashIcon />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="border-t border-line px-6 py-5">
              <dl className="mb-4 flex flex-col gap-1.5 text-sm">
                <div className="flex justify-between text-secondary">
                  <dt>{t("cart.subtotal")}</dt>
                  <dd className="tnum">{formatPrice(subtotal)}</dd>
                </div>
                <div className="flex justify-between text-secondary">
                  <dt>{t("cart.shipping")}</dt>
                  <dd className="tnum">{shipping === 0 ? t("cart.free") : formatPrice(shipping)}</dd>
                </div>
                <div className="flex justify-between text-base font-semibold text-primary">
                  <dt>{t("cart.total")}</dt>
                  <dd className="tnum">{formatPrice(total)}</dd>
                </div>
              </dl>
              <TransitionLink
                href="/checkout"
                onNavigate={closeCart}
                className="flex h-14 w-full items-center justify-center rounded-lg bg-cta font-medium text-cta-text transition-all hover:-translate-y-0.5 hover:bg-accent hover:text-white"
              >
                {t("cart.checkout")}
              </TransitionLink>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}

function TrashIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M5 7h14M10 7V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2m-6 4v6m4-6v6M7 7l1 12a2 2 0 0 0 2 1.8h4A2 2 0 0 0 16 19l1-12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

