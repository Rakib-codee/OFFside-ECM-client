"use client";

import { formatPrice } from "@/lib/format";
import type { AdminOrder } from "./admin-utils";

/** Four derived tiles: the shop's pulse over the loaded orders. */
export default function StatsCards({ orders }: { orders: AdminOrder[] }) {
  const now = new Date();
  const isSameDay = (iso: string) => {
    const date = new Date(iso);
    return (
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate()
    );
  };
  const isSameMonth = (iso: string) => {
    const date = new Date(iso);
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  };

  const active = orders.filter((order) => order.status !== "cancelled");
  const stats = [
    { label: "Today's orders", value: String(orders.filter((o) => isSameDay(o.created_at)).length) },
    {
      label: "Pending",
      value: String(orders.filter((o) => o.status === "new" || o.status === "confirmed").length),
    },
    {
      label: "Revenue this month",
      value: formatPrice(
        active.filter((o) => isSameMonth(o.created_at)).reduce((sum, o) => sum + o.total, 0),
      ),
    },
    {
      label: "Total revenue",
      value: formatPrice(active.reduce((sum, o) => sum + o.total, 0)),
    },
  ];

  return (
    <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-2xl border border-line bg-card p-4 md:p-5">
          <p className="text-xs uppercase tracking-wider text-secondary">{stat.label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold tnum md:text-3xl">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
