import type { Metadata } from "next";
import TrackOrderContent from "./TrackOrderContent";

export const metadata: Metadata = {
  title: "Track Your Order",
  description: "Check the live status of your OFFside order with your order number and phone.",
};

export default function TrackOrderPage() {
  return <TrackOrderContent />;
}
