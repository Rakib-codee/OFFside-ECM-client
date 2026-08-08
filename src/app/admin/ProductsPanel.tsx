"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import JerseyGraphic from "@/components/product/JerseyGraphic";
import ProductForm from "./ProductForm";
import { SetupNotice } from "./AdminClient";
import { formatPrice } from "@/lib/format";
import { PRODUCTS } from "@/lib/products";
import type { ProductRow } from "@/lib/catalog";
import type { Product } from "@/lib/types";

type EditorState = { mode: "closed" } | { mode: "new" } | { mode: "edit"; row: ProductRow };

export default function ProductsPanel() {
  const [rows, setRows] = useState<ProductRow[] | null | "missing">(null);
  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });
  const [error, setError] = useState("");
  const [isBusy, setIsBusy] = useState(false);

  const loadRows = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/products");
      const body = (await response.json()) as { rows?: ProductRow[] | null; error?: string };
      if (!response.ok) {
        throw new Error(body.error || "Failed to load products");
      }
      setRows(body.rows === null ? "missing" : (body.rows ?? []));
      setError(body.rows === null ? (body.error ?? "") : "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load products");
      setRows("missing");
    }
  }, []);

  useEffect(() => {
    void (async () => {
      await loadRows();
    })();
  }, [loadRows]);

  const saveProduct = async (
    product: Product,
    isActive: boolean,
    sortOrder: number,
  ): Promise<string | null> => {
    const response = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product, isActive, sortOrder }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      return body.error || "Could not save the product";
    }
    setEditor({ mode: "closed" });
    await loadRows();
    return null;
  };

  const handleDelete = async (row: ProductRow) => {
    if (!window.confirm(`Delete "${row.data.team} ${row.data.name}" permanently?`)) {
      return;
    }
    setIsBusy(true);
    const response = await fetch(`/api/admin/products?id=${encodeURIComponent(row.id)}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      setError("Delete failed — try again.");
    }
    await loadRows();
    setIsBusy(false);
  };

  const handleToggleActive = async (row: ProductRow) => {
    setIsBusy(true);
    await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product: row.data, isActive: !row.is_active, sortOrder: row.sort_order }),
    });
    await loadRows();
    setIsBusy(false);
  };

  const handleSeed = async () => {
    setIsBusy(true);
    setError("");
    for (const [index, product] of PRODUCTS.entries()) {
      const response = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product, isActive: true, sortOrder: index }),
      });
      if (!response.ok) {
        setError("Import stopped — check the products table exists and try again.");
        break;
      }
    }
    await loadRows();
    setIsBusy(false);
  };

  if (rows === "missing") {
    return (
      <SetupNotice title="Products table not ready">
        {error ? `${error}. ` : ""}Run the catalog SQL from the README in your Supabase SQL editor
        (it creates the <code>products</code> and <code>settings</code> tables), then reopen this tab.
        The shop keeps using the built-in catalog until then.
      </SetupNotice>
    );
  }

  if (rows === null) {
    return <p className="py-12 text-center text-secondary">Loading products…</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {editor.mode !== "closed" ? (
        <ProductForm
          initial={editor.mode === "edit" ? editor.row.data : null}
          initialActive={editor.mode === "edit" ? editor.row.is_active : true}
          onSave={(product, isActive) =>
            saveProduct(
              product,
              isActive,
              editor.mode === "edit" ? editor.row.sort_order : rows.length,
            )
          }
          onCancel={() => setEditor({ mode: "closed" })}
        />
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setEditor({ mode: "new" })}
            className="h-11 rounded-lg bg-cta px-6 text-sm font-medium text-cta-text transition-colors hover:bg-accent hover:text-white"
          >
            + Add product
          </button>
          {rows.length === 0 ? (
            <button
              type="button"
              onClick={() => void handleSeed()}
              disabled={isBusy}
              className="h-11 rounded-lg border border-line px-6 text-sm font-medium transition-colors hover:border-primary disabled:opacity-60"
            >
              {isBusy ? "Importing…" : "Import built-in catalog (12 jerseys)"}
            </button>
          ) : null}
          {error ? <span className="text-sm text-accent">{error}</span> : null}
        </div>
      )}

      {rows.length === 0 && editor.mode === "closed" ? (
        <p className="py-8 text-center text-sm text-secondary">
          No products in the database yet — the shop is showing the built-in catalog.
          Import it above to start editing, or add products one by one.
        </p>
      ) : null}

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
        {rows.map((row) => (
          <li
            key={row.id}
            className={`flex flex-col overflow-hidden rounded-2xl border border-line bg-card ${
              row.is_active ? "" : "opacity-60"
            }`}
          >
            <div className="relative aspect-[3/4] bg-elevated">
              {row.data.images?.[0] ? (
                <Image
                  src={row.data.images[0]}
                  alt={`${row.data.team} ${row.data.name}`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 240px, 45vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-4">
                  <JerseyGraphic colors={row.data.colors} className="h-full w-full" />
                </div>
              )}
              {!row.is_active ? (
                <span className="absolute left-2 top-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
                  Hidden
                </span>
              ) : null}
              {row.data.badge ? (
                <span
                  className={`absolute right-2 top-2 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ${
                    row.data.badge === "sale" ? "bg-accent" : "bg-black/70"
                  }`}
                >
                  {row.data.badge}
                </span>
              ) : null}
            </div>
            <div className="flex flex-1 flex-col gap-1 p-3">
              <p className="truncate text-xs uppercase tracking-wider text-secondary">{row.data.team}</p>
              <p className="truncate text-sm font-medium">{row.data.name}</p>
              <p className="text-sm tnum">
                {row.data.salePrice ? (
                  <>
                    <span className="text-accent">{formatPrice(row.data.salePrice)}</span>{" "}
                    <s className="text-muted">{formatPrice(row.data.price)}</s>
                  </>
                ) : (
                  formatPrice(row.data.price)
                )}
              </p>
              <div className="mt-auto flex gap-1.5 pt-2">
                <button
                  type="button"
                  onClick={() => setEditor({ mode: "edit", row })}
                  className="flex-1 rounded-lg border border-line px-2 py-1.5 text-xs font-medium transition-colors hover:border-primary"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void handleToggleActive(row)}
                  disabled={isBusy}
                  className="flex-1 rounded-lg border border-line px-2 py-1.5 text-xs font-medium text-secondary transition-colors hover:border-primary hover:text-primary"
                >
                  {row.is_active ? "Hide" : "Show"}
                </button>
                <button
                  type="button"
                  onClick={() => void handleDelete(row)}
                  disabled={isBusy}
                  aria-label={`Delete ${row.data.team} ${row.data.name}`}
                  className="rounded-lg border border-accent/40 px-2.5 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/10"
                >
                  ✕
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
