"use client";

import { useState } from "react";
import Dashboard from "./Dashboard";
import type { AdminOrder } from "./admin-utils";

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

export function SetupNotice({ title, children }: { title: string; children: React.ReactNode }) {
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
