import { NextResponse } from "next/server";
import { isDbConfigured, supabaseRest } from "@/lib/supabase";

const ORDER_NO_PATTERN = /^OFF-\d{6}$/i;
const BD_PHONE_PATTERN = /^01[3-9]\d{8}$/;

/**
 * Public order tracking: order number + the phone it was placed with.
 * Returns only status-level information — never the address.
 */
export async function POST(request: Request) {
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  let body: { orderNo?: string; phone?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const orderNo = String(body.orderNo ?? "").trim().toUpperCase();
  const phone = String(body.phone ?? "").replace(/[\s-]/g, "");
  if (!ORDER_NO_PATTERN.test(orderNo) || !BD_PHONE_PATTERN.test(phone)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const response = await supabaseRest(
    `orders?order_no=eq.${encodeURIComponent(orderNo)}&customer->>phone=eq.${encodeURIComponent(phone)}` +
      "&select=order_no,status,created_at,total,items",
    { method: "GET" },
  );
  if (!response.ok) {
    return NextResponse.json({ error: "unavailable" }, { status: 502 });
  }
  const rows = (await response.json()) as {
    order_no: string;
    status: string;
    created_at: string;
    total: number;
    items: { quantity: number }[];
  }[];
  const order = rows[0];
  if (!order) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  return NextResponse.json({
    orderNo: order.order_no,
    status: order.status,
    placedAt: order.created_at,
    total: order.total,
    itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
  });
}
