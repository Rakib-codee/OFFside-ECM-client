import type { Metadata } from "next";
import CheckoutClient from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Secure checkout — cart, information, shipping and payment.",
};

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-[1100px] px-5 pb-20 pt-24 md:px-8 md:pt-32">
      <CheckoutClient />
    </main>
  );
}
