import { NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { isAdminRequest } from "@/lib/admin-auth";
import { CATALOG_TAG, getSettings, type ShopSettings } from "@/lib/catalog";
import { isDbConfigured, supabaseRest } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ settings: await getSettings(), dbReady: isDbConfigured() });
}

/** Admin: update delivery charges and the free-delivery threshold. */
export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDbConfigured()) {
    return NextResponse.json({ error: "Database not configured" }, { status: 503 });
  }

  let body: Partial<ShopSettings>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const next: ShopSettings = {
    dhakaRate: sanitizeRate(body.dhakaRate),
    outsideRate: sanitizeRate(body.outsideRate),
    freeShippingThreshold: sanitizeRate(body.freeShippingThreshold),
  };
  if ([next.dhakaRate, next.outsideRate, next.freeShippingThreshold].some((v) => v === -1)) {
    return NextResponse.json({ error: "All values must be numbers of 0 or more" }, { status: 400 });
  }

  const response = await supabaseRest("settings?on_conflict=id", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ id: 1, data: next }),
  });
  if (!response.ok) {
    console.error("Settings save failed:", response.status, await response.text());
    return NextResponse.json(
      { error: "Could not save settings — is the settings table created?" },
      { status: 502 },
    );
  }
  revalidateTag(CATALOG_TAG, { expire: 0 });
  return NextResponse.json({ ok: true, settings: next });
}

function sanitizeRate(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 && parsed <= 100000 ? Math.round(parsed) : -1;
}
