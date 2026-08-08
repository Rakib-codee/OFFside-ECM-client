import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  generateOrderNo,
  insertOrder,
  isDbConfigured,
  listOrders,
  ORDER_STATUSES,
  sendOrderEmail,
  updateOrderStatus,
  validateAndPriceOrder,
  type OrderStatus,
} from "@/lib/orders";

/** Customer-facing: place an order. Works without a database (saved: false). */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = await validateAndPriceOrder(body);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  const record = { ...result.record, order_no: generateOrderNo() };

  let saved = false;
  if (isDbConfigured()) {
    saved = await insertOrder(record);
  }
  // Notification is best-effort — never blocks the customer
  await sendOrderEmail(record);

  return NextResponse.json({
    orderNo: record.order_no,
    total: record.total,
    subtotal: record.subtotal,
    shipping: record.shipping,
    saved,
  });
}

/** Admin: list recent orders. */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured", orders: [] }, { status: 200 });
  }
  const orders = await listOrders();
  if (orders === null) {
    return NextResponse.json({ error: "Failed to load orders" }, { status: 502 });
  }
  return NextResponse.json({ orders });
}

/** Admin: update an order's status. */
export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { id?: string; status?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, status } = body;
  if (!id || !ORDER_STATUSES.includes(status as OrderStatus)) {
    return NextResponse.json({ error: "Invalid id or status" }, { status: 400 });
  }
  const ok = await updateOrderStatus(id, status as OrderStatus);
  if (!ok) {
    return NextResponse.json({ error: "Update failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
