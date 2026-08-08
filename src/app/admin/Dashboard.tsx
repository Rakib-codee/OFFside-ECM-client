"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import OrderCard from "./OrderCard";
import ProductsPanel from "./ProductsPanel";
import SettingsPanel from "./SettingsPanel";
import StatsCards from "./StatsCards";
import { SetupNotice } from "./AdminClient";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import {
  buildOrdersCsv,
  downloadCsv,
  STATUS_STYLES,
  type AdminOrder,
} from "./admin-utils";

const POLL_INTERVAL_MS = 30_000;

type StatusFilter = OrderStatus | "all";
type AdminTab = "orders" | "products" | "settings";
const TABS: { key: AdminTab; label: string }[] = [
  { key: "orders", label: "Orders" },
  { key: "products", label: "Products" },
  { key: "settings", label: "Settings" },
];

interface DashboardProps {
  isDbReady: boolean;
  initialOrders: AdminOrder[] | null;
}

export default function Dashboard({ isDbReady, initialOrders }: DashboardProps) {
  const [tab, setTab] = useState<AdminTab>("orders");
  const [orders, setOrders] = useState<AdminOrder[] | null>(initialOrders);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [query, setQuery] = useState("");
  // Ids already seen — orders arriving via poll outside this set get the NEW badge
  const seenIds = useRef<Set<string>>(new Set((initialOrders ?? []).map((order) => order.id)));
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const loadOrders = useCallback(async (isBackground = false) => {
    try {
      const response = await fetch("/api/orders");
      const body = (await response.json()) as { orders?: AdminOrder[]; error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Failed to load orders");
      }
      const nextOrders = body.orders ?? [];
      const arrived = nextOrders.filter((order) => !seenIds.current.has(order.id));
      setOrders(nextOrders);
      setError(body.error ?? "");
      if (isBackground && arrived.length > 0) {
        setNewIds(new Set(arrived.map((order) => order.id)));
      } else if (!isBackground) {
        setNewIds(new Set());
      }
      nextOrders.forEach((order) => seenIds.current.add(order.id));
    } catch (loadError) {
      // Background polls keep the current list; only surface the message
      setError(loadError instanceof Error ? loadError.message : "Failed to load orders");
      if (!isBackground) {
        setOrders([]);
      }
    }
  }, []);

  // 30s background poll, paused while the tab is hidden
  useEffect(() => {
    const timer = setInterval(() => {
      if (!document.hidden) {
        void loadOrders(true);
      }
    }, POLL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [loadOrders]);

  // Tab title flags unseen orders
  useEffect(() => {
    document.title = newIds.size > 0 ? `(${newIds.size} new) Orders | OFFside` : "Admin | OFFside";
  }, [newIds]);

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setOrders(
      (current) =>
        current?.map((order) => (order.id === id ? { ...order, status } : order)) ?? current,
    );
    setNewIds((current) => {
      if (!current.has(id)) {
        return current;
      }
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    const response = await fetch("/api/orders", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (!response.ok) {
      setError("Status update failed — refresh and try again.");
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" });
    window.location.reload();
  };

  const trimmedQuery = query.trim().toLowerCase();
  const filtered = (orders ?? []).filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    if (!trimmedQuery) {
      return true;
    }
    return (
      order.order_no.toLowerCase().includes(trimmedQuery) ||
      order.customer.name.toLowerCase().includes(trimmedQuery) ||
      order.customer.phone.includes(trimmedQuery)
    );
  });

  const countFor = (status: StatusFilter) =>
    status === "all"
      ? (orders ?? []).length
      : (orders ?? []).filter((order) => order.status === status).length;

  const tabBar = (
    <div className="mb-8 flex gap-2 border-b border-line">
      {TABS.map((entry) => (
        <button
          key={entry.key}
          type="button"
          onClick={() => setTab(entry.key)}
          aria-pressed={tab === entry.key}
          className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
            tab === entry.key
              ? "border-accent text-primary"
              : "border-transparent text-secondary hover:text-primary"
          }`}
        >
          {entry.label}
        </button>
      ))}
    </div>
  );

  if (tab === "products") {
    return (
      <div>
        {tabBar}
        <ProductsPanel />
      </div>
    );
  }
  if (tab === "settings") {
    return (
      <div>
        {tabBar}
        <SettingsPanel />
      </div>
    );
  }

  if (!isDbReady) {
    return (
      <div>
        {tabBar}
        <SetupNotice title="Database is not connected yet">
          Create a free Supabase project, run the SQL from the README to create the{" "}
          <code>orders</code> table, then set <code className="text-accent">SUPABASE_URL</code> and{" "}
          <code className="text-accent">SUPABASE_SERVICE_ROLE_KEY</code> in your environment.
          Until then, orders still reach you via WhatsApp/Messenger and email.
        </SetupNotice>
      </div>
    );
  }

  return (
    <div>
      {tabBar}
      <StatsCards orders={orders ?? []} />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(["all", ...ORDER_STATUSES] as StatusFilter[]).map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            aria-pressed={statusFilter === status}
            className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === status
                ? status === "all"
                  ? "border-primary bg-cta text-cta-text"
                  : STATUS_STYLES[status]
                : "border-line text-secondary hover:text-primary"
            }`}
          >
            {status} <span className="tnum">({countFor(status)})</span>
          </button>
        ))}
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search order no, name, phone…"
          aria-label="Search orders"
          className="h-10 w-full max-w-xs rounded-lg border border-line bg-elevated px-4 text-sm text-primary placeholder:text-muted focus:border-primary focus:outline-none"
        />
        <button
          type="button"
          onClick={() => {
            setOrders(null);
            setError("");
            void loadOrders();
          }}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-primary"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={() => downloadCsv(buildOrdersCsv(filtered))}
          disabled={filtered.length === 0}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-primary disabled:cursor-not-allowed disabled:opacity-50"
        >
          Export CSV ({filtered.length})
        </button>
        <button
          type="button"
          onClick={handleLogout}
          className="ml-auto rounded-lg border border-line px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          Log out
        </button>
        {error ? <span className="w-full text-sm text-accent">{error}</span> : null}
      </div>

      {orders === null ? (
        <p className="py-12 text-center text-secondary">Loading orders…</p>
      ) : filtered.length === 0 ? (
        <p className="py-12 text-center text-secondary">
          {(orders ?? []).length === 0 ? "No orders yet." : "No orders match the current filter."}
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {filtered.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              isNew={newIds.has(order.id)}
              onStatusChange={handleStatusChange}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
