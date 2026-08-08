"use client";

import { useRef, useState } from "react";
import { ALL_SIZES } from "@/lib/products";
import type { Category, Product, Size } from "@/lib/types";

const CATEGORIES: Category[] = ["club", "national", "retro", "training", "kids"];

const BLANK: Product = {
  id: "",
  slug: "",
  team: "",
  name: "",
  category: "club",
  price: 549,
  number: 10,
  colors: { body: "#b3122f", sleeve: "#7d0c20", accent: "#ffffff", text: "#ffffff" },
  rating: 4.8,
  reviewCount: 0,
  description: "",
  soldOutSizes: [],
};

interface ProductFormProps {
  initial: Product | null;
  initialActive: boolean;
  onSave: (product: Product, isActive: boolean) => Promise<string | null>;
  onCancel: () => void;
}

export default function ProductForm({ initial, initialActive, onSave, onCancel }: ProductFormProps) {
  const [draft, setDraft] = useState<Product>(initial ?? BLANK);
  const [isActive, setIsActive] = useState(initialActive);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const update = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));

  const updateColor = (key: keyof Product["colors"], value: string) =>
    setDraft((current) => ({ ...current, colors: { ...current.colors, [key]: value } }));

  const toggleSoldOut = (size: Size) =>
    setDraft((current) => ({
      ...current,
      soldOutSizes: current.soldOutSizes.includes(size)
        ? current.soldOutSizes.filter((entry) => entry !== size)
        : [...current.soldOutSizes, size],
    }));

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    setIsUploading(true);
    setError("");
    try {
      for (const file of Array.from(files)) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("/api/admin/upload", { method: "POST", body: form });
        const body = (await response.json()) as { url?: string; error?: string };
        if (!response.ok || !body.url) {
          throw new Error(body.error || "Upload failed");
        }
        setDraft((current) => ({
          ...current,
          images: [...(current.images ?? []), body.url!].slice(0, 6),
        }));
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setIsUploading(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    const saveError = await onSave(draft, isActive);
    if (saveError) {
      setError(saveError);
      setIsSaving(false);
    }
  };

  const inputClass =
    "h-11 w-full rounded-lg border border-line bg-elevated px-3 text-sm text-primary focus:border-primary focus:outline-none";
  const labelClass = "flex flex-col gap-1.5 text-xs font-medium uppercase tracking-wider text-secondary";

  return (
    <div className="rounded-2xl border border-line bg-card p-6">
      <h3 className="mb-5 font-display text-xl font-semibold">
        {initial ? `Edit: ${initial.team} ${initial.name}` : "Add product"}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          Team (English)
          <input className={inputClass} value={draft.team} onChange={(e) => update("team", e.target.value)} />
        </label>
        <label className={labelClass}>
          Team (Bangla)
          <input className={inputClass} value={draft.teamBn ?? ""} onChange={(e) => update("teamBn", e.target.value || undefined)} />
        </label>
        <label className={labelClass}>
          Product name (English)
          <input className={inputClass} value={draft.name} onChange={(e) => update("name", e.target.value)} />
        </label>
        <label className={labelClass}>
          Product name (Bangla)
          <input className={inputClass} value={draft.nameBn ?? ""} onChange={(e) => update("nameBn", e.target.value || undefined)} />
        </label>

        <label className={labelClass}>
          Category
          <select className={inputClass} value={draft.category} onChange={(e) => update("category", e.target.value as Category)}>
            {CATEGORIES.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className={labelClass}>
          Badge
          <select
            className={inputClass}
            value={draft.badge ?? ""}
            onChange={(e) => update("badge", (e.target.value || undefined) as Product["badge"])}
          >
            <option value="">none</option>
            <option value="new">new</option>
            <option value="sale">sale</option>
          </select>
        </label>

        <label className={labelClass}>
          Price (৳)
          <input type="number" min={1} className={inputClass} value={draft.price} onChange={(e) => update("price", Number(e.target.value))} />
        </label>
        <label className={labelClass}>
          Sale price (৳, optional)
          <input
            type="number"
            min={0}
            className={inputClass}
            value={draft.salePrice ?? ""}
            onChange={(e) => update("salePrice", e.target.value ? Number(e.target.value) : undefined)}
          />
        </label>

        <label className={labelClass}>
          Display number (back of jersey)
          <input type="number" min={0} max={99} className={inputClass} value={draft.number} onChange={(e) => update("number", Number(e.target.value))} />
        </label>
        <div className={labelClass}>
          Jersey colors (body / sleeve / accent / text)
          <div className="flex items-center gap-2">
            {(["body", "sleeve", "accent", "text"] as const).map((key) => (
              <input
                key={key}
                type="color"
                aria-label={`${key} color`}
                value={draft.colors[key]}
                onChange={(e) => updateColor(key, e.target.value)}
                className="h-11 w-11 cursor-pointer rounded-lg border border-line bg-elevated"
              />
            ))}
          </div>
        </div>

        <label className={`${labelClass} sm:col-span-2`}>
          Description (English)
          <textarea rows={2} className="rounded-lg border border-line bg-elevated p-3 text-sm text-primary focus:border-primary focus:outline-none" value={draft.description} onChange={(e) => update("description", e.target.value)} />
        </label>
        <label className={`${labelClass} sm:col-span-2`}>
          Description (Bangla)
          <textarea rows={2} className="rounded-lg border border-line bg-elevated p-3 text-sm text-primary focus:border-primary focus:outline-none" value={draft.descriptionBn ?? ""} onChange={(e) => update("descriptionBn", e.target.value || undefined)} />
        </label>

        <div className={`${labelClass} sm:col-span-2`}>
          Sold-out sizes
          <div className="flex flex-wrap gap-2">
            {ALL_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => toggleSoldOut(size)}
                aria-pressed={draft.soldOutSizes.includes(size)}
                className={`h-9 min-w-[44px] rounded-full border px-3 text-sm transition-colors ${
                  draft.soldOutSizes.includes(size)
                    ? "border-accent bg-accent/10 text-accent line-through"
                    : "border-line text-secondary hover:text-primary"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className={`${labelClass} sm:col-span-2`}>
          Photos (first = front, second = back — leave empty to use the drawn jersey)
          <div className="flex flex-wrap items-center gap-3">
            {(draft.images ?? []).map((image, index) => (
              <span key={image} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={image} alt={`Photo ${index + 1}`} className="h-20 w-16 rounded-lg border border-line object-cover" />
                <button
                  type="button"
                  aria-label={`Remove photo ${index + 1}`}
                  onClick={() =>
                    update("images", (draft.images ?? []).filter((entry) => entry !== image))
                  }
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-white"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => void handleUpload(e.target.files)}
              className="text-xs text-secondary file:mr-3 file:rounded-lg file:border file:border-line file:bg-elevated file:px-3 file:py-2 file:text-xs file:text-primary"
            />
            {isUploading ? <span className="text-xs text-secondary">Uploading…</span> : null}
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="h-4 w-4 accent-[#ff3b30]" />
          Visible in the shop
        </label>
      </div>

      {error ? (
        <p role="alert" className="mt-4 text-sm text-accent">{error}</p>
      ) : null}

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving || isUploading}
          className="h-11 rounded-lg bg-cta px-6 text-sm font-medium text-cta-text transition-colors hover:bg-accent hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving…" : "Save product"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="h-11 rounded-lg border border-line px-6 text-sm font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
