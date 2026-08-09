import { NextResponse } from "next/server";
import { isAdminRequest } from "@/lib/admin-auth";
import { sendCustomerOrderEmail, sendShopOrderEmail } from "@/lib/email";
import {
  deleteOrder,
  generateOrderNo,
  getOrderById,
  insertOrder,
  isDbConfigured,
  listOrders,
  ORDER_STATUSES,
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
  // Notifications are best-effort — never block the customer
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
  // Customer gets the billing receipt now; the pretty confirmation follows
  // when the admin confirms the order from the dashboard
  await Promise.all([
    sendShopOrderEmail(record),
    sendCustomerOrderEmail(record, origin, "received"),
  ]);

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
  // Confirming an order triggers the customer's confirmation email (once)
  const previous = status === "confirmed" ? await getOrderById(id) : null;
  const ok = await updateOrderStatus(id, status as OrderStatus);
  if (!ok) {
    return NextResponse.json({ error: "Update failed" }, { status: 502 });
  }
  if (previous && previous.status !== "confirmed" && previous.customer.email) {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin;
    await sendCustomerOrderEmail(previous, origin, "confirmed");
  }
  return NextResponse.json({ ok: true });
}

/** Admin: delete an order permanently. */
export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const ok = await deleteOrder(id);
  if (!ok) {
    return NextResponse.json({ error: "Delete failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
