import type { OrderStatus } from "@/lib/orders";

/** Shape of a row from the Supabase orders table, as served by GET /api/orders. */
export interface AdminOrder {
  id: string;
  created_at: string;
  order_no: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    zone: string;
  };
  items: {
    productId?: string;
    team: string;
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
    customName?: string;
    customNumber?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_ref: string | null;
  status: OrderStatus;
}

/** Badge/select tint per status — text color + translucent background. */
export const STATUS_STYLES: Record<OrderStatus, string> = {
  new: "text-accent bg-accent/10 border-accent/40",
  confirmed: "text-accent-alt bg-accent-alt/10 border-accent-alt/40",
  shipped: "text-[#f59e0b] bg-[#f59e0b]/10 border-[#f59e0b]/40",
  delivered: "text-success bg-success/10 border-success/40",
  cancelled: "text-muted bg-elevated border-line",
};

/** Human labels for delivery zone keys (keys stay stable in the DB). */
export function zoneLabel(zone: string): string {
  if (zone === "campus") return "KU Campus";
  if (zone === "dhaka") return "Inside Khulna";
  if (zone === "outside") return "Outside Khulna";
  return zone;
}

/** BD numbers (01XXXXXXXXX) need the 88 country prefix for wa.me. */
export function whatsAppLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits.startsWith("88") ? digits : `88${digits}`}`;
}

export function formatOrderDate(isoDate: string): string {
  return new Date(isoDate).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function csvEscape(value: string | number): string {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

/** Builds a spreadsheet of the given orders (UTF-8 BOM keeps Bangla intact in Excel). */
export function buildOrdersCsv(orders: AdminOrder[]): string {
  const header = [
    "Order",
    "Date",
    "Customer",
    "Phone",
    "Address",
    "District",
    "Zone",
    "Items",
    "Subtotal",
    "Shipping",
    "Total",
    "Payment",
    "TrxID",
    "Status",
  ];
  const rows = orders.map((order) => [
    order.order_no,
    new Date(order.created_at).toLocaleString("en-GB"),
    order.customer.name,
    order.customer.phone,
    order.customer.address,
    order.customer.district,
    order.customer.zone,
    order.items
      .map(
        (item) =>
          `${item.quantity}× ${item.team} ${item.name} (${item.size})` +
          (item.customName ? ` ${item.customName}` : "") +
          (item.customNumber ? ` #${item.customNumber}` : ""),
      )
      .join("; "),
    order.subtotal,
    order.shipping,
    order.total,
    order.payment_method,
    order.payment_ref ?? "",
    order.status,
  ]);
  return (
    "﻿" + [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\r\n")
  );
}

export function downloadCsv(csv: string): void {
  const date = new Date().toISOString().slice(0, 10);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `offside-orders-${date}.csv`;
  anchor.click();
  URL.revokeObjectURL(url);
}
