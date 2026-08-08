"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/orders";

export interface AdminOrder {
  id: string;
  created_at: string;
  order_no: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
    address: string;
    district: string;
    zone: string;
  };
  items: {
    team: string;
    name: string;
    size: string;
    quantity: number;
    unitPrice: number;
    customName?: string;
    customNumber?: string;
  }[];
  subtotal: number;
  shipping: number;
  total: number;
  payment_method: string;
  payment_ref: string | null;
  status: OrderStatus;
}

interface AdminClientProps {
  isAuthed: boolean;
  isPasswordConfigured: boolean;
  isDbReady: boolean;
  initialOrders: AdminOrder[] | null;
}

/** The shop owner's order dashboard — intentionally English-only and simple. */
export default function AdminClient({
  isAuthed,
  isPasswordConfigured,
  isDbReady,
  initialOrders,
}: AdminClientProps) {
  if (!isPasswordConfigured) {
    return (
      <Shell>
        <SetupNotice title="Admin access is not configured">
          Set <code className="text-accent">ADMIN_PASSWORD</code> in your environment (e.g.
          Vercel project settings or <code>.env.local</code>) and redeploy to enable this page.
        </SetupNotice>
      </Shell>
    );
  }

  return (
    <Shell>
      {isAuthed ? (
        <Dashboard isDbReady={isDbReady} initialOrders={initialOrders} />
      ) : (
        <LoginForm />
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-[1100px] px-5 pb-20 pt-24 md:px-8 md:pt-32">
      <h1 className="mb-8 font-display text-3xl font-semibold md:text-4xl">Orders</h1>
      {children}
    </main>
  );
}

function SetupNotice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-8">
      <h2 className="mb-2 font-display text-xl font-semibold">{title}</h2>
      <p className="text-sm leading-relaxed text-secondary">{children}</p>
    </div>
  );
}

function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        const body = (await response.json()) as { error?: string };
        throw new Error(body.error || "Login failed");
      }
      window.location.reload();
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : "Login failed");
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-sm rounded-2xl border border-line bg-card p-8">
      <label htmlFor="admin-password" className="mb-2 block text-sm font-medium">
        Admin password
      </label>
      <input
        id="admin-password"
        type="password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        className="mb-4 h-12 w-full rounded-lg border border-line bg-elevated px-4 text-base text-primary focus:border-primary focus:outline-none"
      />
      {error ? (
        <p role="alert" className="mb-4 text-sm text-accent">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting || password.length === 0}
        className="h-12 w-full rounded-lg bg-cta font-medium text-cta-text transition-colors hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}

function Dashboard({
  isDbReady,
  initialOrders,
}: {
  isDbReady: boolean;
  initialOrders: AdminOrder[] | null;
}) {
  const [orders, setOrders] = useState<AdminOrder[] | null>(initialOrders);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    try {
      const response = await fetch("/api/orders");
      const body = (await response.json()) as { orders?: AdminOrder[]; error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Failed to load orders");
      }
      setOrders(body.orders ?? []);
      setError(body.error ?? "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load orders");
      setOrders([]);
    }
  };

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    setOrders(
      (current) =>
        current?.map((order) => (order.id === id ? { ...order, status } : order)) ?? current,
    );
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

  if (!isDbReady) {
    return (
      <SetupNotice title="Database is not connected yet">
        Create a free Supabase project, run the SQL from the README to create the{" "}
        <code>orders</code> table, then set <code className="text-accent">SUPABASE_URL</code> and{" "}
        <code className="text-accent">SUPABASE_SERVICE_ROLE_KEY</code> in your environment.
        Until then, orders still reach you via WhatsApp/Messenger and email.
      </SetupNotice>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
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
          onClick={handleLogout}
          className="rounded-lg border border-line px-4 py-2 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          Log out
        </button>
        {error ? <span className="text-sm text-accent">{error}</span> : null}
      </div>

      {orders === null ? (
        <p className="py-12 text-center text-secondary">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="py-12 text-center text-secondary">No orders yet.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li key={order.id} className="rounded-2xl border border-line bg-card p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="font-display text-lg font-semibold">{order.order_no}</span>
                  <span className="ml-3 text-xs text-muted">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>
                <select
                  value={order.status}
                  onChange={(event) =>
                    handleStatusChange(order.id, event.target.value as OrderStatus)
                  }
                  aria-label={`Status for ${order.order_no}`}
                  className="h-9 rounded-lg border border-line bg-elevated px-2 text-sm focus:border-primary focus:outline-none"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <p className="text-sm">
                <span className="font-medium">{order.customer.name}</span>
                <span className="text-secondary"> · </span>
                <a href={`tel:${order.customer.phone}`} className="text-accent-alt tnum">
                  {order.customer.phone}
                </a>
              </p>
              <p className="mb-3 text-sm text-secondary">
                {order.customer.address}, {order.customer.district} ({order.customer.zone})
              </p>

              <ul className="mb-3 border-y border-line py-2 text-sm text-secondary">
                {order.items.map((item, index) => (
                  <li key={index} className="flex justify-between py-0.5">
                    <span>
                      {item.quantity}× {item.team} {item.name} · {item.size}
                      {item.customName ? ` · ${item.customName}` : ""}
                      {item.customNumber ? ` #${item.customNumber}` : ""}
                    </span>
                    <span className="tnum">{formatPrice(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <span className="text-secondary">
                  {order.payment_method.toUpperCase()}
                  {order.payment_ref ? (
                    <span className="tnum"> · TrxID {order.payment_ref}</span>
                  ) : null}
                </span>
                <span className="font-semibold tnum">
                  {formatPrice(order.total)}
                  {order.shipping > 0 ? (
                    <span className="ml-1 text-xs font-normal text-muted">
                      (incl. {formatPrice(order.shipping)} delivery)
                    </span>
                  ) : null}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
