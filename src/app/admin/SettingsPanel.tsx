"use client";

import { useEffect, useState } from "react";
import { SetupNotice } from "./AdminClient";
import type { ShopSettings } from "@/lib/catalog";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<ShopSettings | null>(null);
  const [isDbReady, setIsDbReady] = useState(true);
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/settings");
        const body = (await response.json()) as { settings?: ShopSettings; dbReady?: boolean };
        setSettings(body.settings ?? null);
        setIsDbReady(body.dbReady ?? false);
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
    <div className="max-w-lg rounded-2xl border border-line bg-card p-6">
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
  );
}
