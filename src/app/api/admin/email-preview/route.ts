import { isAdminRequest } from "@/lib/admin-auth";
import { renderCustomerOrderEmail } from "@/lib/email";
import type { OrderRecord } from "@/lib/orders";

/** Admin-only: preview the customer confirmation email with sample data.
 *  /api/admin/email-preview?locale=bn */
export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return new Response("Unauthorized — sign in at /admin first", { status: 401 });
  }
  const url = new URL(request.url);
  const locale = url.searchParams.get("locale") === "bn" ? "bn" : "en";
  const variant = url.searchParams.get("variant") === "received" ? "received" : "confirmed";

  const sample: OrderRecord = {
    order_no: "OFF-482913",
    customer: {
      name: locale === "bn" ? "রাকিব হাসান" : "Rakib Hasan",
      phone: "01712345678",
      email: "customer@example.com",
      address: locale === "bn" ? "বাসা ১২, রোড ৫, ধানমন্ডি" : "House 12, Road 5, Dhanmondi",
      district: locale === "bn" ? "ঢাকা" : "Dhaka",
      zone: "dhaka",
    },
    items: [
      {
        productId: "p05",
        team: locale === "bn" ? "আর্জেন্টিনা" : "Argentina",
        name: locale === "bn" ? "জাতীয় দলের হোম ২০২৬" : "National Team Home 2026",
        size: "L",
        quantity: 1,
        unitPrice: 799,
        customName: "MESSI",
        customNumber: "10",
      },
      {
        productId: "p06",
        team: locale === "bn" ? "ব্রাজিল" : "Brazil",
        name: locale === "bn" ? "জাতীয় দলের হোম ২০২৬" : "National Team Home 2026",
        size: "M",
        quantity: 2,
        unitPrice: 649,
      },
    ],
    subtotal: 2097,
    shipping: 0,
    total: 2097,
    payment_method: "cod",
    payment_ref: null,
    status: "new",
    locale,
  };

  const { html } = renderCustomerOrderEmail(sample, url.origin, variant);
  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
