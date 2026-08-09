import { getCatalog, getSettings } from "./catalog";
import { ALL_SIZES, CUSTOMIZATION_PRICE, getEffectivePrice } from "./products";
import { shippingFor, type DeliveryZone } from "./shipping";
import { isDbConfigured, supabaseRest } from "./supabase";
import type { Size } from "./types";

export { isDbConfigured };

/**
 * Server-side order handling: validation with server-recomputed prices,
 * persistence via the Supabase REST API and optional email notification.
 * Everything degrades gracefully when env vars are missing.
 */

export type PaymentMethod = "cod" | "bkash" | "nagad" | "sslcommerz";

export const ORDER_STATUSES = ["new", "confirmed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

const BD_PHONE_PATTERN = /^01[3-9]\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ITEMS_PER_ORDER = 20;
const MAX_QUANTITY_PER_ITEM = 10;

export interface OrderItemInput {
  productId: string;
  size: Size;
  quantity: number;
  customName?: string;
  customNumber?: string;
}

export interface OrderInput {
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
  };
  zone: DeliveryZone;
  paymentMethod: PaymentMethod;
  paymentRef?: string;
  items: OrderItemInput[];
  locale?: string;
}

export interface PricedOrderItem extends OrderItemInput {
  team: string;
  name: string;
  unitPrice: number;
}

export interface OrderRecord {
  order_no: string;
  customer: OrderInput["customer"] & { zone: DeliveryZone };
  items: PricedOrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: PaymentMethod;
  payment_ref: string | null;
  status: OrderStatus;
  locale: string;
}

type ValidationResult =
  | { ok: true; record: Omit<OrderRecord, "order_no"> }
  | { ok: false; error: string };

/** Validates an incoming order and reprices it from the live catalog — client prices are never trusted. */
export async function validateAndPriceOrder(input: unknown): Promise<ValidationResult> {
  const [catalog, settings] = await Promise.all([getCatalog(), getSettings()]);
  if (typeof input !== "object" || input === null) {
    return { ok: false, error: "Invalid payload" };
  }
  const order = input as Partial<OrderInput>;
  const customer = order.customer;

  if (!customer || typeof customer !== "object") {
    return { ok: false, error: "Missing customer" };
  }
  const name = String(customer.name ?? "").trim();
  const phone = String(customer.phone ?? "").trim();
  const email = String(customer.email ?? "").trim();
  const address = String(customer.address ?? "").trim();
  const district = String(customer.district ?? "").trim();

  if (name.length < 2 || name.length > 80) {
    return { ok: false, error: "Invalid name" };
  }
  if (!BD_PHONE_PATTERN.test(phone)) {
    return { ok: false, error: "Invalid phone" };
  }
  if (email && !EMAIL_PATTERN.test(email)) {
    return { ok: false, error: "Invalid email" };
  }
  if (address.length < 5 || address.length > 300) {
    return { ok: false, error: "Invalid address" };
  }
  if (district.length < 2 || district.length > 60) {
    return { ok: false, error: "Invalid district" };
  }
  if (order.zone !== "dhaka" && order.zone !== "outside") {
    return { ok: false, error: "Invalid delivery zone" };
  }
  if (!["cod", "bkash", "nagad", "sslcommerz"].includes(order.paymentMethod as string)) {
    return { ok: false, error: "Invalid payment method" };
  }
  const paymentRef = String(order.paymentRef ?? "").trim();
  if ((order.paymentMethod === "bkash" || order.paymentMethod === "nagad") && paymentRef.length < 4) {
    return { ok: false, error: "Missing transaction ID" };
  }

  if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > MAX_ITEMS_PER_ORDER) {
    return { ok: false, error: "Invalid items" };
  }

  const items: PricedOrderItem[] = [];
  for (const raw of order.items) {
    const product = catalog.find((entry) => entry.id === raw?.productId);
    if (!product) {
      return { ok: false, error: "Unknown product" };
    }
    if (!ALL_SIZES.includes(raw.size) || product.soldOutSizes.includes(raw.size)) {
      return { ok: false, error: `Size unavailable for ${product.team}` };
    }
    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY_PER_ITEM) {
      return { ok: false, error: "Invalid quantity" };
    }
    const customName = String(raw.customName ?? "").trim().slice(0, 12) || undefined;
    const customNumber = String(raw.customNumber ?? "").replace(/\D/g, "").slice(0, 2) || undefined;
    const unitPrice =
      getEffectivePrice(product) + (customName || customNumber ? CUSTOMIZATION_PRICE : 0);
    items.push({
      productId: product.id,
      size: raw.size,
      quantity,
      customName,
      customNumber,
      team: product.team,
      name: product.name,
      unitPrice,
    });
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = shippingFor(order.zone, subtotal, settings);

  return {
    ok: true,
    record: {
      customer: { name, phone, email: email || undefined, address, district, zone: order.zone },
      items,
      subtotal,
      shipping,
      total: subtotal + shipping,
      payment_method: order.paymentMethod as PaymentMethod,
      payment_ref: paymentRef || null,
      status: "new",
      locale: order.locale === "bn" ? "bn" : "en",
    },
  };
}

export function generateOrderNo(): string {
  return `OFF-${Math.floor(100000 + Math.random() * 900000)}`;
}

/* ---------- Supabase REST persistence (shared helper in supabase.ts) ---------- */

export async function insertOrder(record: OrderRecord): Promise<boolean> {
  try {
    const response = await supabaseRest("orders", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(record),
    });
    if (!response.ok) {
      console.error("Order insert failed:", response.status, await response.text());
    }
    return response.ok;
  } catch (error) {
    console.error("Order insert error:", error);
    return false;
  }
}

export async function listOrders(): Promise<unknown[] | null> {
  try {
    const response = await supabaseRest("orders?select=*&order=created_at.desc&limit=200", {
      method: "GET",
    });
    if (!response.ok) {
      console.error("Order list failed:", response.status, await response.text());
      return null;
    }
    return (await response.json()) as unknown[];
  } catch (error) {
    console.error("Order list error:", error);
    return null;
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  try {
    const response = await supabaseRest(`orders?id=eq.${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      console.error("Order update failed:", response.status, await response.text());
    }
    return response.ok;
  } catch (error) {
    console.error("Order update error:", error);
    return false;
  }
}
