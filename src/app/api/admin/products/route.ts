import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { CATALOG_TAG, getCatalogRows } from "@/lib/catalog";
import { ALL_SIZES } from "@/lib/products";
import { isDbConfigured, supabaseRest } from "@/lib/supabase";
import type { Category, Product, Size } from "@/lib/types";

const CATEGORIES: Category[] = ["club", "national", "retro", "training", "kids"];
const HEX_PATTERN = /^#[0-9a-fA-F]{6}$/;
const MAX_IMAGES = 6;

function asTrimmed(value: unknown, maxLength: number): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

function asPrice(value: unknown): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 100000 ? Math.round(parsed) : null;
}

function asColors(value: unknown): Product["colors"] | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }
  const colors = value as Record<string, unknown>;
  const parsed: Record<string, string> = {};
  for (const key of ["body", "sleeve", "accent", "text"]) {
    const hex = String(colors[key] ?? "");
    if (!HEX_PATTERN.test(hex)) {
      return null;
    }
    parsed[key] = hex.toLowerCase();
  }
  return parsed as unknown as Product["colors"];
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Sanitizes an admin-submitted product; returns null with a reason on bad input. */
function validateProduct(input: unknown): { product?: Product; error?: string } {
  if (typeof input !== "object" || input === null) {
    return { error: "Invalid product payload" };
  }
  const raw = input as Record<string, unknown>;

  const team = asTrimmed(raw.team, 60);
  const name = asTrimmed(raw.name, 80);
  if (team.length < 2) return { error: "Team name is required" };
  if (name.length < 2) return { error: "Product name is required" };
  if (!CATEGORIES.includes(raw.category as Category)) return { error: "Invalid category" };

  const price = asPrice(raw.price);
  if (!price) return { error: "Invalid price" };
  const salePrice = raw.salePrice ? asPrice(raw.salePrice) : null;
  if (raw.salePrice && (!salePrice || salePrice >= price)) {
    return { error: "Sale price must be lower than the regular price" };
  }

  const colors = asColors(raw.colors);
  if (!colors) return { error: "All four jersey colors must be valid hex values" };

  const jerseyNumber = Number(raw.number);
  const soldOutSizes = Array.isArray(raw.soldOutSizes)
    ? (raw.soldOutSizes.filter((size) => ALL_SIZES.includes(size as Size)) as Size[])
    : [];
  const images = Array.isArray(raw.images)
    ? raw.images
        .map((image) => String(image))
        .filter((image) => image.startsWith("/") || image.startsWith("https://"))
        .slice(0, MAX_IMAGES)
    : [];

  const id = asTrimmed(raw.id, 40) || `p-${Date.now().toString(36)}`;
  const slug = slugify(asTrimmed(raw.slug, 80) || `${team} ${name}`) || id;
  const rating = Math.min(5, Math.max(0, Number(raw.rating) || 4.8));

  const badge = raw.badge === "new" || raw.badge === "sale" ? raw.badge : undefined;
  const product: Product = {
    id,
    slug,
    team,
    teamBn: asTrimmed(raw.teamBn, 60) || undefined,
    name,
    nameBn: asTrimmed(raw.nameBn, 80) || undefined,
    category: raw.category as Category,
    price,
    salePrice: salePrice ?? undefined,
    badge,
    number: Number.isInteger(jerseyNumber) && jerseyNumber >= 0 && jerseyNumber <= 99 ? jerseyNumber : 10,
    colors,
    rating: Math.round(rating * 10) / 10,
    reviewCount: Math.max(0, Math.floor(Number(raw.reviewCount) || 0)),
    description: asTrimmed(raw.description, 600),
    descriptionBn: asTrimmed(raw.descriptionBn, 600) || undefined,
    soldOutSizes,
    images: images.length > 0 ? images : undefined,
  };
  return { product };
}

function requireAdminAndDb(request: Request): NextResponse | null {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }
  return null;
}

/** Admin: full product rows, including inactive ones. */
export async function GET(request: Request) {
  const guard = requireAdminAndDb(request);
  if (guard) return guard;
  const rows = await getCatalogRows();
  if (rows === null) {
    return NextResponse.json(
      { error: "Products table missing — run the setup SQL from the README", rows: null },
      { status: 200 },
    );
  }
  return NextResponse.json({ rows });
}

/** Admin: create or update a product (upsert by id). */
export async function POST(request: Request) {
  const guard = requireAdminAndDb(request);
  if (guard) return guard;

  let body: { product?: unknown; sortOrder?: number; isActive?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { product, error } = validateProduct(body.product);
  if (!product) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const row = {
    id: product.id,
    sort_order: Number.isInteger(body.sortOrder) ? body.sortOrder : 0,
    is_active: body.isActive !== false,
    data: product,
    updated_at: new Date().toISOString(),
  };
  const response = await supabaseRest("products?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify(row),
  });
  if (!response.ok) {
    console.error("Product upsert failed:", response.status, await response.text());
    return NextResponse.json({ error: "Could not save the product" }, { status: 502 });
  }
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, product });
}

/** Admin: delete a product permanently. */
export async function DELETE(request: Request) {
  const guard = requireAdminAndDb(request);
  if (guard) return guard;

  const id = new URL(request.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }
  const response = await supabaseRest(`products?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  if (!response.ok) {
    console.error("Product delete failed:", response.status, await response.text());
    return NextResponse.json({ error: "Could not delete the product" }, { status: 502 });
  }
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ ok: true });
}
