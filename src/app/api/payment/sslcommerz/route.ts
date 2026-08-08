import { NextResponse } from "next/server";
import { validateAndPriceOrder } from "@/lib/orders";

const SANDBOX_SESSION_URL = "https://sandbox.sslcommerz.com/gwprocess/v4/api.php";
const LIVE_SESSION_URL = "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

/**
 * Creates an SSLCommerz payment session and returns the gateway redirect URL.
 * Inactive until the client registers a merchant account and sets
 * SSLCOMMERZ_STORE_ID / SSLCOMMERZ_STORE_PASSWORD (plus SSLCOMMERZ_LIVE=true
 * to leave sandbox mode).
 */
export async function POST(request: Request) {
  const storeId = process.env.SSLCOMMERZ_STORE_ID;
  const storePassword = process.env.SSLCOMMERZ_STORE_PASSWORD;
  if (!storeId || !storePassword) {
    return NextResponse.json(
      { error: "Online payment is not configured yet" },
      { status: 503 },
    );
  }

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
  const { record } = result;
  const origin = new URL(request.url).origin;

  const params = new URLSearchParams({
    store_id: storeId,
    store_passwd: storePassword,
    total_amount: String(record.total),
    currency: "BDT",
    tran_id: `OFF-${Date.now()}`,
    success_url: `${origin}/checkout/success`,
    fail_url: `${origin}/checkout`,
    cancel_url: `${origin}/checkout`,
    cus_name: record.customer.name,
    cus_email: record.customer.email ?? "no-email@offside.shop",
    cus_phone: record.customer.phone,
    cus_add1: record.customer.address,
    cus_city: record.customer.district,
    cus_country: "Bangladesh",
    shipping_method: "Courier",
    product_name: "Football jerseys",
    product_category: "Apparel",
    product_profile: "physical-goods",
  });

  const endpoint = process.env.SSLCOMMERZ_LIVE === "true" ? LIVE_SESSION_URL : SANDBOX_SESSION_URL;

  try {
    const response = await fetch(endpoint, { method: "POST", body: params });
    const session = (await response.json()) as { status?: string; GatewayPageURL?: string };
    if (session.status !== "SUCCESS" || !session.GatewayPageURL) {
      return NextResponse.json({ error: "Could not start payment session" }, { status: 502 });
    }
    return NextResponse.json({ gatewayUrl: session.GatewayPageURL });
  } catch (error) {
    console.error("SSLCommerz session error:", error);
    return NextResponse.json({ error: "Payment gateway unreachable" }, { status: 502 });
  }
}
