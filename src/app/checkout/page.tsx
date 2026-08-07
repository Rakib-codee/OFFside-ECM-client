import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout — cart, information, shipping and payment.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-5 pb-20 pt-24 md:px-8 md:pt-32">
      <h1 className="mb-8 font-display text-3xl font-semibold md:text-4xl">Checkout</h1>
      <CheckoutClient />
    </main>
  );
}
