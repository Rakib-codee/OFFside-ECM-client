"use client";

import { useRef, useState } from "react";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { useProducts } from "@/components/CatalogProvider";
import {
  formatOrderDate,
  STATUS_STYLES,
  whatsAppLink,
  type AdminOrder,
} from "./admin-utils";

const COPIED_FEEDBACK_MS = 2000;

interface OrderCardProps {
  order: AdminOrder;
  isNew: boolean;
  onStatusChange: (id: string, status: OrderStatus) => void;
}

export default function OrderCard({ order, isNew, onStatusChange }: OrderCardProps) {
  const products = useProducts();
  const [hasCopied, setHasCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleCopyAddress = async () => {
    const address = `${order.customer.name}, ${order.customer.phone}, ${order.customer.address}, ${order.customer.district}`;
    try {
      await navigator.clipboard.writeText(address);
      setHasCopied(true);
      if (copyTimer.current) {
        clearTimeout(copyTimer.current);
      }
      copyTimer.current = setTimeout(() => setHasCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard blocked — nothing actionable
    }
  };

  const actionClass =
    "rounded-lg border border-line px-3 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-primary hover:text-primary";

  return (
    <li
      className={`relative rounded-2xl border bg-card p-5 transition-shadow ${
        isNew ? "border-accent shadow-[0_0_0_1px_var(--color-accent)]" : "border-line"
      }`}
    >
      {isNew ? (
        <span className="absolute -top-2.5 left-4 rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
          New
        </span>
      ) : null}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="font-display text-lg font-semibold">{order.order_no}</span>
          <span className="ml-3 text-xs text-muted">{formatOrderDate(order.created_at)}</span>
        </div>
        <select
          value={order.status}
          onChange={(event) => onStatusChange(order.id, event.target.value as OrderStatus)}
          aria-label={`Status for ${order.order_no}`}
          className={`h-9 rounded-lg border px-2 text-sm font-medium focus:outline-none ${STATUS_STYLES[order.status]}`}
        >
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status} className="bg-card text-primary">
              {status}
            </option>
          ))}
        </select>
      </div>

      <p className="text-sm">
        <span className="font-medium">{order.customer.name}</span>
        <span className="text-secondary"> · </span>
        <span className="text-secondary tnum">{order.customer.phone}</span>
      </p>
      <p className="mb-3 text-sm text-secondary">
        {order.customer.address}, {order.customer.district} ({order.customer.zone})
      </p>

      <ul className="mb-3 border-y border-line py-2">
        {order.items.map((item, index) => {
          const product = products.find((entry) => entry.id === item.productId);
          const isCustomized = Boolean(item.customName || item.customNumber);
          return (
            <li key={index} className="flex items-center gap-3 py-1.5 text-sm text-secondary">
              {product ? (
                <span
                  className={`shrink-0 rounded bg-elevated p-0.5 ${
                    isCustomized ? "h-14 w-11" : "h-10 w-8"
                  }`}
                >
                  <JerseyGraphic
                    colors={product.colors}
                    view={isCustomized ? "back" : "front"}
                    name={item.customName}
                    number={item.customNumber}
                  />
                </span>
              ) : null}
              <span className="min-w-0 flex-1">
                <span className="block truncate">
                  {item.quantity}× {item.team} {item.name} · {item.size}
                </span>
                {isCustomized ? (
                  <span className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent/10 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-accent">
                    🖨 Print: {item.customName ?? ""}
                    {item.customNumber ? ` #${item.customNumber}` : ""}
                  </span>
                ) : null}
              </span>
              <span className="tnum">{formatPrice(item.unitPrice * item.quantity)}</span>
            </li>
          );
        })}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <a href={`tel:${order.customer.phone}`} className={actionClass}>
            📞 Call
          </a>
          <a
            href={whatsAppLink(order.customer.phone)}
            target="_blank"
            rel="noopener noreferrer"
            className={actionClass}
          >
            WhatsApp
          </a>
          <button type="button" onClick={handleCopyAddress} className={actionClass}>
            {hasCopied ? "Copied ✓" : "Copy address"}
          </button>
        </div>
        <div className="text-sm">
          <span className="text-secondary">
            {order.payment_method.toUpperCase()}
            {order.payment_ref ? <span className="tnum"> · {order.payment_ref}</span> : null}
          </span>
          <span className="ml-3 font-semibold tnum">{formatPrice(order.total)}</span>
          {order.shipping > 0 ? (
            <span className="ml-1 text-xs text-muted">
              (incl. {formatPrice(order.shipping)} delivery)
            </span>
          ) : null}
        </div>
      </div>
    </li>
  );
}
