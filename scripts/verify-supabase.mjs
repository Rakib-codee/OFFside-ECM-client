#!/usr/bin/env node
/**
 * Verifies the Supabase order wiring end-to-end:
 *   1. env vars present  2. orders table exists  3. insert + delete a test row
 *
 * Usage: node scripts/verify-supabase.mjs   (reads .env.local automatically)
 */

import { readFileSync } from "node:fs";

// --- Load .env.local (plain parser, no dependency) ---
try {
  const envFile = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  for (const line of envFile.split("\n")) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]] && match[2]) {
      process.env[match[1]] = match[2].trim();
    }
  }
} catch {
  // No .env.local — rely on the shell environment
}

const url = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const CREATE_TABLE_SQL = `
create table orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  order_no text not null,
  customer jsonb not null,
  items jsonb not null,
  subtotal int not null,
  shipping int not null,
  total int not null,
  payment_method text not null,
  payment_ref text,
  status text not null default 'new',
  locale text
);
alter table orders enable row level security;`;

function fail(message) {
  console.error(`\n✗ ${message}`);
  process.exit(1);
}

if (!url) fail("SUPABASE_URL is empty in .env.local");
if (!key) {
  fail(
    "SUPABASE_SERVICE_ROLE_KEY is empty in .env.local\n" +
      "  → Supabase dashboard → Project Settings → API keys → copy the service_role key",
  );
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

console.log(`Checking ${url} …`);

// 1. Table exists?
const probe = await fetch(`${url}/rest/v1/orders?select=id&limit=1`, { headers });
if (probe.status === 404 || probe.status === 400) {
  console.error(`\n✗ The "orders" table does not exist yet (HTTP ${probe.status}).`);
  console.error("  → Open the Supabase dashboard → SQL Editor and run:\n");
  console.error(CREATE_TABLE_SQL);
  process.exit(1);
}
if (probe.status === 401 || probe.status === 403) {
  fail(`Key rejected (HTTP ${probe.status}) — make sure you copied the service_role key, not anon.`);
}
if (!probe.ok) {
  fail(`Unexpected response: HTTP ${probe.status} — ${await probe.text()}`);
}
console.log("✓ orders table exists");

// 2. Insert a test order
const testOrder = {
  order_no: `TEST-${Date.now()}`,
  customer: {
    name: "Wiring Test",
    phone: "01700000000",
    address: "Test address",
    district: "Dhaka",
    zone: "dhaka",
  },
  items: [{ productId: "p01", team: "Test", name: "Test", size: "M", quantity: 1, unitPrice: 1 }],
  subtotal: 1,
  shipping: 0,
  total: 1,
  payment_method: "cod",
  payment_ref: null,
  status: "cancelled",
  locale: "en",
};
const insert = await fetch(`${url}/rest/v1/orders`, {
  method: "POST",
  headers: { ...headers, Prefer: "return=representation" },
  body: JSON.stringify(testOrder),
});
if (!insert.ok) {
  fail(`Insert failed: HTTP ${insert.status} — ${await insert.text()}`);
}
const [inserted] = await insert.json();
console.log(`✓ test order inserted (${inserted.order_no})`);

// 3. Clean up
const cleanup = await fetch(`${url}/rest/v1/orders?id=eq.${inserted.id}`, {
  method: "DELETE",
  headers,
});
console.log(cleanup.ok ? "✓ test order removed" : `⚠ cleanup returned HTTP ${cleanup.status}`);

// 4. Catalog tables (products/settings) — optional, power the admin catalog editor
const CATALOG_SQL = `
create table products (
  id text primary key,
  sort_order int not null default 0,
  is_active boolean not null default true,
  data jsonb not null,
  updated_at timestamptz not null default now()
);
alter table products enable row level security;

create table settings (
  id int primary key,
  data jsonb not null
);
alter table settings enable row level security;`;

let missingCatalog = false;
for (const table of ["products", "settings"]) {
  const check = await fetch(`${url}/rest/v1/${table}?select=*&limit=1`, { headers });
  if (check.ok) {
    console.log(`✓ ${table} table exists`);
  } else {
    missingCatalog = true;
    console.log(`⚠ ${table} table missing`);
  }
}
if (missingCatalog) {
  console.log("\n⚠ Admin catalog editing is inactive. To enable it, run this in the Supabase SQL editor:\n");
  console.log(CATALOG_SQL);
  console.log("\n  The shop keeps working with the built-in catalog meanwhile.");
}

console.log("\n✅ Database wiring is complete — real orders will be saved.");
console.log("   Set the same env vars in Vercel when you deploy.");
