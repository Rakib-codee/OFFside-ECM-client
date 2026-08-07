"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import AnimatedPrice from "@/components/fx/AnimatedPrice";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { formatPrice } from "@/lib/format";
import { useCartStore } from "@/lib/store/cart";
import { useLocale, useT } from "@/lib/i18n/locale";
import { localizedNameById, localizedTeamById } from "@/lib/i18n/localize";

interface OrderSummaryProps {
  shippingCost: number;
}

/** Sticky summary panel with collapsible items and rolling totals. */
export default function OrderSummary({ shippingCost }: OrderSummaryProps) {
  const t = useT();
  const locale = useLocale();
  const items = useCartStore((state) => state.items);
  const [isExpanded, setIsExpanded] = useState(true);
  const listRef = useRef<HTMLUListElement>(null);

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal + shippingCost;

  useEffect(() => {
    const list = listRef.current;
    if (!list) {
      return;
    }
    if (isExpanded) {
      gsap.fromTo(
        list,
        { height: 0, opacity: 0 },
        { height: "auto", opacity: 1, duration: 0.35, ease: "power2.out" },
      );
    } else {
      gsap.to(list, { height: 0, opacity: 0, duration: 0.3, ease: "power2.in" });
    }
  }, [isExpanded]);

  return (
    <div className="rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-28">
      <button
        type="button"
        onClick={() => setIsExpanded((expanded) => !expanded)}
        aria-expanded={isExpanded}
        className="mb-4 flex w-full items-center justify-between text-left"
      >
        <h2 className="font-display text-lg font-semibold">
          {t("checkout.summary")} ({items.reduce((sum, item) => sum + item.quantity, 0)})
        </h2>
        <span
          className={`text-secondary transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      <ul ref={listRef} className="overflow-hidden">
        {items.map((item) => (
          <li key={item.key} className="flex items-center gap-3 border-b border-line py-3 last:border-b-0">
            <div className="h-14 w-11 shrink-0 rounded bg-elevated p-1">
              <JerseyGraphic
                colors={item.colors}
                view={item.customName || item.customNumber ? "back" : "front"}
                name={item.customName}
                number={item.customNumber}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {localizedTeamById(item.productId, item.team, locale)} · {localizedNameById(item.productId, item.name, locale)}
              </p>
              <p className="text-xs text-muted">
                {t("cart.size")} {item.size} × {item.quantity}
                {item.customName ? ` · ${item.customName}` : ""}
                {item.customNumber ? ` #${item.customNumber}` : ""}
              </p>
            </div>
            <span className="text-sm tnum">{formatPrice(item.unitPrice * item.quantity)}</span>
          </li>
        ))}
      </ul>

      <dl className="mt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between text-secondary">
          <dt>{t("cart.subtotal")}</dt>
          <dd>
            <AnimatedPrice value={subtotal} />
          </dd>
        </div>
        <div className="flex justify-between text-secondary">
          <dt>{t("cart.shipping")}</dt>
          <dd>{shippingCost === 0 ? t("cart.free") : <AnimatedPrice value={shippingCost} />}</dd>
        </div>
        <div className="mt-2 flex justify-between border-t border-line pt-3 text-base font-semibold">
          <dt>{t("cart.total")}</dt>
          <dd>
            <AnimatedPrice value={total} />
          </dd>
        </div>
      </dl>
    </div>
  );
}
