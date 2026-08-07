import type { Metadata } from "next";
import { Suspense } from "react";
import ShopClient from "@/components/shop/ShopClient";

export const metadata: Metadata = {
  title: "Shop All Jerseys",
  description: "Club kits, national teams, retro classics, training and kids jerseys.",
};

export default function ShopPage() {
  return (
    <main className="mx-auto max-w-[1400px] px-5 pb-20 pt-24 md:px-8 md:pt-32">
      <Suspense>
        <ShopClient />
      </Suspense>
    </main>
  );
}
