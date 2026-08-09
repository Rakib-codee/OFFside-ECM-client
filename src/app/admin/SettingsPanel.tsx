"use client";

import { useEffect, useState } from "react";
import { SetupNotice } from "./AdminClient";
import type { ShopSettings } from "@/lib/catalog";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [isDbReady, setIsDbReady] = useState(true);
  const [emailStatus, setEmailStatus] = useState<{ configured: boolean; shopEmailSet: boolean } | null>(null);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const body = (await response.json()) as {
          settings?: ShopSettings;
          dbReady?: boolean;
          emailConfigured?: boolean;
          shopEmailSet?: boolean;
        };
        setSettings(body.settings ?? null);
        setIsDbReady(body.dbReady ?? false);
        setEmailStatus({
          configured: body.emailConfigured ?? false,
          shopEmailSet: body.shopEmailSet ?? false,
        });
      } catch {
        setMessage({ kind: "error", text: "Failed to load settings" });
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!settings) {
      return;
    }
    setIsSaving(true);
    setMessage(null);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Save failed");
      }
      setMessage({ kind: "ok", text: "Saved — the site updates within a few seconds." });
    } catch (saveError) {
      setMessage({
        kind: "error",
        text: saveError instanceof Error ? saveError.message : "Save failed",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isDbReady && settings) {
    return (
      <SetupNotice title="Database is not connected">
        Delivery charges are using the built-in defaults. Connect Supabase and create the{" "}
        <code>settings</code> table (SQL in the README) to edit them here.
      </SetupNotice>
    );
  }

  if (!settings) {
    return <p className="py-12 text-center text-secondary">Loading settings…</p>;
  }

  const fields: { key: keyof ShopSettings; label: string; hint: string }[] = [
    { key: "dhakaRate", label: "Delivery charge — Inside Dhaka (৳)", hint: "Charged when the subtotal is below the free-delivery amount" },
    { key: "outsideRate", label: "Delivery charge — Outside Dhaka (৳)", hint: "For orders shipped outside Dhaka" },
    { key: "freeShippingThreshold", label: "Free delivery from (৳)", hint: "Orders at or above this subtotal ship free" },
  ];

  return (
    <div className="flex max-w-lg flex-col gap-6">
      {emailStatus ? (
        <div className="rounded-2xl border border-line bg-card p-6">
          <h3 className="mb-3 font-display text-xl font-semibold">Order emails</h3>
          {emailStatus.configured ? (
            <p className="text-sm text-success">
              ✓ Connected — customers who give an email get a branded confirmation
              {emailStatus.shopEmailSet ? "; the shop is notified too." : "."}
            </p>
          ) : (
            <div className="text-sm leading-relaxed text-secondary">
              <p className="mb-2 font-medium text-accent">✗ Not connected — no emails are being sent.</p>
              <ol className="list-inside list-decimal space-y-1">
                <li>Create a free account at resend.com and copy an API key</li>
                <li>Put it in <code className="text-primary">RESEND_API_KEY</code> in <code>.env.local</code> (or Vercel env)</li>
                <li>Restart the server</li>
              </ol>
              <p className="mt-2 text-muted">
                Note: the default sender only delivers to your own Resend account email.
                Verify your domain in Resend and set <code>ORDER_EMAIL_FROM</code> to reach real customers.
              </p>
            </div>
          )}
          <p className="mt-3 text-xs text-muted">
            Preview the customer email:{" "}
            <a href="/api/admin/email-preview?locale=en" target="_blank" className="text-accent-alt underline">English</a>
            {" · "}
            <a href="/api/admin/email-preview?locale=bn" target="_blank" className="text-accent-alt underline">বাংলা</a>
          </p>
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-card p-6">
      <h3 className="mb-5 font-display text-xl font-semibold">Delivery charges</h3>
      <div className="flex flex-col gap-4">
        {fields.map((field) => (
          <label key={field.key} className="flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wider text-secondary">
            {field.label}
            <input
              type="number"
              min={0}
              value={settings[field.key]}
              onChange={(event) =>
                setSettings({ ...settings, [field.key]: Number(event.target.value) })
              }
              className="h-11 w-full rounded-lg border border-line bg-elevated px-3 text-sm text-primary tnum focus:border-primary focus:outline-none"
            />
            <span className="normal-case tracking-normal text-muted">{field.hint}</span>
          </label>
        ))}
      </div>
      {message ? (
        <p role="status" className={`mt-4 text-sm ${message.kind === "ok" ? "text-success" : "text-accent"}`}>
          {message.text}
        </p>
      ) : null}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isSaving}
        className="mt-5 h-11 rounded-lg bg-cta px-6 text-sm font-medium text-cta-text transition-colors hover:bg-accent hover:text-white disabled:opacity-60"
      >
        {isSaving ? "Saving…" : "Save settings"}
      </button>
      </div>
    </div>
  );
}
