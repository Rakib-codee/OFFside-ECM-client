import type { Metadata } from "next";
import TransitionLink from "@/components/fx/TransitionLink";

export const metadata: Metadata = {
  title: "Account",
  description: "Track orders and manage your OFFside account.",
};

export default function AccountPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-[600px] flex-col items-center justify-center px-5 py-32 text-center">
      <h1 className="font-display text-4xl font-semibold">Your locker room</h1>
      <p className="mt-4 text-secondary">
        Accounts are coming soon. For now, order updates land straight in your inbox — check your
        confirmation email to track a delivery.
      </p>
      <TransitionLink
        href="/shop"
        className="mt-10 rounded-lg bg-white px-10 py-4 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-accent hover:text-white active:scale-95"
      >
        Back to the shop
      </TransitionLink>
    </main>
  );
}
