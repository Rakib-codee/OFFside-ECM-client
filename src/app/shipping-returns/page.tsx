import type { Metadata } from "next";
import ShippingContent from "./ShippingContent";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "Delivery charges, timelines across Bangladesh, and our exchange policy.",
};

export default function ShippingReturnsPage() {
  return <ShippingContent />;
}
